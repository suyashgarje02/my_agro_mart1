const Order = require("../models/Order")
const Product = require("../models/Product")
const Payment = require("../models/Payment")
const User = require("../models/User")
const razorpay = require("../config/razorpay")
const { sendOrderConfirmationEmail } = require("../utils/email")

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, notes } = req.body

    // Validate and get product details
    let itemsTotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        })
      }

      const price = product.discountPrice || product.price
      itemsTotal += price * item.quantity

      orderItems.push({
        product: product._id,
        name: product.name,
        price: price,
        quantity: item.quantity,
        image: product.images?.[0]?.url || "",
      })
    }

    // Calculate totals
    const shippingCharges = itemsTotal > 500 ? 0 : 50 // Free shipping over ₹500
    const tax = Math.round(itemsTotal * 0.18) // 18% GST
    const totalAmount = itemsTotal + shippingCharges + tax

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      itemsTotal,
      shippingCharges,
      tax,
      totalAmount,
      notes,
    })

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user.id,
      },
    })

    // Save Razorpay order ID
    order.paymentInfo.razorpayOrderId = razorpayOrder.id
    await order.save()

    // Create payment record
    await Payment.create({
      user: req.user.id,
      order: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      receipt: `order_${order._id}`,
    })

    // Send confirmation email (non-blocking)
    const userDoc = await User.findById(req.user.id)
    if (userDoc) sendOrderConfirmationEmail(order, userDoc)

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
        key: process.env.RAZORPAY_KEY_ID,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query

    const query = { user: req.user.id }
    if (status) query.orderStatus = status

    const orders = await Order.find(query)
      .populate("items.product", "name images")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const count = await Order.countDocuments(query)

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name images")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order",
      })
    }

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query

    const query = {}
    if (status) query.orderStatus = status
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const count = await Order.countDocuments(query)

    // Calculate stats
    const stats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ])

    res.status(200).json({
      success: true,
      data: orders,
      stats: stats[0] || { totalRevenue: 0, totalOrders: 0 },
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, trackingNumber, estimatedDelivery, note } = req.body

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Update order
    order.orderStatus = orderStatus
    if (trackingNumber) order.trackingNumber = trackingNumber
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery)

    // Add status history
    order.statusHistory.push({
      status: orderStatus,
      note: note || "",
    })

    // If delivered, set delivery date
    if (orderStatus === "delivered") {
      order.deliveredAt = new Date()
    }

    await order.save()

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check ownership
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      })
    }

    // Check if order can be cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.orderStatus}`,
      })
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      })
    }

    order.orderStatus = "cancelled"
    order.statusHistory.push({
      status: "cancelled",
      note: req.body.reason || "Cancelled by user",
    })

    await order.save()

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
}

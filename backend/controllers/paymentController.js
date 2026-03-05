const crypto = require("crypto")
const Order = require("../models/Order")
const Payment = require("../models/Payment")
const Product = require("../models/Product")
const razorpay = require("../config/razorpay")

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, orderId } = req.body

    // Validate order exists and belongs to user
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      })
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${orderId}`,
      notes: {
        orderId: orderId,
        userId: req.user.id,
      },
    }

    const razorpayOrder = await razorpay.orders.create(options)

    // Update payment record
    await Payment.findOneAndUpdate({ order: orderId }, { razorpayOrderId: razorpayOrder.id }, { upsert: true })

    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body

    // Find the order
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      // Update payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: "failed",
          errorDescription: "Payment signature verification failed",
        },
      )

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      })
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id)

    // Update order payment info
    order.paymentInfo = {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      method: paymentDetails.method,
      status: "completed",
      paidAt: new Date(),
    }
    order.orderStatus = "confirmed"
    await order.save()

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "captured",
        method: paymentDetails.method,
        bank: paymentDetails.bank,
        wallet: paymentDetails.wallet,
        vpa: paymentDetails.vpa,
        cardInfo: paymentDetails.card
          ? {
              last4: paymentDetails.card.last4,
              network: paymentDetails.card.network,
              type: paymentDetails.card.type,
            }
          : undefined,
      },
    )

    // Reduce product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      })
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        order,
        paymentId: razorpay_payment_id,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Handle Razorpay webhook
// @route   POST /api/payments/webhook
// @access  Public (Razorpay webhook)
const handleWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    // Verify webhook signature
    const signature = req.headers["x-razorpay-signature"]
    const body = JSON.stringify(req.body)

    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      })
    }

    const event = req.body.event
    const payload = req.body.payload

    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(payload.payment.entity)
        break
      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity)
        break
      case "refund.created":
        await handleRefundCreated(payload.refund.entity)
        break
      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    next(error)
  }
}

// Helper function: Handle payment captured
const handlePaymentCaptured = async (payment) => {
  try {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: payment.order_id },
      {
        razorpayPaymentId: payment.id,
        status: "captured",
        method: payment.method,
      },
    )

    await Order.findOneAndUpdate(
      { "paymentInfo.razorpayOrderId": payment.order_id },
      {
        "paymentInfo.status": "completed",
        "paymentInfo.paidAt": new Date(),
        orderStatus: "confirmed",
      },
    )
  } catch (error) {
    console.error("Webhook handler error:", error)
  }
}

// Helper function: Handle payment failed
const handlePaymentFailed = async (payment) => {
  try {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: payment.order_id },
      {
        status: "failed",
        errorCode: payment.error_code,
        errorDescription: payment.error_description,
      },
    )

    await Order.findOneAndUpdate(
      { "paymentInfo.razorpayOrderId": payment.order_id },
      { "paymentInfo.status": "failed" },
    )
  } catch (error) {
    console.error("Webhook handler error:", error)
  }
}

// Helper function: Handle refund created
const handleRefundCreated = async (refund) => {
  try {
    await Payment.findOneAndUpdate(
      { razorpayPaymentId: refund.payment_id },
      {
        status: "refunded",
        refundId: refund.id,
        refundAmount: refund.amount / 100,
        refundedAt: new Date(),
      },
    )

    await Order.findOneAndUpdate(
      { "paymentInfo.razorpayPaymentId": refund.payment_id },
      {
        "paymentInfo.status": "refunded",
        orderStatus: "cancelled",
      },
    )
  } catch (error) {
    console.error("Webhook handler error:", error)
  }
}

// @desc    Get payment by order ID
// @route   GET /api/payments/order/:orderId
// @access  Private
const getPaymentByOrder = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId })
      .populate("order")
      .populate("user", "name email")

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    // Check authorization
    if (payment.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      })
    }

    res.status(200).json({
      success: true,
      data: payment,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Initiate refund (Admin only)
// @route   POST /api/payments/:paymentId/refund
// @access  Private/Admin
const initiateRefund = async (req, res, next) => {
  try {
    const { amount, reason } = req.body

    const payment = await Payment.findById(req.params.paymentId)
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment cannot be refunded",
      })
    }

    // Create refund in Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: amount ? Math.round(amount * 100) : undefined, // Full refund if no amount
      notes: { reason: reason || "Refund initiated by admin" },
    })

    // Update payment record
    payment.status = "refunded"
    payment.refundId = refund.id
    payment.refundAmount = refund.amount / 100
    payment.refundedAt = new Date()
    await payment.save()

    res.status(200).json({
      success: true,
      message: "Refund initiated successfully",
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentByOrder,
  initiateRefund,
}

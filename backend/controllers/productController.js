const Product = require("../models/Product")

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, category, minPrice, maxPrice, sort = "-createdAt", inStock } = req.query

    // Build query
    const query = { isActive: true }

    // Search by name or description
    if (search) {
      query.$text = { $search: search }
    }

    if (category) query.category = category

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number.parseFloat(minPrice)
      if (maxPrice) query.price.$lte = Number.parseFloat(maxPrice)
    }

    if (inStock === "true") query.stock = { $gt: 0 }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort)
      .select("-reviews")

    const count = await Product.countDocuments(query)

    res.status(200).json({
      success: true,
      data: products,
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

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name").populate("createdBy", "name")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    // Add creator to req.body
    req.body.createdBy = req.user.id

    const product = await Product.create(req.body)

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Soft delete - mark as inactive
    product.isActive = false
    await product.save()

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user.id)

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      })
    }

    // Add review
    product.reviews.push({
      user: req.user.id,
      rating: Number(rating),
      comment,
    })

    // Update ratings
    product.ratings.count = product.reviews.length
    product.ratings.average = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save()

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category", { isActive: true })

    res.status(200).json({
      success: true,
      data: categories,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getCategories,
}

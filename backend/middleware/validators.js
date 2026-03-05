const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body
  const errors = []

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters")
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push("Please provide a valid email")
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    })
  }

  next()
}

// Validate product data
const validateProduct = (req, res, next) => {
  const { name, description, price, category, stock } = req.body
  const errors = []

  if (!name || name.trim().length < 2) {
    errors.push("Product name must be at least 2 characters")
  }

  if (!description || description.trim().length < 10) {
    errors.push("Product description must be at least 10 characters")
  }

  if (price === undefined || price < 0) {
    errors.push("Please provide a valid price")
  }

  const validCategories = ["seeds-fertilizers", "tools-equipment", "pesticides-chemicals", "irrigation", "organic", "other"]
  if (!category || !validCategories.includes(category)) {
    errors.push("Please select a valid product category")
  }

  if (stock === undefined || stock < 0) {
    errors.push("Stock quantity must be 0 or greater")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    })
  }

  next()
}

// Validate order data
const validateOrder = (req, res, next) => {
  const { items, shippingAddress } = req.body
  const errors = []

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push("Please add at least one item to your order")
  }

  if (!shippingAddress) {
    errors.push("Shipping address is required")
  } else {
    if (!shippingAddress.street) errors.push("Street address is required")
    if (!shippingAddress.city) errors.push("City is required")
    if (!shippingAddress.state) errors.push("State is required")
    if (!shippingAddress.zipCode && !shippingAddress.pincode) errors.push("ZIP/Pin code is required")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    })
  }

  next()
}

module.exports = {
  validateRegister,
  validateProduct,
  validateOrder,
}

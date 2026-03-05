const express = require("express")
const router = express.Router()
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getCategories,
} = require("../controllers/productController")
const { protect, authorize } = require("../middleware/auth")
const { validateProduct } = require("../middleware/validators")

// Public routes
router.get("/", getProducts)
router.get("/categories", getCategories)
router.get("/:id", getProduct)

// Protected routes
router.post("/:id/reviews", protect, addReview)

// Seller or Admin routes
router.post("/", protect, authorize("admin", "seller"), validateProduct, createProduct)
router.put("/:id", protect, authorize("admin", "seller"), updateProduct)
router.delete("/:id", protect, authorize("admin", "seller"), deleteProduct)

module.exports = router

const express = require("express")
const router = express.Router()
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController")
const { protect, authorize } = require("../middleware/auth")
const { validateOrder } = require("../middleware/validators")

// All routes require authentication
router.use(protect)

// User routes
router.post("/", validateOrder, createOrder)
router.get("/", getMyOrders)
router.get("/:id", getOrder)
router.put("/:id/cancel", cancelOrder)

// Admin routes
router.get("/admin/all", authorize("admin"), getAllOrders)
router.put("/:id/status", authorize("admin"), updateOrderStatus)

module.exports = router

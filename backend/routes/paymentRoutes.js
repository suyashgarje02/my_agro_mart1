const express = require("express")
const router = express.Router()
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentByOrder,
  initiateRefund,
} = require("../controllers/paymentController")
const { protect, authorize } = require("../middleware/auth")

// Webhook route (no auth - called by Razorpay)
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook)

// Protected routes
router.post("/create-order", protect, createPaymentOrder)
router.post("/verify", protect, verifyPayment)
router.get("/order/:orderId", protect, getPaymentByOrder)

// Admin routes
router.post("/:paymentId/refund", protect, authorize("admin"), initiateRefund)

module.exports = router

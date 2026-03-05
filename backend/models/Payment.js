const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpaySignature: String,
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded", "expired"],
      default: "created",
    },
    method: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "emi", "other"],
    },
    bank: String,
    wallet: String,
    vpa: String, // UPI ID
    cardInfo: {
      last4: String,
      network: String,
      type: String,
    },
    errorCode: String,
    errorDescription: String,
    refundId: String,
    refundAmount: Number,
    refundedAt: Date,
    receipt: String,
    notes: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  },
)

// Index for queries
// Note: razorpayOrderId and razorpayPaymentId already have indexes from unique: true, so we don't need to create them again
paymentSchema.index({ user: 1, createdAt: -1 })
paymentSchema.index({ status: 1 })

module.exports = mongoose.model("Payment", paymentSchema)

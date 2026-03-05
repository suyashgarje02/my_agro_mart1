const mongoose = require("mongoose")

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide your name"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please provide your email"],
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        subject: {
            type: String,
            required: [true, "Please select a subject"],
            enum: [
                "product-inquiry",
                "rental-inquiry",
                "technical-support",
                "partnership",
                "feedback",
                "other",
            ],
        },
        message: {
            type: String,
            required: [true, "Please provide a message"],
            maxlength: [5000, "Message cannot exceed 5000 characters"],
        },
        status: {
            type: String,
            enum: ["new", "read", "replied", "closed"],
            default: "new",
        },
    },
    { timestamps: true },
)

module.exports = mongoose.model("Contact", contactSchema)

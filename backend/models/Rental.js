const mongoose = require("mongoose")

const rentalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide equipment name"],
            trim: true,
            maxlength: [200, "Name cannot exceed 200 characters"],
        },
        description: {
            type: String,
            required: [true, "Please provide a description"],
            maxlength: [2000, "Description cannot exceed 2000 characters"],
        },
        category: {
            type: String,
            required: [true, "Please provide a category"],
            enum: [
                "heavy-machinery",
                "harvesting-equipment",
                "soil-preparation",
                "spraying-equipment",
                "processing-equipment",
                "planting-equipment",
                "other",
            ],
        },
        pricePerDay: {
            type: Number,
            required: [true, "Please provide daily rental price"],
            min: [0, "Price cannot be negative"],
        },
        location: {
            type: String,
            required: [true, "Please provide location"],
            trim: true,
        },
        availability: {
            type: String,
            enum: ["available", "rented", "maintenance"],
            default: "available",
        },
        images: [
            {
                url: String,
                alt: String,
            },
        ],
        ratings: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0 },
        },
        reviews: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                rating: { type: Number, required: true, min: 1, max: 5 },
                comment: String,
                createdAt: { type: Date, default: Date.now },
            },
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
)

rentalSchema.index({ name: "text", description: "text" })
rentalSchema.index({ category: 1, pricePerDay: 1 })
rentalSchema.index({ location: 1 })

module.exports = mongoose.model("Rental", rentalSchema)

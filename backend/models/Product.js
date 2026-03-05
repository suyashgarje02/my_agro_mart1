const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Please provide a product category"],
      enum: ["seeds-fertilizers", "tools-equipment", "pesticides-chemicals", "irrigation", "organic", "other"],
    },
    brand: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    stock: {
      type: Number,
      required: [true, "Please provide stock quantity"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

// Index for search optimization
productSchema.index({ name: "text", description: "text", tags: "text" })
productSchema.index({ category: 1, price: 1 })

// Virtual for checking if product is in stock
productSchema.virtual("inStock").get(function () {
  return this.stock > 0
})

// Calculate discounted price
productSchema.virtual("finalPrice").get(function () {
  return this.discountPrice || this.price
})

module.exports = mongoose.model("Product", productSchema)

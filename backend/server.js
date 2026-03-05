const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const dotenv = require("dotenv")
const connectDB = require("./config/database")
const errorHandler = require("./middleware/errorHandler")

// Load environment variables
dotenv.config()


// Initialize Express app
const app = express()

// Connect to MongoDB
connectDB()

// Security Middleware - Set various HTTP headers for security
app.use(helmet())

// CORS Configuration - Allow frontend to communicate with backend
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, Postman) or any localhost port
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true)
      }
      const allowedOrigin = process.env.FRONTEND_URL
      if (allowedOrigin && origin === allowedOrigin) {
        return callback(null, true)
      }
      callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Request Logging - Morgan for HTTP request logging
app.use(morgan("dev"))

// Body Parser Middleware - Parse JSON and URL-encoded data
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/users", require("./routes/userRoutes"))
app.use("/api/products", require("./routes/productRoutes"))
app.use("/api/orders", require("./routes/orderRoutes"))
app.use("/api/payments", require("./routes/paymentRoutes"))
app.use("/api/rentals", require("./routes/rentalRoutes"))
app.use("/api/contact", require("./routes/contactRoutes"))
app.use("/api/wishlist", require("./routes/wishlistRoutes"))

// 404 Handler - For unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

// Global Error Handler
app.use(errorHandler)

// Start Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`❌ Error: ${err.message}`)
  // Close server & exit process
  process.exit(1)
})

module.exports = app

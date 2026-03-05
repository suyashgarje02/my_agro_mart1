const express = require("express")
const router = express.Router()
const {
    getRentals,
    getRental,
    createRental,
    updateRental,
    deleteRental,
    getMyRentals,
} = require("../controllers/rentalController")
const { protect, authorize } = require("../middleware/auth")

// Public routes
router.get("/", getRentals)
router.get("/my", protect, getMyRentals)
router.get("/:id", getRental)

// Seller/Admin routes
router.post("/", protect, authorize("seller", "admin"), createRental)
router.put("/:id", protect, updateRental)
router.delete("/:id", protect, deleteRental)

module.exports = router

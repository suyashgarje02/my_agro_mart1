const express = require("express")
const router = express.Router()
const { register, login, getMe, updateProfile, updatePassword } = require("../controllers/authController")
const { protect } = require("../middleware/auth")
const { validateRegister } = require("../middleware/validators")

// Public routes
router.post("/register", validateRegister, register)
router.post("/login", login)

// Protected routes
router.get("/me", protect, getMe)
router.put("/update-profile", protect, updateProfile)
router.put("/update-password", protect, updatePassword)

module.exports = router

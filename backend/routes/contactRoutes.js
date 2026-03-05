const express = require("express")
const router = express.Router()
const { submitContact, getContacts } = require("../controllers/contactController")
const { protect, authorize } = require("../middleware/auth")

// Public route
router.post("/", submitContact)

// Admin route
router.get("/", protect, authorize("admin"), getContacts)

module.exports = router

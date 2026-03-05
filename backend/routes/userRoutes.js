const express = require("express")
const router = express.Router()
const { getUsers, getSellers, getUser, updateUser, deleteUser, updateSellerStatus, toggleBlockUser } = require("../controllers/userController")
const { protect, authorize } = require("../middleware/auth")

router.use(protect)
router.use(authorize("admin"))

router.get("/", getUsers)
router.get("/sellers", getSellers)
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser)
router.put("/:id/seller-status", updateSellerStatus)
router.put("/:id/block", toggleBlockUser)

module.exports = router

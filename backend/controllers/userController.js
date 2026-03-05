const User = require("../models/User")
const { sendSellerStatusEmail } = require("../utils/email")

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, role, isActive } = req.query
    const query = {}
    if (search) { query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
    if (role) query.role = role
    if (isActive !== undefined) query.isActive = isActive === "true"
    const users = await User.find(query).select("-password").limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 })
    const count = await User.countDocuments(query)
    res.status(200).json({ success: true, data: users, pagination: { page: Number.parseInt(page), limit: Number.parseInt(limit), total: count, pages: Math.ceil(count / limit) } })
  } catch (error) { next(error) }
}

// @desc    Get all sellers (Admin only)
// @route   GET /api/users/sellers
// @access  Private/Admin
const getSellers = async (req, res, next) => {
  try {
    const sellers = await User.find({ role: "seller" }).select("-password").sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: sellers })
  } catch (error) { next(error) }
}

// @desc    Approve or reject a seller account (Admin only)
// @route   PUT /api/users/:id/seller-status
// @access  Private/Admin
const updateSellerStatus = async (req, res, next) => {
  try {
    const { sellerStatus, sellerNote } = req.body
    if (!["approved", "rejected"].includes(sellerStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status. Use approved or rejected." })
    }
    const user = await User.findById(req.params.id)
    if (!user || user.role !== "seller") {
      return res.status(404).json({ success: false, message: "Seller not found" })
    }
    user.sellerStatus = sellerStatus
    user.sellerNote = sellerNote || ""
    // Block seller if rejected
    if (sellerStatus === "rejected") user.isActive = false
    else user.isActive = true
    await user.save()
    // Send email notification
    await sendSellerStatusEmail(user, sellerStatus, sellerNote)
    res.status(200).json({ success: true, message: `Seller ${sellerStatus} successfully`, data: user })
  } catch (error) { next(error) }
}

// @desc    Toggle block/unblock user (Admin only)
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    user.isActive = !user.isActive
    await user.save()
    res.status(200).json({ success: true, message: `User ${user.isActive ? "unblocked" : "blocked"}`, data: user })
  } catch (error) { next(error) }
}

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    res.status(200).json({ success: true, data: user })
  } catch (error) { next(error) }
}

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, isActive, address } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, phone, role, isActive, address }, { new: true, runValidators: true }).select("-password")
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    res.status(200).json({ success: true, message: "User updated successfully", data: user })
  } catch (error) { next(error) }
}

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    user.isActive = false
    await user.save()
    res.status(200).json({ success: true, message: "User deactivated successfully" })
  } catch (error) { next(error) }
}

module.exports = { getUsers, getSellers, getUser, updateUser, deleteUser, updateSellerStatus, toggleBlockUser }


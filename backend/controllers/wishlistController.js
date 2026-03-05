const User = require("../models/User")

// @desc  Get wishlist
// @route GET /api/wishlist
// @access Private
const getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate("wishlist", "name price discountPrice images category brand stock")
        res.status(200).json({ success: true, data: user.wishlist || [] })
    } catch (error) { next(error) }
}

// @desc  Toggle wishlist item (add if not present, remove if present)
// @route POST /api/wishlist/:productId
// @access Private
const toggleWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        const productId = req.params.productId
        const idx = user.wishlist.findIndex(id => id.toString() === productId)
        let added = false
        if (idx === -1) { user.wishlist.push(productId); added = true }
        else { user.wishlist.splice(idx, 1) }
        await user.save()
        res.status(200).json({ success: true, added, message: added ? "Added to wishlist" : "Removed from wishlist" })
    } catch (error) { next(error) }
}

// @desc  Remove from wishlist
// @route DELETE /api/wishlist/:productId
// @access Private
const removeFromWishlist = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { $pull: { wishlist: req.params.productId } })
        res.status(200).json({ success: true, message: "Removed from wishlist" })
    } catch (error) { next(error) }
}

module.exports = { getWishlist, toggleWishlist, removeFromWishlist }

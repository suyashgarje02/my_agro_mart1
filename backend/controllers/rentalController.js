const Rental = require("../models/Rental")

// @desc    Get all rentals
// @route   GET /api/rentals
// @access  Public
const getRentals = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, category, location, sort = "-createdAt" } = req.query

        const query = { isActive: true }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ]
        }
        if (category) query.category = category
        if (location) query.location = { $regex: location, $options: "i" }

        const rentals = await Rental.find(query)
            .populate("owner", "name")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort)
            .select("-reviews")

        const count = await Rental.countDocuments(query)

        res.status(200).json({
            success: true,
            data: rentals,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit),
            },
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get single rental
// @route   GET /api/rentals/:id
// @access  Public
const getRental = async (req, res, next) => {
    try {
        const rental = await Rental.findById(req.params.id)
            .populate("owner", "name phone location")
            .populate("reviews.user", "name")

        if (!rental) {
            return res.status(404).json({ success: false, message: "Rental not found" })
        }

        res.status(200).json({ success: true, data: rental })
    } catch (error) {
        next(error)
    }
}

// @desc    Create rental listing
// @route   POST /api/rentals
// @access  Private (seller/admin)
const createRental = async (req, res, next) => {
    try {
        req.body.owner = req.user.id
        const rental = await Rental.create(req.body)

        res.status(201).json({
            success: true,
            message: "Rental listing created successfully",
            data: rental,
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Update rental
// @route   PUT /api/rentals/:id
// @access  Private (owner/admin)
const updateRental = async (req, res, next) => {
    try {
        let rental = await Rental.findById(req.params.id)

        if (!rental) {
            return res.status(404).json({ success: false, message: "Rental not found" })
        }

        if (rental.owner.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        res.status(200).json({
            success: true,
            message: "Rental updated successfully",
            data: rental,
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Delete rental
// @route   DELETE /api/rentals/:id
// @access  Private (owner/admin)
const deleteRental = async (req, res, next) => {
    try {
        const rental = await Rental.findById(req.params.id)

        if (!rental) {
            return res.status(404).json({ success: false, message: "Rental not found" })
        }

        if (rental.owner.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        rental.isActive = false
        await rental.save()

        res.status(200).json({ success: true, message: "Rental deleted successfully" })
    } catch (error) {
        next(error)
    }
}

// @desc    Get my rental listings
// @route   GET /api/rentals/my
// @access  Private
const getMyRentals = async (req, res, next) => {
    try {
        const rentals = await Rental.find({ owner: req.user.id, isActive: true }).sort("-createdAt")

        res.status(200).json({ success: true, data: rentals })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getRentals,
    getRental,
    createRental,
    updateRental,
    deleteRental,
    getMyRentals,
}

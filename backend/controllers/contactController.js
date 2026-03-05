const Contact = require("../models/Contact")

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
    try {
        const contact = await Contact.create(req.body)

        res.status(201).json({
            success: true,
            message: "Message sent successfully. We'll get back to you soon!",
            data: { id: contact._id },
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get all contact submissions (Admin)
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query
        const query = {}
        if (status) query.status = status

        const contacts = await Contact.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort("-createdAt")

        const count = await Contact.countDocuments(query)

        res.status(200).json({
            success: true,
            data: contacts,
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

module.exports = { submitContact, getContacts }

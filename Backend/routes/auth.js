const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/setup-admin
// @desc    Temporary route to initialize admin in cloud
// @access  Public
router.get('/setup-admin', async (req, res) => {
    try {
        const User = require('../models/User');
        const bcrypt = require('bcryptjs');
        const adminEmail = 'admin@dtcsl.com';
        const adminPass = 'admin123';
        const username = 'admin';

        const exists = await User.findOne({ username });
        if (exists) return res.json({ message: 'Admin already exists!' });

        await User.create({
            username,
            fullName: 'System Admin',
            email: adminEmail,
            password: adminPass,
            role: 'admin'
        });

        res.json({ message: '✅ Admin created successfully! You can now login.' });
    } catch (err) {
        res.status(500).json({ message: 'Error', error: err.message });
    }
});

module.exports = router;

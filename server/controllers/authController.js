// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendWelcomeEmail, sendProjectCreatedEmail, sendPasswordResetEmail } = require("../utils/emailService");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // Basic input validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }

    try {
        const userExists = await User.findOne({ email: email.toLowerCase().trim() });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash: hashed,
        });

        if (user) {
            // send welcome email (don't block the response if it fails)
            sendWelcomeEmail(user.email, user.name).catch((err) =>
                console.error('Welcome email error:', err)
            );

            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('registerUser error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // If your User model implements matchPassword as a method, use it.
        // Otherwise fallback to bcrypt.compare against passwordHash.
        let passwordMatch = false;
        if (typeof user.matchPassword === 'function') {
            passwordMatch = await user.matchPassword(password);
        } else {
            passwordMatch = await bcrypt.compare(password, user.passwordHash || '');
        }

        if (passwordMatch) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('loginUser error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private (requires auth middleware that sets req.user)
const getMe = async (req, res) => {
    try {
        // req.user should be populated by auth middleware from token
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // send back a safe user object
        const safeUser = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            // add other non-sensitive fields if present (e.g., createdAt)
            createdAt: req.user.createdAt,
        };

        return res.status(200).json(safeUser);
    } catch (error) {
        console.error('getMe error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail(user.email, resetUrl);
            res.status(200).json({ message: 'Email sent' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('forgotPassword error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            message: 'Password reset successful',
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('resetPassword error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword
};

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const usersController = require('../controllers/usersController');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, usersController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, usersController.updateProfile);

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', auth, usersController.updatePassword);

// @route   PUT /api/users/newsletter
// @desc    Update user's newsletter subscription
// @access  Private
router.put('/newsletter', auth, usersController.updateNewsletterSubscription);

module.exports = router; 
const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const { isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Get all users
router.get('/users', isAdmin, adminController.getAllUsers);

// Update user status
router.patch('/users/:userId/status', isAdmin, adminController.updateUserStatus);

// @route   PUT /api/admin/stocks/:stockId/popularity
// @desc    Toggle stock popularity
// @access  Private/Admin
router.put('/stocks/:stockId/popularity', isAdmin, adminController.toggleStockPopularity);

// @route   GET /api/admin/stocks/popular
// @desc    Get popular stocks
// @access  Private/Admin
router.get('/stocks/popular', isAdmin, adminController.getPopularStocks);

module.exports = router; 
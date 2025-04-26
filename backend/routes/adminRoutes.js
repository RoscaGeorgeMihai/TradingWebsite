const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const User = require('../models/Users');

// Get dashboard data
router.get('/dashboard', adminAuth, adminController.getDashboardData);

// Get statistics data with timeRange parameter
router.get('/statistics', adminAuth, adminController.getStatisticsData);

// Get all users
router.get('/users', adminAuth, adminController.getAllUsers);

// Get user by id
router.get('/users/:id', adminAuth, adminController.getUserById);

// Update user
router.put('/users/:id', adminAuth, adminController.updateUser);

// Update user status
router.patch('/users/:userId/status', adminAuth, adminController.updateUserStatus);

// Delete user
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// Toggle stock popularity
router.put('/stocks/:stockId/popularity', adminAuth, adminController.toggleStockPopularity);

// Get popular stocks
router.get('/stocks/popular', adminAuth, adminController.getPopularStocks);

module.exports = router;
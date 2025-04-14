const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const portfolioController = require('../controllers/portfolioController');

// @route   GET /api/portfolio
// @desc    Get user's portfolio data
// @access  Private
router.get('/', auth, portfolioController.getPortfolio);

// @route   POST /api/portfolio/assets
// @desc    Add a new asset to portfolio
// @access  Private
router.post('/assets', auth, portfolioController.addAsset);

// @route   POST /api/portfolio/sell
// @desc    Sell an asset from portfolio
// @access  Private
router.post('/sell', auth, portfolioController.sellAsset);

// @route   GET /api/portfolio/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/transactions', auth, portfolioController.getTransactions);

// @route   GET /api/portfolio/alerts
// @desc    Get user's alerts
// @access  Private
router.get('/alerts', auth, portfolioController.getAlerts);

// @route   PUT /api/portfolio/alerts/:alertId
// @desc    Mark alert as read
// @access  Private
router.put('/alerts/:alertId', auth, portfolioController.markAlertRead);

// @route   POST /api/portfolio/funds
// @desc    Update user's funds (deposit or withdraw)
// @access  Private
router.post('/funds', auth, portfolioController.updateFunds);

// @route   POST /api/portfolio/update-price
// @desc    Update asset price (could be admin only)
// @access  Private
router.post('/update-price', auth, portfolioController.updateAssetPrice);

module.exports = router;
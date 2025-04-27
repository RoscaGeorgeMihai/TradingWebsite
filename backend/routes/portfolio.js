const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const portfolioController = require('../controllers/portfolioController');

// @route   GET /api/portfolio
// @desc    Get user's portfolio data
// @access  Private
router.get('/', auth, portfolioController.getPortfolio);

// @route   GET /api/portfolio/history
// @desc    Get user's portfolio history
// @access  Private
router.get('/history', auth, portfolioController.getPortfolioHistory);

// @route   POST /api/portfolio/buy
// @desc    Buy stocks and add to portfolio
// @access  Private
router.post('/buy', auth, portfolioController.buyStock);

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
// @desc    Update asset price
// @access  Private
router.post('/update-price', auth, portfolioController.updateAssetPrice);

// @route   POST /api/portfolio/save-current-value
// @desc    Save the current portfolio value
// @access  Private
router.post('/save-current-value', auth, portfolioController.saveCurrentPortfolioValue);

// @route   POST /api/portfolio/calculate-performance
// @desc    Calculate portfolio performance based on current values
// @access  Private
router.post('/calculate-performance', auth, portfolioController.calculatePerformance);

// @route   GET /api/portfolio/distribution
// @desc    Get portfolio distribution data across all users
// @access  Private
router.get('/distribution', auth, portfolioController.getPortfolioDistribution);

// @route   POST /api/portfolio/price-alerts
// @desc    Create a new price alert
// @access  Private
router.post('/price-alerts', auth, portfolioController.createPriceAlert);

// @route   GET /api/portfolio/price-alerts
// @desc    Get user's price alerts
// @access  Private
router.get('/price-alerts', auth, portfolioController.getPriceAlerts);

// @route   DELETE /api/portfolio/price-alerts/:alertId
// @desc    Delete a price alert
// @access  Private
router.delete('/price-alerts/:alertId', auth, portfolioController.deletePriceAlert);

// @route   PUT /api/portfolio/price-alerts/:alertId
// @desc    Update a price alert
// @access  Private
router.put('/price-alerts/:alertId', auth, portfolioController.updatePriceAlert);

module.exports = router;
const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const stockController = require('../controllers/stockController');

// Get all stocks
router.get('/', auth, stockController.getAllStocks);

// Get stock by symbol
router.get('/:symbol', auth, stockController.getStockBySymbol);

// Add new stock (admin only)
router.post('/', adminAuth, stockController.addStock);

// Update stock (admin only)
router.put('/:symbol', adminAuth, stockController.updateStock);

// Delete stock (admin only)
router.delete('/:symbol', adminAuth, stockController.deleteStock);

module.exports = router; 
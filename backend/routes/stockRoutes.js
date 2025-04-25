const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { auth, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', stockController.getAllStocks);
router.get('/:symbol', stockController.getStockBySymbol);

// Protected routes that require admin role
router.post('/', auth, isAdmin, stockController.createStock);
router.put('/:symbol', auth, isAdmin, stockController.updateStock);
router.delete('/:symbol', auth, isAdmin, stockController.deleteStock);

module.exports = router; 
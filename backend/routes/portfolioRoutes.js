const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

// Buy stock route
router.post('/buy', auth, portfolioController.buyStock);

module.exports = router; 
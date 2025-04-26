const express = require('express');
const router = express.Router();
const marketstackApi = require('../services/marketstackApi');

// @route   GET /api/marketstack/quotes
// @desc    Get real-time stock quotes from Marketstack
// @access  Public
router.get('/quotes', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      return res.status(400).json({ message: 'Symbols parameter is required' });
    }

    const symbolArray = symbols.split(',');
    const quotes = await marketstackApi.getMultipleStockQuotes(symbolArray);
    
    if (!quotes) {
      return res.status(500).json({ message: 'Failed to fetch stock quotes' });
    }

    res.json(quotes);
  } catch (err) {
    console.error('Error fetching stock quotes:', err);
    res.status(500).json({ message: 'Error fetching stock quotes' });
  }
});

module.exports = router; 
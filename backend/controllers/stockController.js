const Stock = require('../models/Stock');
const { isAdmin } = require('../middleware/auth');

// Get all stocks
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get stock by symbol
exports.getStockBySymbol = async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new stock
exports.createStock = async (req, res) => {
  try {
    const stock = new Stock(req.body);
    const savedStock = await stock.save();
    res.status(201).json(savedStock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update stock
exports.updateStock = async (req, res) => {
  try {
    const stock = await Stock.findOneAndUpdate(
      { symbol: req.params.symbol },
      req.body,
      { new: true }
    );
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete stock
exports.deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findOneAndDelete({ symbol: req.params.symbol });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
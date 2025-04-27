const Stock = require('../models/Stock');
const { isAdmin } = require('../middleware/auth');

// Get all stocks
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    console.error('Error fetching stocks:', err);
    res.status(500).json({ message: 'Error fetching stocks' });
  }
};

// Get stock by symbol
exports.getStockBySymbol = async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json(stock);
  } catch (err) {
    console.error('Error fetching stock:', err);
    res.status(500).json({ message: 'Error fetching stock' });
  }
};

// Add new stock
exports.addStock = async (req, res) => {
  try {
    const { symbol, name, category, color } = req.body;

    // Check if stock already exists
    const existingStock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (existingStock) {
      return res.status(400).json({ message: 'Stock already exists' });
    }

    const stock = new Stock({
      symbol: symbol.toUpperCase(),
      name,
      category,
      color
    });

    await stock.save();
    res.status(201).json(stock);
  } catch (err) {
    console.error('Error adding stock:', err);
    res.status(500).json({ message: 'Error adding stock' });
  }
};

// Update stock
exports.updateStock = async (req, res) => {
  try {
    const { name, category, color } = req.body;
    const stock = await Stock.findOneAndUpdate(
      { symbol: req.params.symbol.toUpperCase() },
      { name, category, color },
      { new: true }
    );

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json(stock);
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(500).json({ message: 'Error updating stock' });
  }
};

// Delete stock
exports.deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findOneAndDelete({ symbol: req.params.symbol.toUpperCase() });
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json({ message: 'Stock deleted successfully' });
  } catch (err) {
    console.error('Error deleting stock:', err);
    res.status(500).json({ message: 'Error deleting stock' });
  }
};

// Get popular stocks
exports.getPopularStocks = async (req, res) => {
    try {
        const popularStocks = await Stock.find({ isPopular: true });
        res.json(popularStocks);
    } catch (err) {
        console.error('Error fetching popular stocks:', err);
        res.status(500).json({ message: 'Error fetching popular stocks' });
    }
}; 
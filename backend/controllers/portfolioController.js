const Users = require('../models/Users');
const PortfolioAsset = require('../models/PortfolioAsset');
const PortfolioTransaction = require('../models/PortfolioTransaction');
const Alert = require('../models/Alert');
const mongoose = require('mongoose');

// Get the entire portfolio data
exports.getPortfolio = async (req, res) => {
    try {
        // Get the user
        const user = await Users.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's portfolio assets
        const assets = await PortfolioAsset.find({ userId: req.user.id });
        
        // Calculate total value and allocations
        let totalValue = assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
        
        // If no assets yet, use the user's investedAmount
        if (totalValue === 0) {
            totalValue = user.investedAmount || 0;
        }

        // Get recent transactions
        const transactions = await PortfolioTransaction.find({ userId: req.user.id })
            .sort({ date: -1 })
            .limit(10);

        // Get user alerts
        const alerts = await Alert.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);

        // Calculate daily change (could be done more accurately with historical data)
        const dailyChange = assets.length > 0 ? 
            assets.reduce((sum, asset) => sum + asset.changePercent, 0) / assets.length : 0;

        // Calculate allocations and format assets
        const formattedAssets = assets.map(asset => {
            const value = asset.price * asset.quantity;
            const allocation = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
            
            // Update allocation in DB if it has changed
            if (allocation !== asset.allocation) {
                asset.allocation = allocation;
                asset.save();
            }
            
            return {
                symbol: asset.symbol,
                name: asset.name,
                price: asset.price,
                quantity: asset.quantity,
                value: value,
                changePercent: asset.changePercent,
                allocation: allocation,
                color: asset.color
            };
        });

        // Format transactions
        const formattedTransactions = transactions.map(tx => ({
            id: tx._id,
            date: tx.date.toISOString().split('T')[0],
            type: tx.type === 'buy' ? 'Cumpărare' : 'Vânzare',
            symbol: tx.symbol,
            quantity: tx.quantity,
            price: tx.price,
            total: tx.price * tx.quantity
        }));

        // Format alerts
        const formattedAlerts = alerts.map(alert => {
            const createdAt = new Date(alert.createdAt);
            const now = new Date();
            const diffHours = Math.round((now - createdAt) / (1000 * 60 * 60));
            
            return {
                id: alert._id,
                message: alert.message,
                type: alert.type,
                time: `Acum ${diffHours} ore`
            };
        });

        // Create performance data based on actual user data
        // In a real application, this would come from historical price data
        const performance = [
            { label: 'Astăzi', value: dailyChange },
            { label: 'Săptămâna aceasta', value: 0 },
            { label: 'Luna aceasta', value: 0 },
            { label: 'Anual', value: 0 },
            { label: 'Total', value: 0 }
        ];

        // Return the complete portfolio data
        res.json({
            totalValue: totalValue,
            dailyChange: dailyChange,
            assets: formattedAssets,
            transactions: formattedTransactions,
            alerts: formattedAlerts,
            performance: performance,
            otherAssets: [] // Empty array instead of hardcoded data
        });

    } catch (err) {
        console.error('Error in getPortfolio:', err.message);
        res.status(500).send('Server error');
    }
};

// Add a new asset to the portfolio
exports.addAsset = async (req, res) => {
    try {
        const { symbol, name, price, quantity, color } = req.body;

        // Validate inputs
        if (!symbol || !name || !price || !quantity) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if asset already exists for this user
        const existingAsset = await PortfolioAsset.findOne({ 
            userId: req.user.id,
            symbol: symbol
        });

        if (existingAsset) {
            // Update existing asset
            existingAsset.quantity += parseFloat(quantity);
            existingAsset.price = parseFloat(price); // Update to latest price
            
            // If color is provided, update it
            if (color) {
                existingAsset.color = color;
            }
            
            await existingAsset.save();

            // Create transaction record
            await PortfolioTransaction.create({
                userId: req.user.id,
                type: 'buy',
                symbol,
                quantity: parseFloat(quantity),
                price: parseFloat(price),
                date: new Date()
            });

            return res.json(existingAsset);
        }

        // Create new asset
        const newAsset = new PortfolioAsset({
            userId: req.user.id,
            symbol,
            name,
            price: parseFloat(price),
            quantity: parseFloat(quantity),
            changePercent: 0,
            color: color || '#' + Math.floor(Math.random()*16777215).toString(16)
        });

        await newAsset.save();

        // Create transaction record
        await PortfolioTransaction.create({
            userId: req.user.id,
            type: 'buy',
            symbol,
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            date: new Date()
        });

        // Create alert for new asset purchase
        await Alert.create({
            userId: req.user.id,
            message: `Achiziție nouă: ${quantity} ${symbol} la $${price}`,
            type: 'success'
        });

        // Update user's invested amount
        const user = await Users.findById(req.user.id);
        if (user) {
            user.investedAmount += parseFloat(price) * parseFloat(quantity);
            user.availableFunds -= parseFloat(price) * parseFloat(quantity);
            await user.save();
        }

        res.json(newAsset);
    } catch (err) {
        console.error('Error in addAsset:', err.message);
        res.status(500).send('Server error');
    }
};

// Sell an asset from the portfolio
exports.sellAsset = async (req, res) => {
    try {
        const { symbol, quantity, price } = req.body;

        // Validate inputs
        if (!symbol || !quantity || !price) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Find the asset
        const asset = await PortfolioAsset.findOne({ 
            userId: req.user.id,
            symbol: symbol
        });

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found in your portfolio' });
        }

        // Check if user has enough to sell
        if (asset.quantity < parseFloat(quantity)) {
            return res.status(400).json({ message: 'Not enough assets to sell' });
        }

        // Update asset quantity
        asset.quantity -= parseFloat(quantity);
        asset.price = parseFloat(price); // Update to latest price

        // If quantity is now zero, remove the asset
        if (asset.quantity === 0) {
            await PortfolioAsset.findByIdAndDelete(asset._id);
        } else {
            await asset.save();
        }

        // Create transaction record
        await PortfolioTransaction.create({
            userId: req.user.id,
            type: 'sell',
            symbol,
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            date: new Date()
        });

        // Create alert for sale
        await Alert.create({
            userId: req.user.id,
            message: `Vânzare: ${quantity} ${symbol} la $${price}`,
            type: 'info'
        });

        // Update user's funds
        const user = await Users.findById(req.user.id);
        if (user) {
            const sellAmount = parseFloat(price) * parseFloat(quantity);
            user.investedAmount -= sellAmount;
            user.availableFunds += sellAmount;
            await user.save();
        }

        res.json({ message: 'Asset sold successfully' });
    } catch (err) {
        console.error('Error in sellAsset:', err.message);
        res.status(500).send('Server error');
    }
};

// Get user's transaction history
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await PortfolioTransaction.find({ userId: req.user.id })
            .sort({ date: -1 });

        const formattedTransactions = transactions.map(tx => ({
            id: tx._id,
            date: tx.date.toISOString().split('T')[0],
            type: tx.type === 'buy' ? 'Cumpărare' : 'Vânzare',
            symbol: tx.symbol,
            quantity: tx.quantity,
            price: tx.price,
            total: tx.price * tx.quantity
        }));

        res.json(formattedTransactions);
    } catch (err) {
        console.error('Error in getTransactions:', err.message);
        res.status(500).send('Server error');
    }
};

// Get user's alerts
exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        const formattedAlerts = alerts.map(alert => {
            const createdAt = new Date(alert.createdAt);
            const now = new Date();
            const diffHours = Math.round((now - createdAt) / (1000 * 60 * 60));
            
            return {
                id: alert._id,
                message: alert.message,
                type: alert.type,
                time: `Acum ${diffHours} ore`,
                isRead: alert.isRead
            };
        });

        res.json(formattedAlerts);
    } catch (err) {
        console.error('Error in getAlerts:', err.message);
        res.status(500).send('Server error');
    }
};

// Mark alert as read
exports.markAlertRead = async (req, res) => {
    try {
        const { alertId } = req.params;

        const alert = await Alert.findById(alertId);
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        // Ensure the alert belongs to the user
        if (alert.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        alert.isRead = true;
        await alert.save();

        res.json({ message: 'Alert marked as read' });
    } catch (err) {
        console.error('Error in markAlertRead:', err.message);
        res.status(500).send('Server error');
    }
};

// Update user's funds (deposit or withdraw)
exports.updateFunds = async (req, res) => {
    try {
        const { amount, type } = req.body;

        // Validate input
        if (!amount || !type) {
            return res.status(400).json({ message: 'Please provide amount and type' });
        }

        if (type !== 'deposit' && type !== 'withdraw') {
            return res.status(400).json({ message: 'Type must be deposit or withdraw' });
        }

        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const parsedAmount = parseFloat(amount);
        
        if (type === 'deposit') {
            user.availableFunds += parsedAmount;
            user.totalBalance += parsedAmount;
            
            // Create alert for deposit
            await Alert.create({
                userId: req.user.id,
                message: `Depozit de $${parsedAmount.toLocaleString()} efectuat cu succes`,
                type: 'success'
            });
        } else {
            // Check if user has enough funds
            if (user.availableFunds < parsedAmount) {
                return res.status(400).json({ message: 'Fonduri insuficiente pentru retragere' });
            }
            
            user.availableFunds -= parsedAmount;
            user.totalBalance -= parsedAmount;
            
            // Create alert for withdrawal
            await Alert.create({
                userId: req.user.id,
                message: `Retragere de $${parsedAmount.toLocaleString()} efectuată cu succes`,
                type: 'info'
            });
        }

        await user.save();
        
        res.json({
            availableFunds: user.availableFunds,
            totalBalance: user.totalBalance,
            message: `${type === 'deposit' ? 'Depozit' : 'Retragere'} efectuat(ă) cu succes`
        });
    } catch (err) {
        console.error('Error in updateFunds:', err.message);
        res.status(500).send('Server error');
    }
};

// Update asset price (could be called by a cron job or price service)
exports.updateAssetPrice = async (req, res) => {
    try {
        const { symbol, price, changePercent } = req.body;
        
        // Validate inputs
        if (!symbol || !price) {
            return res.status(400).json({ message: 'Please provide symbol and price' });
        }
        
        // Find all assets with this symbol across all users
        const assets = await PortfolioAsset.find({ symbol: symbol.toUpperCase() });
        
        if (assets.length === 0) {
            return res.status(404).json({ message: 'No assets found with this symbol' });
        }
        
        // Update price for all matching assets
        for (const asset of assets) {
            asset.price = parseFloat(price);
            if (changePercent !== undefined) {
                asset.changePercent = parseFloat(changePercent);
            }
            asset.lastUpdated = new Date();
            await asset.save();
        }
        
        res.json({ message: `${assets.length} assets updated successfully` });
    } catch (err) {
        console.error('Error in updateAssetPrice:', err.message);
        res.status(500).send('Server error');
    }
};
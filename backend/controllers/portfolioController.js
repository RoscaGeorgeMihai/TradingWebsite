const Users = require('../models/Users');
const PortfolioAsset = require('../models/PortfolioAsset');
const PortfolioTransaction = require('../models/PortfolioTransaction');
const PortfolioHistory = require('../models/PortfolioHistory');
const Alert = require('../models/Alert');
const mongoose = require('mongoose');
const axios = require('axios');
const marketstackApi = require('../services/marketstackApi');

const calculatePerformance = (currentValue, previousValue) => {
    if (!previousValue || previousValue === 0) return 0;
    const performance = ((currentValue - previousValue) / previousValue) * 100;
    return Math.round(performance * 100) / 100;
};

const savePortfolioHistory = async (userId, assets, totalValue, investedAmount) => {
    try {
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        const safeTotalValue = parseFloat(totalValue) || 0;
        const safeInvestedAmount = parseFloat(investedAmount) || 0;
        
        // Calculate the overall performance
        const calculateChange = (current, previous) => {
            if (!previous || previous === 0) return 0;
            const change = ((current - previous) / previous) * 100;
            return Math.round(change * 100) / 100;
        };
        
        // Calculate overall performance based on total value vs invested amount
        const overallPerformance = calculateChange(safeTotalValue, safeInvestedAmount);
        
        // Use overall performance for all periods
        const performance = {
            daily: overallPerformance,
            weekly: overallPerformance,
            monthly: overallPerformance,
            yearly: overallPerformance,
            overall: overallPerformance
        };
            
        const formattedAssets = assets.map(asset => ({
            symbol: asset.symbol,
            name: asset.name,
            price: parseFloat(asset.price) || 0,
            quantity: parseFloat(asset.quantity) || 0,
            value: (parseFloat(asset.price) || 0) * (parseFloat(asset.quantity) || 0),
            changePercent: parseFloat(asset.changePercent) || 0
        }));
        
        // Find today's snapshot if it exists
        const lastSnapshot = await PortfolioHistory.findOne({ 
            userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });
        
        if (lastSnapshot) {
            lastSnapshot.totalValue = safeTotalValue;
            lastSnapshot.investedAmount = safeInvestedAmount;
            lastSnapshot.assets = formattedAssets;
            lastSnapshot.performance = performance;
            await lastSnapshot.save();
        } else {
            await PortfolioHistory.create({
                userId,
                date: now,
                totalValue: safeTotalValue,
                investedAmount: safeInvestedAmount,
                assets: formattedAssets,
                performance
            });
        }

        return performance;
    } catch (error) {
        console.error('Error saving portfolio history:', error);
        throw error;
    }
};

exports.getPortfolio = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const assets = await PortfolioAsset.find({ userId: req.user.id });
        
        let totalValue = assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
        
        if (totalValue === 0) {
            totalValue = user.investedAmount || 0;
        }

        const performance = await savePortfolioHistory(
            req.user.id,
            assets,
            totalValue,
            user.investedAmount || 0
        );

        const transactions = await PortfolioTransaction.find({ userId: req.user.id })
            .sort({ date: -1 })
            .limit(10);

        const alerts = await Alert.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);

        const formattedAssets = assets.map(asset => {
            const value = asset.price * asset.quantity;
            const allocation = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
            
            return {
                symbol: asset.symbol,
                name: asset.name,
                price: asset.price,
                quantity: asset.quantity,
                value: value,
                changePercent: asset.changePercent || 0,
                allocation: allocation,
                color: asset.color || '#' + Math.floor(Math.random()*16777215).toString(16)
            };
        });

        const formattedTransactions = transactions.map(tx => {
            const txDate = new Date(tx.date);
            const transactionType = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
            
            return {
                id: tx._id,
                date: txDate.toISOString().split('T')[0],
                type: transactionType,
                symbol: tx.symbol,
                quantity: tx.quantity,
                price: tx.price,
                total: tx.price * tx.quantity
            };
        });

        const formattedAlerts = alerts.map(alert => {
            const createdAt = new Date(alert.createdAt);
            const now = new Date();
            const diffHours = Math.round((now - createdAt) / (1000 * 60 * 60));
            
            return {
                id: alert._id,
                message: alert.message,
                type: alert.type,
                time: `${diffHours} hours ago`
            };
        });

        res.json({
            totalValue,
            investedAmount: user.investedAmount || 0,
            assets: formattedAssets,
            performance,
            transactions: formattedTransactions,
            alerts: formattedAlerts,
            otherAssets: [],
            dailyChange: performance.daily || 0
        });
    } catch (err) {
        console.error('Error in getPortfolio:', err.message);
        res.status(500).send('Server error');
    }
};

exports.saveCurrentPortfolioValue = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const assets = await PortfolioAsset.find({ userId });
        
        let totalValue = assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
        
        const user = await Users.findById(userId);
        const investedAmount = user.investedAmount || 0;
        
        const performance = await savePortfolioHistory(
            userId,
            assets,
            totalValue,
            investedAmount
        );
        
        res.json({
            message: 'Portfolio value saved successfully',
            totalValue,
            performance
        });
    } catch (err) {
        console.error('Error saving portfolio value:', err);
        res.status(500).send('Server error');
    }
};

exports.updateAssetPrice = async (req, res) => {
    try {
        const { symbol, price, changePercent } = req.body;
        
        if (!symbol || !price) {
            return res.status(400).json({ message: 'Please provide symbol and price' });
        }
        
        const assets = await PortfolioAsset.find({ symbol: symbol.toUpperCase() });
        
        if (assets.length === 0) {
            return res.status(404).json({ message: 'No assets found with this symbol' });
        }
        
        for (const asset of assets) {
            asset.price = parseFloat(price);
            if (changePercent !== undefined) {
                asset.changePercent = parseFloat(changePercent);
            }
            asset.lastUpdated = new Date();
            await asset.save();
            
            const user = await Users.findById(asset.userId);
            const userAssets = await PortfolioAsset.find({ userId: asset.userId });
            const totalValue = userAssets.reduce((sum, a) => sum + (a.price * a.quantity), 0);
            
            await savePortfolioHistory(
                asset.userId,
                userAssets,
                totalValue,
                user.investedAmount || 0
            );
        }
        
        res.json({ message: `${assets.length} assets updated successfully` });
    } catch (err) {
        console.error('Error in updateAssetPrice:', err.message);
        res.status(500).send('Server error');
    }
};

exports.addAsset = async (req, res) => {
    try {
        const { symbol, name, price, quantity, color } = req.body;

        if (!symbol || !price || !quantity) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const assetName = name || symbol;

        const existingAsset = await PortfolioAsset.findOne({ 
            userId: req.user.id,
            symbol: symbol
        });

        if (existingAsset) {
            existingAsset.quantity += parseFloat(quantity);
            existingAsset.price = parseFloat(price);
            existingAsset.name = assetName;
            
            if (color) {
                existingAsset.color = color;
            }
            
            await existingAsset.save();

            await PortfolioTransaction.create({
                userId: req.user.id,
                type: 'buy',
                symbol,
                quantity: parseFloat(quantity),
                price: parseFloat(price),
                name: assetName
            });

            return res.json({ message: 'Asset updated successfully', asset: existingAsset });
        }

        const newAsset = await PortfolioAsset.create({
            userId: req.user.id,
            symbol,
            name: assetName,
            price: parseFloat(price),
            quantity: parseFloat(quantity),
            color: color || '#' + Math.floor(Math.random()*16777215).toString(16)
        });

        await PortfolioTransaction.create({
            userId: req.user.id,
            type: 'buy',
            symbol,
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            name: assetName
        });

        const user = await Users.findById(req.user.id);
        const assets = await PortfolioAsset.find({ userId: req.user.id });
        const totalValue = assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
        
        await savePortfolioHistory(
            req.user.id,
            assets,
            totalValue,
            user.investedAmount || 0
        );

        res.json({ message: 'Asset added successfully', asset: newAsset });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.sellAsset = async (req, res) => {
    try {
        const { symbol, quantity, price } = req.body;

        if (!symbol || !quantity || !price) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const asset = await PortfolioAsset.findOne({ 
            userId: req.user.id,
            symbol: symbol
        });

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found in your portfolio' });
        }

        if (asset.quantity < parseFloat(quantity)) {
            return res.status(400).json({ message: 'Not enough assets to sell' });
        }

        asset.quantity -= parseFloat(quantity);
        asset.price = parseFloat(price);

        if (asset.quantity === 0) {
            await PortfolioAsset.findByIdAndDelete(asset._id);
        } else {
            await asset.save();
        }

        await PortfolioTransaction.create({
            userId: req.user.id,
            type: 'sell',
            symbol,
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            date: new Date()
        });

        await Alert.create({
            userId: req.user.id,
            message: `Sale: ${quantity} ${symbol} at $${price}`,
            type: 'info'
        });

        const user = await Users.findById(req.user.id);
        if (user) {
            const sellAmount = parseFloat(price) * parseFloat(quantity);
            user.investedAmount -= sellAmount;
            user.availableFunds += sellAmount;
            await user.save();
        }

        const assets = await PortfolioAsset.find({ userId: req.user.id });
        const totalValue = assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
        
        await savePortfolioHistory(
            req.user.id,
            assets,
            totalValue,
            user.investedAmount || 0
        );

        res.json({ message: 'Asset sold successfully' });
    } catch (err) {
        console.error('Error in sellAsset:', err.message);
        res.status(500).send('Server error');
    }
};

exports.buyStock = async (req, res) => {
    try {
        const { symbol, quantity, price, totalCost } = req.body;
        const userId = req.user.id;

        if (!symbol || !quantity || !price || !totalCost) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                details: { symbol, quantity, price, totalCost }
            });
        }

        const userCheck = await Users.findById(userId);
        if (!userCheck) {
            return res.status(400).json({ 
                message: 'User not found'
            });
        }

        if (userCheck.availableFunds < totalCost) {
            return res.status(400).json({ 
                message: 'Insufficient funds'
            });
        }

        const user = await Users.findOneAndUpdate(
            { 
                _id: userId,
                availableFunds: { $gte: totalCost }
            },
            {
                $inc: { 
                    availableFunds: -totalCost,
                    investedAmount: totalCost
                }
            },
            { 
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(400).json({ 
                message: 'Failed to update user funds'
            });
        }

        const transaction = await PortfolioTransaction.create({
            userId: userId,
            type: 'buy',
            symbol: symbol,
            quantity: quantity,
            price: price,
            date: new Date()
        });

        const portfolioAsset = await PortfolioAsset.findOneAndUpdate(
            { 
                userId: userId,
                symbol: symbol
            },
            {
                $inc: { quantity: quantity },
                $set: { 
                    price: price,
                    lastUpdated: new Date(),
                    name: symbol
                }
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );
        
        const assets = await PortfolioAsset.find({ userId: userId });
        const totalValue = assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
        
        await savePortfolioHistory(
            userId,
            assets,
            totalValue,
            user.investedAmount || 0
        );
        
        res.json({
            message: 'Purchase successful',
            availableFunds: user.availableFunds,
            investedAmount: user.investedAmount,
            transaction: {
                id: transaction._id,
                symbol: transaction.symbol,
                quantity: transaction.quantity,
                price: transaction.price
            }
        });

    } catch (error) {
        console.error('Error in buyStock:', error);
        res.status(500).json({ 
            message: 'Error processing purchase',
            error: error.message
        });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await PortfolioTransaction.find({ userId: req.user.id })
            .sort({ date: -1 });

        const formattedTransactions = transactions.map(tx => ({
            id: tx._id,
            date: tx.date.toISOString().split('T')[0],
            type: tx.type === 'buy' ? 'Buy' : 'Sell',
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
                time: `${diffHours} hours ago`,
                isRead: alert.isRead
            };
        });

        res.json(formattedAlerts);
    } catch (err) {
        console.error('Error in getAlerts:', err.message);
        res.status(500).send('Server error');
    }
};

exports.markAlertRead = async (req, res) => {
    try {
        const { alertId } = req.params;

        const alert = await Alert.findById(alertId);
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

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

exports.updateFunds = async (req, res) => {
    try {
        const { amount, type } = req.body;

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
            
            await Alert.create({
                userId: req.user.id,
                message: `Deposit of $${parsedAmount.toLocaleString()} completed successfully`,
                type: 'success'
            });
        } else {
            if (user.availableFunds < parsedAmount) {
                return res.status(400).json({ message: 'Insufficient funds for withdrawal' });
            }
            
            user.availableFunds -= parsedAmount;
            user.totalBalance -= parsedAmount;
            
            await Alert.create({
                userId: req.user.id,
                message: `Withdrawal of $${parsedAmount.toLocaleString()} completed successfully`,
                type: 'info'
            });
        }

        await user.save();
        
        const assets = await PortfolioAsset.find({ userId: req.user.id });
        const totalValue = assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
        
        await savePortfolioHistory(
            req.user.id,
            assets,
            totalValue,
            user.investedAmount || 0
        );
        
        res.json({
            availableFunds: user.availableFunds,
            totalBalance: user.totalBalance,
            message: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} completed successfully`
        });
    } catch (err) {
        console.error('Error in updateFunds:', err.message);
        res.status(500).send('Server error');
    }
};

exports.getPortfolioHistory = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Get portfolio history
        const history = await PortfolioHistory.find({
            userId: req.user.id,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: 1 });

        // Get current portfolio assets
        const assets = await PortfolioAsset.find({ userId: req.user.id });
        
        // Initialize variables for totals
        let currentTotalValue = 0;
        let totalInvested = 0;
        
        // Initialize an empty quotesMap to avoid null errors
        let quotesMap = {};
        
        // Get current prices using marketstackApi
        if (assets && assets.length > 0) {
            const symbols = assets.map(asset => asset.symbol);
            
            try {
                // Only call the API if we have symbols
                if (symbols && symbols.length > 0) {
                    quotesMap = await marketstackApi.getMultipleStockQuotes(symbols) || {};
                }
            } catch (error) {
                console.error('Error fetching stock prices:', error);
                // Continue with empty quotesMap
            }
        }
        
        // Calculate current portfolio value
        if (assets && assets.length > 0) {
            assets.forEach(asset => {
                // Make sure asset.symbol exists before trying to use it as a key
                const quote = asset.symbol && quotesMap ? quotesMap[asset.symbol] : null;
                
                const purchasePrice = parseFloat(asset.purchasePrice) || parseFloat(asset.price) || 0;
                // Default to purchase price if quote is not available
                let currentPrice = purchasePrice;
                
                if (quote && quote.price) {
                    currentPrice = parseFloat(quote.price);
                }
                
                const quantity = parseFloat(asset.quantity) || 0;
                const value = currentPrice * quantity;
                
                // Add to totals
                currentTotalValue += value;
                totalInvested += (purchasePrice * quantity);
            });
        }

        // Calculate performance percentages
        const calculateChange = (current, previous) => {
            if (!previous || previous === 0) return 0;
            const change = ((current - previous) / previous) * 100;
            return Math.round(change * 100) / 100; // Round to 2 decimal places
        };

        // Calculate the overall performance
        const overallPerformance = calculateChange(currentTotalValue, totalInvested);
        
        // Use the overall performance for all periods if historical data is missing
        const performance = {
            daily: overallPerformance,
            weekly: overallPerformance,
            monthly: overallPerformance,
            yearly: overallPerformance,
            overall: overallPerformance
        };

        // Log the calculated performance values
        console.log("Using overall performance for all periods:", performance);

        // Format history data for response
        const formattedHistory = history && history.length > 0 
            ? history.map(h => ({
                date: h.date,
                totalValue: h.totalValue || 0,
                performance: h.performance || {
                    daily: overallPerformance,
                    weekly: overallPerformance,
                    monthly: overallPerformance,
                    yearly: overallPerformance,
                    overall: overallPerformance
                }
            }))
            : [];

        res.json({
            history: formattedHistory,
            performance,
            currentTotalValue,
            totalInvested
        });
    } catch (err) {
        console.error('Error in getPortfolioHistory:', err.message, err.stack);
        res.status(500).send('Server error');
    }
};

exports.calculatePerformance = async (req, res) => {
    try {
        const { currentTotalValue, totalInvested, assets, useAvailableDays } = req.body;
        
        if (currentTotalValue === undefined) {
            return res.status(400).json({ message: 'Current total value is required' });
        }

        const safeCurrentTotalValue = parseFloat(currentTotalValue) || 0;
        const safeTotalInvested = parseFloat(totalInvested) || 0;
        
        // Calculate overall performance (this works correctly)
        const calculateChange = (current, previous) => {
            if (!previous || previous === 0) return 0;
            const change = ((current - previous) / previous) * 100;
            return Math.round(change * 100) / 100;
        };

        // Calculate the overall performance
        const overallPerformance = calculateChange(safeCurrentTotalValue, safeTotalInvested);
        
        // Inițializează performanța folosind valoarea generală
        let performance = {
            daily: overallPerformance,
            weekly: overallPerformance,
            monthly: overallPerformance,
            yearly: overallPerformance,
            overall: overallPerformance
        };

        // Calculează performanța bazată pe istoricul portofoliului dacă avem date disponibile
        // și useAvailableDays este adevărat
        if (useAvailableDays) {
            try {
                const now = new Date();
                const today = new Date(now);
                today.setHours(0, 0, 0, 0);
                
                // Datele pentru diferite perioade
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                const oneWeekAgo = new Date(today);
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                
                const oneMonthAgo = new Date(today);
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                
                const oneYearAgo = new Date(today);
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

                // Găsește cele mai recente snapshot-uri pentru fiecare perioadă
                // Zilnic - caută cel mai apropiat snapshot de ieri
                const yesterdaySnapshot = await PortfolioHistory.findOne({
                    userId: req.user.id,
                    date: { $lt: today }
                }).sort({ date: -1 });

                // Săptămânal - caută cel mai apropiat snapshot de acum o săptămână
                const weeklySnapshot = await PortfolioHistory.findOne({
                    userId: req.user.id,
                    date: { $lt: oneWeekAgo }
                }).sort({ date: -1 });

                // Lunar - caută cel mai apropiat snapshot de acum o lună
                const monthlySnapshot = await PortfolioHistory.findOne({
                    userId: req.user.id,
                    date: { $lt: oneMonthAgo }
                }).sort({ date: -1 });

                // Anual - caută cel mai apropiat snapshot de acum un an
                const yearlySnapshot = await PortfolioHistory.findOne({
                    userId: req.user.id,
                    date: { $lt: oneYearAgo }
                }).sort({ date: -1 });

                // Calculează performanța bazată pe datele disponibile
                if (yesterdaySnapshot) {
                    performance.daily = calculateChange(safeCurrentTotalValue, yesterdaySnapshot.totalValue);
                }
                
                if (weeklySnapshot) {
                    performance.weekly = calculateChange(safeCurrentTotalValue, weeklySnapshot.totalValue);
                }
                
                if (monthlySnapshot) {
                    performance.monthly = calculateChange(safeCurrentTotalValue, monthlySnapshot.totalValue);
                }
                
                if (yearlySnapshot) {
                    performance.yearly = calculateChange(safeCurrentTotalValue, yearlySnapshot.totalValue);
                }

                console.log("Calculated performance with available data:", performance);
            } catch (error) {
                console.error("Error calculating performance with history:", error);
                // Folosește valorile generale în caz de eroare
            }
        } else {
            console.log("Using overall performance for all periods:", performance);
        }

        let portfolioAssets;
        if (assets && Array.isArray(assets)) {
            portfolioAssets = assets;
        } else {
            portfolioAssets = await PortfolioAsset.find({ userId: req.user.id });
        }

        const validPortfolioAssets = portfolioAssets.map(asset => ({
            symbol: asset.symbol,
            name: asset.name,
            price: parseFloat(asset.price) || 0,
            quantity: parseFloat(asset.quantity) || 0,
            value: (parseFloat(asset.price) || 0) * (parseFloat(asset.quantity) || 0),
            changePercent: parseFloat(asset.changePercent) || 0
        }));

        // Update or create today's snapshot
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        let todaySnapshot = await PortfolioHistory.findOne({
            userId: req.user.id,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (todaySnapshot) {
            todaySnapshot.totalValue = safeCurrentTotalValue;
            todaySnapshot.investedAmount = safeTotalInvested;
            todaySnapshot.performance = performance;
            todaySnapshot.assets = validPortfolioAssets;
            await todaySnapshot.save();
        } else {
            await PortfolioHistory.create({
                userId: req.user.id,
                date: now,
                totalValue: safeCurrentTotalValue,
                investedAmount: safeTotalInvested,
                performance: performance,
                assets: validPortfolioAssets
            });
        }

        res.json({ 
            performance,
            currentTotalValue: safeCurrentTotalValue,
            totalInvested: safeTotalInvested
        });
    } catch (err) {
        console.error('Error in calculatePerformance:', err.message, err.stack);
        res.status(500).send('Server error');
    }
};
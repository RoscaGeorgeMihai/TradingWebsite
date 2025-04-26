const Users = require('../models/Users');
const Transaction = require('../models/Transaction');
const PortfolioHistory = require('../models/PortfolioHistory');
const Stock = require('../models/Stock');
const PortfolioAsset = require('../models/PortfolioAsset');
const marketstackApi = require('../services/marketstackApi');

// Get dashboard data
exports.getDashboardData = async (req, res) => {
    try {
        console.log('Fetching dashboard data...');

        // Get total stocks first (pentru a verifica că modelul Stock funcționează)
        const totalStocks = await Stock.countDocuments();
        console.log('Total stocks:', totalStocks);

        // Get total users and active users
        const totalUsers = await Users.countDocuments();
        console.log('Total users:', totalUsers);

        const activeUsers = await Users.countDocuments({ status: 'active' });
        console.log('Active users:', activeUsers);

        // Get total deposits and withdrawals for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayTransactions = await Transaction.find({
            date: { $gte: today }
        });
        console.log('Today transactions:', todayTransactions.length);

        const todayDeposits = todayTransactions
            .filter(t => t.type === 'Deposit')
            .reduce((sum, t) => sum + t.amount, 0);
        console.log('Today deposits:', todayDeposits);

        const todayWithdrawals = todayTransactions
            .filter(t => t.type === 'Withdrawal')
            .reduce((sum, t) => sum + t.amount, 0);
        console.log('Today withdrawals:', todayWithdrawals);

        // Get total deposits across all time
        const totalDepositsResult = await Transaction.aggregate([
            { $match: { type: 'Deposit' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeposits = totalDepositsResult[0]?.total || 0;
        console.log('Total deposits:', totalDeposits);

        // Get recent activity (last 5 transactions)
        const limit = 100; // Numărul de tranzacții returnate (ajustează după nevoi)
        const recentActivity = await Transaction.find()
            .sort({ date: -1 })
            .limit(limit)
            .populate('userId', 'firstName lastName');
        console.log('Recent activity:', recentActivity.length);

        const totalTransactions = await Transaction.countDocuments();
        console.log('Total transactions:', totalTransactions);

        // Get system alerts (example: users with low balance)
        const lowBalanceUsers = await Users.countDocuments({
            availableFunds: { $lt: 100 }
        });
        console.log('Low balance users:', lowBalanceUsers);

        // Get large transactions alerts
        const largeTransactions = await Transaction.find({
            amount: { $gt: 1000 },
            date: { $gte: today }
        });
        console.log('Large transactions:', largeTransactions.length);

        // Format the response
        const dashboardData = {
            totalUsers,
            activeUsers,
            totalAssets: totalStocks,
            totalDeposits,
            todayDeposits,
            todayWithdrawals,
            totalStocks,
            recentActivity: recentActivity.map(activity => ({
                id: activity._id,
                user: activity.userId ? `${activity.userId.firstName} ${activity.userId.lastName}` : 'Unknown User',
                action: activity.type,
                amount: activity.amount,
                date: activity.date.toLocaleString()
            })),
            totalTransactions,
            alertsCount: lowBalanceUsers + largeTransactions.length,
            alerts: [
                ...(lowBalanceUsers > 0 ? [{
                    type: 'warning',
                    message: `${lowBalanceUsers} users have low balance`
                }] : []),
                ...largeTransactions.map(tx => ({
                    type: tx.type === 'Deposit' ? 'success' : 'warning',
                    message: `Large ${tx.type.toLowerCase()} of $${tx.amount} by ${tx.userId ? `${tx.userId.firstName} ${tx.userId.lastName}` : 'Unknown User'}`
                }))
            ]
        };

        console.log('Dashboard data prepared:', dashboardData);
        res.json(dashboardData);
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ 
            message: 'Error fetching dashboard data',
            error: err.message 
        });
    }
};


// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await Users.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Get user by id
exports.getUserById = async (req, res) => {
    try {
        const user = await Users.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Error fetching user' });
    }
};

// Update user
// Add this method to your adminController.js file
exports.updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, role, status } = req.body;
        const user = await Users.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, email, role, status },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!['active', 'deactivate'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const user = await Users.findByIdAndUpdate(
            userId,
            { status },
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error updating user status:', err);
        res.status(500).json({ message: 'Error updating user status' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await Users.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

// Get statistics data
// Get statistics data
// Get statistics data
// Get statistics data
// Get statistics data
exports.getStatisticsData = async (req, res) => {
    try {
        console.log('Fetching statistics data...');
        const { timeRange } = req.query;
        
        // Define date filters based on timeRange
        let dateFilter, userDateFilter;
        const now = new Date();

        switch(timeRange) {
            case 'daily':
                // Last 30 days
                let thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(now.getDate() - 30);
                dateFilter = { date: { $gte: thirtyDaysAgo } };
                userDateFilter = { createdAt: { $gte: thirtyDaysAgo } };
                break;
                
            case 'monthly':
                // Last 12 months
                let twelveMonthsAgo = new Date();
                twelveMonthsAgo.setMonth(now.getMonth() - 12);
                dateFilter = { date: { $gte: twelveMonthsAgo } };
                userDateFilter = { createdAt: { $gte: twelveMonthsAgo } };
                break;
                
            case 'yearly':
            default:
                // All time data
                dateFilter = {}; // Empty filter to get all documents
                userDateFilter = {};
                break;
        }

        // Define grouping based on timeRange
        let transactionGroupBy, userGroupBy;
        
        switch(timeRange) {
            case 'daily':
                // Group by year, month, day
                transactionGroupBy = {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    day: { $dayOfMonth: "$date" }
                };
                userGroupBy = {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" }
                };
                break;
                
            case 'monthly':
                // Group by year and month
                transactionGroupBy = {
                    year: { $year: "$date" },
                    month: { $month: "$date" }
                };
                userGroupBy = {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                };
                break;
                
            case 'yearly':
            default:
                // Group by year only
                transactionGroupBy = {
                    year: { $year: "$date" }
                };
                userGroupBy = {
                    year: { $year: "$createdAt" }
                };
                break;
        }

        // Use a better approach - get total users count first
        const totalUsers = await Users.countDocuments();
        console.log('Total users in system:', totalUsers);

        // Get user growth data
        let userGrowth = await Users.aggregate([
            { $match: userDateFilter },
            {
                $group: {
                    _id: userGroupBy,
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        console.log('Raw user growth data:', JSON.stringify(userGrowth));
        
        // Add default data if empty
        if (userGrowth.length === 0) {
            // Create a single entry with the total user count
            if (timeRange === 'yearly') {
                userGrowth = [{ _id: { year: now.getFullYear() }, count: totalUsers }];
            } else if (timeRange === 'monthly') {
                userGrowth = [{ 
                    _id: { year: now.getFullYear(), month: now.getMonth() + 1 }, 
                    count: totalUsers 
                }];
            } else { // daily
                userGrowth = [{ 
                    _id: { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }, 
                    count: totalUsers 
                }];
            }
            console.log('Generated default user growth data:', JSON.stringify(userGrowth));
        }

        // Get deposits growth data
        const depositsGrowth = await Transaction.aggregate([
            {
                $match: { 
                    type: 'Deposit',
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: transactionGroupBy,
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        // Get transaction volume data
        const transactionVolume = await Transaction.aggregate([
            {
                $match: dateFilter
            },
            {
                $group: {
                    _id: transactionGroupBy,
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        // Get portfolio value data
        const portfolioAssets = await PortfolioAsset.find().populate('userId');
        const uniqueSymbols = [...new Set(portfolioAssets.map(asset => asset.symbol))];
        
        // Get current prices from Marketstack
        const currentPrices = await marketstackApi.getMultipleStockQuotes(uniqueSymbols);
        
        // Calculate total portfolio value
        const portfolioValue = portfolioAssets.reduce((total, asset) => {
            const currentPrice = currentPrices[asset.symbol]?.price || asset.price;
            return total + (currentPrice * asset.quantity);
        }, 0);

        // Format the response based on the timeRange
        const formatDate = (item) => {
            if (!item._id) {
                console.error('Invalid item format:', item);
                return 'Invalid Date';
            }
            
            // Handle null years (sometimes happens with MongoDB)
            const year = item._id.year || now.getFullYear();
            
            if (timeRange === 'yearly') {
                return `${year}-01-01`;
            } else if (timeRange === 'monthly') {
                // Default to current month if month is missing
                const month = item._id.month || (now.getMonth() + 1);
                return `${year}-${String(month).padStart(2, '0')}-01`;
            } else { // daily
                // Default to current day if day is missing
                const month = item._id.month || (now.getMonth() + 1);
                const day = item._id.day || now.getDate();
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        };

        // For yearly view, get cumulative data
        let userGrowthData;
        if (timeRange === 'yearly') {
            // Use total user count directly for yearly view
            userGrowthData = userGrowth.map(item => ({
                date: formatDate(item),
                count: totalUsers // Use total users count for yearly view
            }));
        } else {
            // For monthly/daily views, use the counts from the query results
            userGrowthData = userGrowth.map(item => ({
                date: formatDate(item),
                count: item.count
            }));
        }
        
        const statisticsData = {
            userGrowth: userGrowthData,
            depositsGrowth: depositsGrowth.map(item => ({
                date: formatDate(item),
                total: item.total
            })),
            transactionVolume: transactionVolume.map(item => ({
                date: formatDate(item),
                count: item.count
            })),
            portfolioValue: portfolioValue,
            portfolioAssets: portfolioAssets.map(asset => ({
                symbol: asset.symbol,
                name: asset.name,
                quantity: asset.quantity,
                currentPrice: currentPrices[asset.symbol]?.price || asset.price,
                value: (currentPrices[asset.symbol]?.price || asset.price) * asset.quantity,
                changePercent: currentPrices[asset.symbol]?.changePercent || 0
            }))
        };

        console.log('Statistics data prepared successfully');
        console.log('User growth response:', JSON.stringify(statisticsData.userGrowth));
        res.json(statisticsData);
    } catch (err) {
        console.error('Error fetching statistics data:', err);
        res.status(500).json({ 
            message: 'Error fetching statistics data',
            error: err.message 
        });
    }
};

// Toggle stock popularity
exports.toggleStockPopularity = async (req, res) => {
    try {
        const { stockId } = req.params;
        const { isPopular } = req.body;

        const stock = await Stock.findByIdAndUpdate(
            stockId,
            { isPopular },
            { new: true }
        );

        if (!stock) {
            return res.status(404).json({ message: 'Stock not found' });
        }

        res.json(stock);
    } catch (err) {
        console.error('Error toggling stock popularity:', err);
        res.status(500).json({ message: 'Error toggling stock popularity' });
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
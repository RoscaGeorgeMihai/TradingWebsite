const mongoose = require('mongoose');

const PortfolioAssetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    symbol: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    changePercent: {
        type: Number,
        default: 0
    },
    color: {
        type: String,
        default: function() {
            // Use specific colors for certain symbols
            if (this.symbol === 'AMZN') {
                return '#FF9900'; // Amazon's brand orange color
            }
            if (this.symbol === 'MSFT') {
                return '#00A4EF'; // Microsoft's blue color
            }
            // Generate a random color for other symbols
            return '#' + Math.floor(Math.random()*16777215).toString(16);
        }
    },
    allocation: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Add indexes for better performance
PortfolioAssetSchema.index({ userId: 1, symbol: 1 }, { unique: true });
PortfolioAssetSchema.index({ symbol: 1 });

module.exports = mongoose.model('PortfolioAsset', PortfolioAssetSchema);
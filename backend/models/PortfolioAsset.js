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
            // Generate a random color if none is provided
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

// Index for faster lookups
PortfolioAssetSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('PortfolioAsset', PortfolioAssetSchema);
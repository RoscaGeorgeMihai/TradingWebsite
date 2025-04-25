const mongoose = require('mongoose');

const PortfolioHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    totalValue: {
        type: Number,
        required: true
    },
    investedAmount: {
        type: Number,
        required: true
    },
    assets: [{
        symbol: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        changePercent: {
            type: Number,
            default: 0
        }
    }],
    performance: {
        daily: {
            type: Number,
            default: 0
        },
        weekly: {
            type: Number,
            default: 0
        },
        monthly: {
            type: Number,
            default: 0
        },
        yearly: {
            type: Number,
            default: 0
        },
        overall: {
            type: Number,
            default: 0
        }
    }
}, { 
    timestamps: true 
});

// Index pentru căutări rapide
PortfolioHistorySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('PortfolioHistory', PortfolioHistorySchema);
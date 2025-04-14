const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    type: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    symbol: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for faster lookups
TransactionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('PortfolioTransaction', TransactionSchema);
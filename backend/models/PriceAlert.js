const mongoose = require('mongoose');

const PriceAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['above', 'below'],
        required: true
    },
    isTriggered: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for faster lookups
PriceAlertSchema.index({ userId: 1, symbol: 1, isActive: 1 });

module.exports = mongoose.model('PriceAlert', PriceAlertSchema); 
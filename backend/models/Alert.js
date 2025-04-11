const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['success', 'danger', 'warning', 'info'],
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for faster lookups
AlertSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#0dcaf0'
  },
  isPopular: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema); 
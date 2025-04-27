const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import routes
const authRoutes = require('./routes/auth');
const investRoutes = require('./routes/investRoutes');
const portfolioRoutes = require('./routes/portfolio');
const stockRoutes = require('./routes/stockRoutes');
const adminRoutes = require('./routes/admin');
const marketstackRoutes = require('./routes/marketstack');
const usersRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
const mongoURI = process.env.mongoURI || 'mongodb://localhost:27017/TradingWebsite';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/invest', investRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketstack', marketstackRoutes);
app.use('/api/users', usersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
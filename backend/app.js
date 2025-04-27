const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Routes
const authRoutes = require('./routes/auth');
const investRoutes = require('./routes/investRoutes');
const adminRoutes = require('./routes/admin');
const stockRoutes = require('./routes/stockRoutes');
const usersRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/invest', investRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/users', usersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
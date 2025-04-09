const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectat cu succes');
  } catch (err) {
    console.error('Eroare la conectarea MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
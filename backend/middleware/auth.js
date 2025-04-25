const jwt = require('jsonwebtoken');
const Users = require('../models/Users');

// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await Users.findById(decoded.user.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin authentication middleware - should be used AFTER auth middleware
// Admin authentication middleware - should be used AFTER auth middleware
const isAdmin = (req, res, next) => {
  // Check if req.user exists (should be set by auth middleware)
  if (!req.user) {
    return res.status(500).json({ message: 'Server error: User not authenticated before admin check' });
  }

  // Check if user has admin role - using role field instead of isAdmin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin rights required.' });
  }

  next();
};

module.exports = { auth, isAdmin };
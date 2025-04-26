const jwt = require('jsonwebtoken');
const Users = require('../models/Users');

// Basic authentication middleware
// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Check if the header has the correct format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
        
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
    // Get user from database
    const user = await Users.findById(decoded.id);
        
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if account is still active
    if (user.status === 'deactivate') {
      return res.status(403).json({ message: 'Your account has been deactivated' });
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
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(403).json({ message: 'Access denied' });
  }
};

module.exports = { auth, adminAuth, isAdmin: adminAuth };
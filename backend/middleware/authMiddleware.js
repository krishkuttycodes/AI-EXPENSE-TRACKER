const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

/**
 * Authentication middleware to verify JWT token and attach user to request object
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(ApiError.unauthorized('Access denied. No authorization token provided.'));
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_development_secret_key_minimum_32_characters';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return next(ApiError.unauthorized('User associated with this token no longer exists.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Session has expired. Please log in again.'));
    }
    return next(ApiError.unauthorized('Invalid authorization token.'));
  }
};

module.exports = { protect };

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints (prevent brute-force password guessing)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Rate limiter for AI assistant endpoints
 */
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 AI queries per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI query limit reached. Please wait a few minutes before submitting more AI questions.',
  },
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests received. Please slow down.',
  },
});

module.exports = { authLimiter, aiLimiter, apiLimiter };

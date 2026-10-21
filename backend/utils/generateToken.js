const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for the authenticated user
 * @param {string} userId - User's MongoDB ObjectId string
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_development_secret_key_minimum_32_characters';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;

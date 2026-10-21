const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/apiError');

// Default starter categories
const DEFAULT_CATEGORIES = [
  // Income
  { name: 'Salary', type: 'income', icon: 'briefcase', color: '#10b981' },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#06b6d4' },
  { name: 'Business', type: 'income', icon: 'trending-up', color: '#3b82f6' },
  { name: 'Investment', type: 'income', icon: 'dollar-sign', color: '#8b5cf6' },
  { name: 'Other Income', type: 'income', icon: 'plus-circle', color: '#14b8a6' },
  // Expenses
  { name: 'Food & Dining', type: 'expense', icon: 'coffee', color: '#f59e0b' },
  { name: 'Travel & Transport', type: 'expense', icon: 'car', color: '#ef4444' },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899' },
  { name: 'Bills & Utilities', type: 'expense', icon: 'zap', color: '#f97316' },
  { name: 'Rent & Housing', type: 'expense', icon: 'home', color: '#6366f1' },
  { name: 'Education', type: 'expense', icon: 'book', color: '#0ea5e9' },
  { name: 'Health & Medical', type: 'expense', icon: 'heart', color: '#e11d48' },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#a855f7' },
  { name: 'Subscriptions', type: 'expense', icon: 'repeat', color: '#d946ef' },
  { name: 'Other Expense', type: 'expense', icon: 'more-horizontal', color: '#64748b' },
];

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, currency } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email address already exists.'));
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      currency: currency || 'INR',
    });

    // Create starter categories customized for this user
    const userCategories = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      user: user._id,
      isDefault: true,
    }));
    await Category.insertMany(userCategories);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User login
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password'));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password'));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, currency } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (currency) user.currency = currency.trim().toUpperCase();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };

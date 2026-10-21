const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Budget must belong to a user'],
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null indicates overall monthly budget
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide budget amount limit'],
      min: [1, 'Budget amount must be at least 1'],
    },
    month: {
      type: Number,
      required: [true, 'Please specify the budget month (1-12)'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please specify the budget year'],
      min: 2000,
      max: 2100,
    },
    alertThreshold: {
      type: Number,
      default: 80, // Percentage at which warning is triggered
      min: 10,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budget for same user + category (or overall) + month + year
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;

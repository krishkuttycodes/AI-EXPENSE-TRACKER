const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const ApiError = require('../utils/apiError');

/**
 * Get all categories available for current user
 * GET /api/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = {
      $or: [{ user: req.user._id }, { user: null }],
    };

    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      filter.type = type.toLowerCase();
    }

    const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user-owned category
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return next(ApiError.badRequest('Category name and type (income/expense) are required'));
    }

    // Check duplicate name for this user
    const existing = await Category.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      type: type.toLowerCase(),
    });

    if (existing) {
      return next(ApiError.conflict(`You already have a "${name.trim()}" category for ${type}.`));
    }

    const category = await Category.create({
      user: req.user._id,
      name: name.trim(),
      type: type.toLowerCase(),
      icon: icon || 'tag',
      color: color || '#6366f1',
      isDefault: false,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing user category
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(ApiError.notFound('Category not found'));
    }

    // Check ownership
    if (!category.user || category.user.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('You can only edit your own custom categories.'));
    }

    if (name) category.name = name.trim();
    if (icon) category.icon = icon.trim();
    if (color) category.color = color.trim();

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user category
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(ApiError.notFound('Category not found'));
    }

    if (!category.user || category.user.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('You cannot delete default system categories.'));
    }

    // Check if any transactions reference this category
    const transactionCount = await Transaction.countDocuments({
      user: req.user._id,
      category: category._id,
    });

    if (transactionCount > 0) {
      return next(
        ApiError.badRequest(
          `Cannot delete category "${category.name}" because ${transactionCount} transaction(s) are linked to it. Please reassign or delete those transactions first.`
        )
      );
    }

    await Category.findByIdAndDelete(category._id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

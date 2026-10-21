const aiService = require('../services/aiService');
const ChatHistory = require('../models/ChatHistory');
const ApiError = require('../utils/apiError');

/**
 * Chat with AI Finance Assistant
 * POST /api/ai/chat
 */
const chat = async (req, res, next) => {
  try {
    const { message, month, year } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return next(ApiError.badRequest('Message cannot be empty.'));
    }

    if (message.trim().length > 1000) {
      return next(ApiError.badRequest('Message cannot exceed 1000 characters.'));
    }

    const response = await aiService.chat(req.user._id, message.trim(), month, year);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI-generated Financial Insights
 * GET /api/ai/insights
 */
const getInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    const insights = await aiService.generateInsights(req.user._id, month, year);

    res.status(200).json({
      success: true,
      data: {
        insights,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user chat history
 * GET /api/ai/history
 */
const getChatHistory = async (req, res, next) => {
  try {
    const history = await ChatHistory.find({ user: req.user._id })
      .sort({ timestamp: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear user chat history
 * DELETE /api/ai/history
 */
const clearChatHistory = async (req, res, next) => {
  try {
    await ChatHistory.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat, getInsights, getChatHistory, clearChatHistory };

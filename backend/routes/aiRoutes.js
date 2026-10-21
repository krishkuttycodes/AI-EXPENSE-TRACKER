const express = require('express');
const router = express.Router();
const {
  chat,
  getInsights,
  getChatHistory,
  clearChatHistory,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimitMiddleware');

router.use(protect);

router.post('/chat', aiLimiter, chat);
router.get('/insights', getInsights);
router.route('/history')
  .get(getChatHistory)
  .delete(clearChatHistory);

module.exports = router;

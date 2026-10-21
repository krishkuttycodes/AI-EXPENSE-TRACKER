const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Chat history must be linked to a user'],
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Role must be user or assistant'],
      enum: ['user', 'assistant', 'system'],
    },
    message: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      maxlength: [4000, 'Message cannot exceed 4000 characters'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

chatHistorySchema.index({ user: 1, timestamp: 1 });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;

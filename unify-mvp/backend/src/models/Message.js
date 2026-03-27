const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  conversation_id: {
    type: String,
    required: true,
    index: true,
  },
  original_text: {
    type: String,
    required: true,
    trim: true,
  },
  original_language: {
    type: String,
    required: true,
  },
  translated_text: {
    type: String,
    required: true,
  },
  target_language: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);

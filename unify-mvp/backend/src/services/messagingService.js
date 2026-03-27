const Message = require('../models/Message');
const User = require('../models/User');
const { detectLanguage, translateToTarget } = require('./translationService');

const getConversationId = (userA, userB) => [String(userA), String(userB)].sort().join('_');

/**
 * Sends a message with automatic detection + translation and saves both forms.
 */
const sendMessage = async ({ senderId, receiverId, text }) => {
  const receiver = await User.findById(receiverId).select('_id preferred_language');
  if (!receiver) {
    const err = new Error('Receiver not found.');
    err.statusCode = 404;
    throw err;
  }

  const originalLanguage = await detectLanguage(text);
  const targetLanguage = receiver.preferred_language || 'en';
  const translatedText = await translateToTarget({
    text,
    fromLanguage: originalLanguage,
    toLanguage: targetLanguage,
  });

  const conversationId = getConversationId(senderId, receiverId);

  const message = await Message.create({
    sender_id: senderId,
    receiver_id: receiverId,
    conversation_id: conversationId,
    original_text: text,
    original_language: originalLanguage,
    translated_text: translatedText,
    target_language: targetLanguage,
  });

  return message;
};

const getConversationMessages = async ({ conversationId, limit = 100 }) => {
  return Message.find({ conversation_id: conversationId })
    .sort({ timestamp: 1 })
    .limit(limit)
    .populate('sender_id', 'email preferred_language')
    .populate('receiver_id', 'email preferred_language');
};

module.exports = {
  sendMessage,
  getConversationMessages,
  getConversationId,
};

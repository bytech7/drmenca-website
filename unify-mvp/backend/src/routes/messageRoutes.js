const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { sendMessage, getConversationMessages } = require('../services/messagingService');

const router = express.Router();

router.post('/messages', authMiddleware, async (req, res, next) => {
  try {
    const { receiver_id, text } = req.body;

    if (!receiver_id || !text) {
      return res.status(400).json({ error: 'receiver_id and text are required.' });
    }

    const message = await sendMessage({
      senderId: req.user.userId,
      receiverId: receiver_id,
      text,
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

router.get('/messages/:conversationId', authMiddleware, async (req, res, next) => {
  try {
    const messages = await getConversationMessages({
      conversationId: req.params.conversationId,
      limit: Number(req.query.limit || 100),
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

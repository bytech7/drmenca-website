const jwt = require('jsonwebtoken');
const { sendMessage, getConversationId } = require('../services/messagingService');

/**
 * Configures Socket.io handlers for authenticated real-time messaging.
 */
const setupSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized: missing token'));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.userId;
      next();
    } catch (error) {
      next(new Error('Unauthorized: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Join a personal room so peers can target this user.
    socket.join(socket.userId);

    socket.on('send_message', async (payload, callback) => {
      try {
        const { receiver_id, text } = payload || {};
        if (!receiver_id || !text) {
          throw new Error('receiver_id and text are required.');
        }

        const message = await sendMessage({
          senderId: socket.userId,
          receiverId: receiver_id,
          text,
        });

        const conversationId = getConversationId(socket.userId, receiver_id);

        const receiverPayload = {
          _id: message._id,
          conversation_id: conversationId,
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          original_text: message.original_text,
          original_language: message.original_language,
          translated_text: message.translated_text,
          target_language: message.target_language,
          timestamp: message.timestamp,
        };

        // Send translated message to receiver.
        io.to(receiver_id).emit('receive_message', receiverPayload);

        // Also notify sender for local synchronization.
        io.to(socket.userId).emit('receive_message', receiverPayload);

        if (callback) callback({ ok: true, message: receiverPayload });
      } catch (error) {
        if (callback) callback({ ok: false, error: error.message });
      }
    });
  });
};

module.exports = setupSocket;

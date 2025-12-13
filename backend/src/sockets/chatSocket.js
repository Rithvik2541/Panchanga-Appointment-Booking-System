/**
 * Chat Socket Handler
 * Real-time chat using Socket.IO with JWT authentication
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { saveChatMessage } = require('../services/chatService');

/**
 * Initialize Socket.IO chat functionality
 * @param {Object} io - Socket.IO server instance
 */
const initChatSocket = (io) => {
  // Socket.IO middleware for JWT authentication
  io.use((socket, next) => {
    try {
      // Get token from handshake auth
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user info to socket
      socket.user = {
        id: decoded.id,
        role: decoded.role,
        username: decoded.username,
      };

      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.user.id})`);

    // Join a room with the user's ID (for direct messaging)
    socket.join(socket.user.id);

    // Also join a room based on role (for broadcasting to all admins, consultants, etc.)
    socket.join(socket.user.role);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to chat server',
      user: socket.user,
    });

    /**
     * Handle sending a message
     * Payload: { toUserId, message, appointmentId? }
     */
    socket.on('send_message', async (data) => {
      try {
        const { toUserId, message, appointmentId } = data;

        if (!toUserId || !message) {
          socket.emit('error', { message: 'Missing required fields: toUserId, message' });
          return;
        }

        // Prepare message data
        const messageData = {
          fromUserId: socket.user.id,
          fromUsername: socket.user.username,
          toUserId,
          message,
          appointmentId: appointmentId || null,
          timestamp: new Date(),
        };

        // Optionally save to database (via chatService)
        // await saveChatMessage(messageData);

        // Emit message to the recipient's room
        io.to(toUserId).emit('receive_message', messageData);

        // Also send confirmation to sender
        socket.emit('message_sent', {
          success: true,
          message: 'Message sent successfully',
          data: messageData,
        });

        console.log(`💬 Message from ${socket.user.username} to ${toUserId}: ${message}`);
      } catch (error) {
        console.error('Error sending message:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Handle typing indicator
     * Payload: { toUserId }
     */
    socket.on('typing', (data) => {
      const { toUserId } = data;
      if (toUserId) {
        io.to(toUserId).emit('user_typing', {
          userId: socket.user.id,
          username: socket.user.username,
        });
      }
    });

    /**
     * Handle stop typing indicator
     * Payload: { toUserId }
     */
    socket.on('stop_typing', (data) => {
      const { toUserId } = data;
      if (toUserId) {
        io.to(toUserId).emit('user_stop_typing', {
          userId: socket.user.id,
          username: socket.user.username,
        });
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.username} (${socket.user.id})`);
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('✅ Chat socket initialized');
};

module.exports = {
  initChatSocket,
};

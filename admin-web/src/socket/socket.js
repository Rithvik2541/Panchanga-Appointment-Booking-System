import io from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
let socket = null;

/**
 * Initialize socket connection with JWT auth
 */
export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(API_BASE_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Send message via socket
 */
export const sendMessage = (toUserId, message, appointmentId = null) => {
  if (socket?.connected) {
    socket.emit('send_message', { toUserId, message, appointmentId });
  }
};

/**
 * Listen for incoming messages
 */
export const onReceiveMessage = (callback) => {
  if (socket) {
    socket.on('receive_message', callback);
  }
};

/**
 * Stop listening for incoming messages
 */
export const offReceiveMessage = (callback) => {
  if (socket) {
    socket.off('receive_message', callback);
  }
};

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getSocket, sendMessage, onReceiveMessage, offReceiveMessage } from '../socket/socket';
import { useAuth } from '../context/AuthContext';

export const ChatPanel = ({ selectedAdmin }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const socket = getSocket();

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      // Check if message is from the selected admin
      if (data.fromUserId === selectedAdmin._id) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: data.message,
            fromUsername: data.fromUsername,
            isSentByMe: false,
            timestamp: new Date(),
          },
        ]);
      }
    };

    onReceiveMessage(handleReceiveMessage);

    return () => {
      offReceiveMessage(handleReceiveMessage);
    };
  }, [selectedAdmin]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !socket?.connected) return;

    // Add message to UI optimistically
    const newMessage = {
      id: Date.now(),
      text: messageText,
      fromUsername: user?.username || 'You',
      isSentByMe: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Send via socket using _id
    setIsSending(true);
    sendMessage(selectedAdmin._id, messageText);
    setMessageText('');
    setIsSending(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h2 className="text-lg font-bold">{selectedAdmin.username}</h2>
        <p className="text-sm opacity-90">{selectedAdmin.mail}</p>
        <p className={`text-xs mt-1 ${socket?.connected ? 'text-green-200' : 'text-red-200'}`}>
          {socket?.connected ? '🟢 Connected' : '🔴 Disconnected'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-black mb-2">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isSentByMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.isSentByMe
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-300 text-gray-900 rounded-bl-none'
                }`}
              >
                {!msg.isSentByMe && (
                  <p className="text-xs font-semibold opacity-70 mb-1">
                    {msg.fromUsername}
                  </p>
                )}
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t text-black mb-2 p-4 bg-white">
        <div className="flex gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            disabled={!socket?.connected}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!socket?.connected || !messageText.trim() || isSending}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
};

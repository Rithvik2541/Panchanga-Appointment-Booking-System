import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../data/services/chat_service.dart';
import '../../../core/constants/theme.dart';
import '../../../core/utils/storage.dart';

class ChatScreen extends StatefulWidget {
  final String adminUserId; // Admin's user ID to chat with

  const ChatScreen({super.key, required this.adminUserId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isConnected = false;
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _connectToChat();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    ChatService.disconnect();
    super.dispose();
  }

  Future<void> _connectToChat() async {
    try {
      await ChatService.connect();
      
      setState(() => _isConnected = ChatService.isConnected);

      if (!_isConnected) {
        Fluttertoast.showToast(
          msg: "Failed to connect to chat",
          backgroundColor: AppTheme.errorColor,
        );
        return;
      }

      // Listen for incoming messages
      ChatService.onReceiveMessage((data) {
        if (mounted) {
          setState(() {
            _messages.add(
              ChatMessage(
                text: data['message'] ?? '',
                fromUsername: data['fromUsername'] ?? 'Admin',
                isSentByMe: false,
                timestamp: DateTime.parse(
                  data['timestamp'] ?? DateTime.now().toIso8601String(),
                ),
              ),
            );
            _isTyping = false;
          });
          _scrollToBottom();
        }
      });

      // Listen for typing indicator
      ChatService.onUserTyping((data) {
        if (mounted) {
          setState(() => _isTyping = true);
          Future.delayed(const Duration(seconds: 3), () {
            if (mounted) {
              setState(() => _isTyping = false);
            }
          });
        }
      });
    } catch (e) {
      Fluttertoast.showToast(
        msg: "Error connecting to chat: $e",
        backgroundColor: AppTheme.errorColor,
      );
    }
  }

  void _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    // Add message to UI immediately
    final username = await StorageHelper.getUsername() ?? 'Me';
    setState(() {
      _messages.add(
        ChatMessage(
          text: text,
          fromUsername: username,
          isSentByMe: true,
          timestamp: DateTime.now(),
        ),
      );
    });

    // Send message via Socket.IO
    ChatService.sendMessage(widget.adminUserId, text);

    _messageController.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Chat with Admin'),
            Text(
              'Support',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Center(
              child: Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: _isConnected ? AppTheme.successColor : AppTheme.errorColor,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Connection Status
          if (!_isConnected)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(8),
              color: AppTheme.warningColor,
              child: const Text(
                'Connecting to chat...',
                style: TextStyle(color: Colors.white),
                textAlign: TextAlign.center,
              ),
            ),

          // Messages List
          Expanded(
            child: _messages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          size: 64,
                          color: Colors.grey.shade400,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No messages yet',
                          style: AppTheme.bodyText.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Send a message to start chatting',
                          style: AppTheme.caption,
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final message = _messages[index];
                      return _buildMessageBubble(message);
                    },
                  ),
          ),

          // Typing Indicator
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Text(
                    'Admin is typing...',
                    style: AppTheme.caption.copyWith(
                      fontStyle: FontStyle.italic,
                      color: AppTheme.accentColor,
                    ),
                  ),
                ],
              ),
            ),

          // Message Input
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      maxLines: null,
                      textCapitalization: TextCapitalization.sentences,
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: AppTheme.primaryColor,
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white),
                      onPressed: _isConnected ? _sendMessage : null,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    return Align(
      alignment: message.isSentByMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: message.isSentByMe
              ? AppTheme.primaryColor
              : Colors.grey.shade200,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(message.isSentByMe ? 16 : 4),
            bottomRight: Radius.circular(message.isSentByMe ? 4 : 16),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!message.isSentByMe)
              Text(
                message.fromUsername,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textSecondary,
                ),
              ),
            Text(
              message.text,
              style: TextStyle(
                fontSize: 15,
                color: message.isSentByMe ? Colors.white : AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _formatTime(message.timestamp),
              style: TextStyle(
                fontSize: 10,
                color: message.isSentByMe
                    ? Colors.white70
                    : AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}

/// Chat Message Model
class ChatMessage {
  final String text;
  final String fromUsername;
  final bool isSentByMe;
  final DateTime timestamp;

  ChatMessage({
    required this.text,
    required this.fromUsername,
    required this.isSentByMe,
    required this.timestamp,
  });
}

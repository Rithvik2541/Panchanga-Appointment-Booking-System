import '../../core/utils/socket_service.dart';

/// Chat Service for Socket.IO communication
class ChatService {
  /// Initialize chat connection
  static Future<void> connect() async {
    await SocketService.connect();
  }

  /// Disconnect chat
  static void disconnect() {
    SocketService.disconnect();
  }

  /// Send a message
  static void sendMessage(String toUserId, String message) {
    SocketService.sendMessage(toUserId, message);
  }

  /// Listen for incoming messages
  static void onReceiveMessage(Function(Map<String, dynamic>) callback) {
    SocketService.onReceiveMessage(callback);
  }

  /// Send typing indicator
  static void sendTyping(String toUserId) {
    SocketService.sendTyping(toUserId);
  }

  /// Listen for typing indicator
  static void onUserTyping(Function(Map<String, dynamic>) callback) {
    SocketService.onUserTyping(callback);
  }

  /// Check if connected
  static bool get isConnected => SocketService.isConnected;
}

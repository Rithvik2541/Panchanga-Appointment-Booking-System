import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../constants/api_constants.dart';
import 'storage.dart';

/// Socket.IO Service for Real-time Chat
class SocketService {
  static IO.Socket? _socket;
  static bool _isConnected = false;

  /// Initialize and connect to Socket.IO server
  static Future<void> connect() async {
    if (_isConnected) return;

    final token = await StorageHelper.getToken();
    if (token == null) return;

    _socket = IO.io(
      ApiConstants.socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _socket?.onConnect((_) {
      print('✅ Socket.IO connected');
      _isConnected = true;
    });

    _socket?.onDisconnect((_) {
      print('❌ Socket.IO disconnected');
      _isConnected = false;
    });

    _socket?.onConnectError((error) {
      print('🔴 Socket.IO connection error: $error');
    });

    _socket?.on('error', (error) {
      print('🔴 Socket.IO error: $error');
    });
  }

  /// Disconnect from Socket.IO server
  static void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }

  /// Send a message
  static void sendMessage(String toUserId, String message) {
    if (!_isConnected || _socket == null) {
      print('Socket not connected');
      return;
    }

    _socket!.emit('send_message', {
      'toUserId': toUserId,
      'message': message,
    });
  }

  /// Listen for incoming messages
  static void onReceiveMessage(Function(Map<String, dynamic>) callback) {
    _socket?.on('receive_message', (data) {
      callback(data as Map<String, dynamic>);
    });
  }

  /// Send typing indicator
  static void sendTyping(String toUserId) {
    if (!_isConnected || _socket == null) return;
    _socket!.emit('typing', {'toUserId': toUserId});
  }

  /// Listen for typing indicator
  static void onUserTyping(Function(Map<String, dynamic>) callback) {
    _socket?.on('user_typing', (data) {
      callback(data as Map<String, dynamic>);
    });
  }

  /// Check if connected
  static bool get isConnected => _isConnected;
}

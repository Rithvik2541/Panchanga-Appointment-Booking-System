import 'package:flutter/material.dart';
import '../data/services/auth_service.dart';
import '../core/utils/storage.dart';

/// Authentication Provider
class AuthProvider with ChangeNotifier {
  bool _isAuthenticated = false;
  bool _isLoading = false;
  bool _hasCheckedAuth = false;
  String? _userId;
  String? _username;
  String? _email;
  String? _role;
  String? _errorMessage;

  // Getters
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  bool get hasCheckedAuth => _hasCheckedAuth;
  String? get userId => _userId;
  String? get username => _username;
  String? get email => _email;
  String? get role => _role;
  String? get errorMessage => _errorMessage;

  /// Check if user is already logged in
  Future<void> checkAuthStatus() async {
    if (_hasCheckedAuth) return;

    _hasCheckedAuth = true;
    _isLoading = true;
    notifyListeners();

    final isLoggedIn = await StorageHelper.isLoggedIn();
    if (isLoggedIn) {
      _isAuthenticated = true;
      _userId = await StorageHelper.getUserId();
      _username = await StorageHelper.getUsername();
      _email = await StorageHelper.getEmail();
      _role = await StorageHelper.getRole();
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Register
  Future<bool> register(String email, String username, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await AuthService.register(
      email: email,
      username: username,
      password: password,
    );

    _isLoading = false;
    
    if (result['success'] == true) {
      notifyListeners();
      return true;
    } else {
      _errorMessage = result['message'];
      notifyListeners();
      return false;
    }
  }

  /// Verify OTP
  Future<bool> verifyOtp(String email, String otp) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await AuthService.verifyOtp(email: email, otp: otp);

    _isLoading = false;
    
    if (result['success'] == true) {
      notifyListeners();
      return true;
    } else {
      _errorMessage = result['message'];
      notifyListeners();
      return false;
    }
  }

  /// Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await AuthService.login(email: email, password: password);

    _isLoading = false;
    
    if (result['success'] == true) {
      _isAuthenticated = true;
      _userId = result['user']['id'];
      _username = result['user']['username'];
      _email = result['user']['mail'];
      _role = result['user']['role'];
      notifyListeners();
      return true;
    } else {
      _errorMessage = result['message'];
      notifyListeners();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    await AuthService.logout();
    _isAuthenticated = false;
    _userId = null;
    _username = null;
    _email = null;
    _role = null;
    notifyListeners();
  }

  /// Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}

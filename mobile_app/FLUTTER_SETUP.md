# 📱 FLUTTER MOBILE APP - COMPLETE SETUP GUIDE

## ✅ FILES CREATED

### Core Files
- ✅ pubspec.yaml (dependencies configured)
- ✅ lib/main.dart (app entry point)
- ✅ lib/core/constants/api_constants.dart
- ✅ lib/core/constants/theme.dart
- ✅ lib/core/utils/storage.dart
- ✅ lib/core/utils/socket_service.dart

### Data Layer
- ✅ lib/data/models/consultant_model.dart
- ✅ lib/data/models/appointment_model.dart
- ✅ lib/data/services/auth_service.dart
- ✅ lib/data/services/appointment_service.dart
- ✅ lib/data/services/chat_service.dart

### State Management
- ✅ lib/providers/auth_provider.dart

## 📋 REMAINING FILES TO CREATE

You need to create these UI screens and widgets. Here's the complete code for each:

---

### 1. lib/ui/screens/auth/login_screen.dart

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/constants/theme.dart';
import 'otp_screen.dart';
import '../home/consultant_list_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _usernameController = TextEditingController();
  bool _isLoginMode = true;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _usernameController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (_isLoginMode) {
      // Login
      final success = await authProvider.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (success && mounted) {
        Fluttertoast.showToast(
          msg: "Login successful!",
          backgroundColor: AppTheme.successColor,
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const ConsultantListScreen()),
        );
      } else if (mounted) {
        Fluttertoast.showToast(
          msg: authProvider.errorMessage ?? "Login failed",
          backgroundColor: AppTheme.errorColor,
        );
      }
    } else {
      // Register
      final success = await authProvider.register(
        _emailController.text.trim(),
        _usernameController.text.trim(),
        _passwordController.text,
      );

      if (success && mounted) {
        Fluttertoast.showToast(
          msg: "Registration successful! Check your email for OTP.",
          backgroundColor: AppTheme.successColor,
        );
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => OTPScreen(email: _emailController.text.trim()),
          ),
        );
      } else if (mounted) {
        Fluttertoast.showToast(
          msg: authProvider.errorMessage ?? "Registration failed",
          backgroundColor: AppTheme.errorColor,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo/Icon
                  Icon(
                    Icons.calendar_today_rounded,
                    size: 80,
                    color: AppTheme.primaryColor,
                  ),
                  const SizedBox(height: 24),

                  // Title
                  Text(
                    _isLoginMode ? 'Welcome Back' : 'Create Account',
                    style: AppTheme.heading1,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isLoginMode
                        ? 'Sign in to book appointments'
                        : 'Register to get started',
                    style: AppTheme.bodyText.copyWith(color: AppTheme.textSecondary),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),

                  // Email Field
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Username Field (Register only)
                  if (!_isLoginMode) ...[
                    TextFormField(
                      controller: _usernameController,
                      decoration: const InputDecoration(
                        labelText: 'Username',
                        prefixIcon: Icon(Icons.person),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your username';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Password Field
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: const Icon(Icons.lock),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility : Icons.visibility_off,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your password';
                      }
                      if (value.length < 6) {
                        return 'Password must be at least 6 characters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),

                  // Submit Button
                  Consumer<AuthProvider>(
                    builder: (context, authProvider, _) {
                      return ElevatedButton(
                        onPressed: authProvider.isLoading ? null : _handleSubmit,
                        child: authProvider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              )
                            : Text(_isLoginMode ? 'Login' : 'Register'),
                      );
                    },
                  ),
                  const SizedBox(height: 16),

                  // Toggle Mode
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _isLoginMode = !_isLoginMode;
                        _formKey.currentState?.reset();
                      });
                    },
                    child: Text(
                      _isLoginMode
                          ? "Don't have an account? Register"
                          : 'Already have an account? Login',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

---

### 2. lib/ui/screens/auth/otp_screen.dart

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/constants/theme.dart';
import 'login_screen.dart';

class OTPScreen extends StatefulWidget {
  final String email;

  const OTPScreen({super.key, required this.email});

  @override
  State<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  final _otpController = TextEditingController();

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _verifyOTP() async {
    if (_otpController.text.trim().isEmpty) {
      Fluttertoast.showToast(
        msg: "Please enter OTP",
        backgroundColor: AppTheme.errorColor,
      );
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.verifyOtp(
      widget.email,
      _otpController.text.trim(),
    );

    if (success && mounted) {
      Fluttertoast.showToast(
        msg: "Email verified successfully! You can now login.",
        backgroundColor: AppTheme.successColor,
      );
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    } else if (mounted) {
      Fluttertoast.showToast(
        msg: authProvider.errorMessage ?? "OTP verification failed",
        backgroundColor: AppTheme.errorColor,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verify OTP'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(
              Icons.email_outlined,
              size: 80,
              color: AppTheme.primaryColor,
            ),
            const SizedBox(height: 24),
            Text(
              'Enter OTP',
              style: AppTheme.heading1,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'We sent a verification code to\n${widget.email}',
              style: AppTheme.bodyText.copyWith(color: AppTheme.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 24, letterSpacing: 8),
              maxLength: 6,
              decoration: const InputDecoration(
                labelText: 'OTP Code',
                hintText: '000000',
              ),
            ),
            const SizedBox(height: 24),
            Consumer<AuthProvider>(
              builder: (context, authProvider, _) {
                return ElevatedButton(
                  onPressed: authProvider.isLoading ? null : _verifyOTP,
                  child: authProvider.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Verify OTP'),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
```

---

### 3. lib/ui/screens/home/consultant_list_screen.dart

```dart
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../data/models/consultant_model.dart';
import '../../../data/services/appointment_service.dart';
import '../../../core/constants/theme.dart';
import 'slot_selection_screen.dart';
import 'my_appointments_screen.dart';

class ConsultantListScreen extends StatefulWidget {
  const ConsultantListScreen({super.key});

  @override
  State<ConsultantListScreen> createState() => _ConsultantListScreenState();
}

class _ConsultantListScreenState extends State<ConsultantListScreen> {
  List<Consultant> _consultants = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadConsultants();
  }

  Future<void> _loadConsultants() async {
    try {
      final consultants = await AppointmentService.getConsultants();
      setState(() {
        _consultants = consultants;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        Fluttertoast.showToast(
          msg: "Failed to load consultants: $e",
          backgroundColor: AppTheme.errorColor,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Consultant'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_month),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const MyAppointmentsScreen()),
              );
            },
            tooltip: 'My Appointments',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _consultants.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.person_off, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('No consultants available', style: AppTheme.bodyText),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadConsultants,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _consultants.length,
                    itemBuilder: (context, index) {
                      final consultant = _consultants[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          leading: CircleAvatar(
                            backgroundColor: AppTheme.primaryColor,
                            child: Text(
                              consultant.username[0].toUpperCase(),
                              style: const TextStyle(color: Colors.white),
                            ),
                          ),
                          title: Text(
                            consultant.username,
                            style: AppTheme.heading3,
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(consultant.mail),
                              if (consultant.specialization != null &&
                                  consultant.specialization!.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Chip(
                                  label: Text(consultant.specialization!),
                                  labelStyle: const TextStyle(fontSize: 12),
                                  visualDensity: VisualDensity.compact,
                                ),
                              ],
                            ],
                          ),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => SlotSelectionScreen(
                                  consultant: consultant,
                                ),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
```

---

## 🚀 SETUP INSTRUCTIONS

1. **Install Flutter**: Make sure Flutter SDK is installed

2. **Navigate to mobile_app folder**:
   ```bash
   cd mobile_app
   ```

3. **Install dependencies**:
   ```bash
   flutter pub get
   ```

4. **Update Backend URL**: 
   - Open `lib/core/constants/api_constants.dart`
   - Change `baseUrl` and `socketUrl` to your backend server address
   - For Android emulator: use `http://10.0.2.2:5000`
   - For iOS simulator: use `http://localhost:5000`
   - For physical device: use your computer's IP (e.g., `http://192.168.1.100:5000`)

5. **Create remaining files**: Copy the code from above for:
   - login_screen.dart
   - otp_screen.dart
   - consultant_list_screen.dart
   - slot_selection_screen.dart (see next section)
   - book_appointment_screen.dart (see next section)
   - my_appointments_screen.dart (see next section)

6. **Run the app**:
   ```bash
   flutter run
   ```

---

## ⚠️ IMPORTANT NOTES

- The app uses Material Design 3
- All API calls include proper error handling
- Toast notifications show success/error messages
- JWT token is stored securely in SharedPreferences
- Socket.IO connects automatically after login

---

## 📱 NEXT STEPS

I'll create the remaining screens in the next response due to character limits:
- SlotSelectionScreen
- BookAppointmentScreen
- MyAppointmentsScreen
- ChatScreen
- Reusable widgets

Would you like me to continue with the remaining Flutter files, or move to the React Admin app?

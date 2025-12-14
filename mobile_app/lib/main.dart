import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/theme.dart';
import 'providers/auth_provider.dart';
import 'ui/screens/auth/login_screen.dart';
import 'ui/screens/home/consultant_list_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          // Check auth status once on app start
          if (!authProvider.hasCheckedAuth) {
            authProvider.checkAuthStatus();
          }

          return MaterialApp(
            title: 'Appointment Booking',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            home: authProvider.isAuthenticated
                ? const ConsultantListScreen()
                : const LoginScreen(),
          );
        },
      ),
    );
  }
}

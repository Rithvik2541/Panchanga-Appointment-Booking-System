/// API Configuration Constants
class ApiConstants {
  // Base URL - Change this to your backend server URL
  static const String baseUrl = 'http://localhost:5000';
  
  // Auth Endpoints
  static const String register = '/api/auth/register';
  static const String verifyOtp = '/api/auth/verify-otp';
  static const String login = '/api/auth/login';
  
  // Consultant Endpoints
  static const String consultants = '/api/consultants';
  static String consultantById(String id) => '/api/consultants/$id';
  
  // Appointment Endpoints
  static const String appointments = '/api/appointments';
  static const String myAppointments = '/api/appointments/my';
  static String cancelAppointment(String id) => '/api/appointments/$id/cancel';
  
  // Socket.IO
  static const String socketUrl = 'http://localhost:5000';
}

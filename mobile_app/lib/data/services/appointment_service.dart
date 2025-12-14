import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/consultant_model.dart';
import '../models/appointment_model.dart';
import '../../core/constants/api_constants.dart';
import '../../core/utils/storage.dart';

/// Appointment Service
class AppointmentService {
  /// Get Authorization header
  static Future<Map<String, String>> _getHeaders() async {
    final token = await StorageHelper.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  /// Get all consultants
  static Future<List<Consultant>> getConsultants() async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.consultants}');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List consultantsList = data['data'] ?? [];
        return consultantsList.map((json) => Consultant.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load consultants');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Get consultant by ID
  static Future<Consultant> getConsultantById(String id) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.consultantById(id)}');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Consultant.fromJson(data['data']);
      } else {
        throw Exception('Failed to load consultant');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Book an appointment
  static Future<Map<String, dynamic>> bookAppointment({
    required String consultantId,
    required String appointmentDate,
    required String appointmentTime,
  }) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.appointments}');
      final headers = await _getHeaders();
      
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'consultantId': consultantId,
          'appointmentDate': appointmentDate,
          'appointmentTime': appointmentTime,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 && data['success'] == true) {
        return {
          'success': true,
          'message': data['message'] ?? 'Appointment booked successfully',
          'appointment': Appointment.fromJson(data['data']),
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to book appointment',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  /// Get my appointments
  static Future<List<Appointment>> getMyAppointments() async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.myAppointments}');
      final headers = await _getHeaders();
      
      final response = await http.get(url, headers: headers);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List appointmentsList = data['data'] ?? [];
        return appointmentsList.map((json) => Appointment.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load appointments');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Cancel an appointment
  static Future<Map<String, dynamic>> cancelAppointment(String appointmentId) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.cancelAppointment(appointmentId)}');
      final headers = await _getHeaders();
      
      final response = await http.patch(url, headers: headers);
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'message': data['message'] ?? 'Appointment cancelled successfully',
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to cancel appointment',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }
}

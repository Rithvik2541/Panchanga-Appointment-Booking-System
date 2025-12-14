import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:intl/intl.dart';
import '../../../data/models/consultant_model.dart';
import '../../../data/services/appointment_service.dart';
import '../../../core/constants/theme.dart';
import 'my_appointments_screen.dart';

class BookAppointmentScreen extends StatefulWidget {
  final Consultant consultant;
  final DateTime date;
  final String timeSlot;

  const BookAppointmentScreen({
    super.key,
    required this.consultant,
    required this.date,
    required this.timeSlot,
  });

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  bool _isLoading = false;

  Future<void> _confirmBooking() async {
    // Show confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Appointment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Please confirm your appointment details:'),
            const SizedBox(height: 16),
            _buildDetailRow(
              'Consultant',
              widget.consultant.username,
              Icons.person,
            ),
            _buildDetailRow(
              'Date',
              DateFormat('EEEE, MMM d, yyyy').format(widget.date),
              Icons.calendar_today,
            ),
            _buildDetailRow(
              'Time',
              widget.timeSlot,
              Icons.access_time,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    // Book appointment
    setState(() => _isLoading = true);

    final result = await AppointmentService.bookAppointment(
      consultantId: widget.consultant.id,
      appointmentDate: DateFormat('yyyy-MM-dd').format(widget.date),
      appointmentTime: widget.timeSlot,
    );

    setState(() => _isLoading = false);

    if (result['success'] == true && mounted) {
      Fluttertoast.showToast(
        msg: result['message'] ?? "Appointment booked successfully!",
        backgroundColor: AppTheme.successColor,
        toastLength: Toast.LENGTH_LONG,
      );

      // Navigate to My Appointments screen
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const MyAppointmentsScreen()),
        (route) => route.isFirst, // Keep only the first route (home)
      );
    } else if (mounted) {
      Fluttertoast.showToast(
        msg: result['message'] ?? "Failed to book appointment",
        backgroundColor: AppTheme.errorColor,
        toastLength: Toast.LENGTH_LONG,
      );
    }
  }

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.primaryColor),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTheme.caption,
              ),
              Text(
                value,
                style: AppTheme.bodyText.copyWith(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Confirm Booking'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Success Icon
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: AppTheme.accentColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check_circle_outline,
                        size: 80,
                        color: AppTheme.accentColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Title
                  const Text(
                    'Appointment Details',
                    style: AppTheme.heading2,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),

                  // Details Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildDetailRow(
                            'Consultant',
                            widget.consultant.username,
                            Icons.person,
                          ),
                          if (widget.consultant.specialization != null &&
                              widget.consultant.specialization!.isNotEmpty)
                            _buildDetailRow(
                              'Specialization',
                              widget.consultant.specialization!,
                              Icons.medical_services,
                            ),
                          _buildDetailRow(
                            'Email',
                            widget.consultant.mail,
                            Icons.email,
                          ),
                          const Divider(height: 32),
                          _buildDetailRow(
                            'Date',
                            DateFormat('EEEE, MMM d, yyyy').format(widget.date),
                            Icons.calendar_today,
                          ),
                          _buildDetailRow(
                            'Time',
                            widget.timeSlot,
                            Icons.access_time,
                          ),
                          _buildDetailRow(
                            'Duration',
                            '30 minutes',
                            Icons.timer,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Info Note
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.accentColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppTheme.accentColor.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.info_outline,
                          color: AppTheme.accentColor,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'You will receive a reminder email 15 minutes before your appointment.',
                            style: AppTheme.caption.copyWith(
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Confirm Button
                  ElevatedButton(
                    onPressed: _confirmBooking,
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Text(
                        'Confirm Appointment',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Cancel Button
                  OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.textPrimary,
                      side: const BorderSide(color: Colors.grey),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Go Back'),
                  ),
                ],
              ),
            ),
    );
  }
}

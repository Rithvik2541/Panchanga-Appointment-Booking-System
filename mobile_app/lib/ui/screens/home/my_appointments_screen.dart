import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../data/models/appointment_model.dart';
import '../../../data/services/appointment_service.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/constants/theme.dart';
import '../../widgets/appointment_card.dart';

class MyAppointmentsScreen extends StatefulWidget {
  const MyAppointmentsScreen({super.key});

  @override
  State<MyAppointmentsScreen> createState() => _MyAppointmentsScreenState();
}

class _MyAppointmentsScreenState extends State<MyAppointmentsScreen> {
  List<Appointment> _appointments = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAppointments();
  }

  Future<void> _loadAppointments() async {
    setState(() => _isLoading = true);

    try {
      final appointments = await AppointmentService.getMyAppointments();
      
      // Sort by slot start time (most recent first)
      appointments.sort((a, b) => b.slotStart.compareTo(a.slotStart));
      
      setState(() {
        _appointments = appointments;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        Fluttertoast.showToast(
          msg: "Failed to load appointments: $e",
          backgroundColor: AppTheme.errorColor,
        );
      }
    }
  }

  Future<void> _cancelAppointment(Appointment appointment) async {
    // Show confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Appointment'),
        content: Text(
          'Are you sure you want to cancel your appointment with ${appointment.consultantId.username} on ${DateFormat('MMM d, yyyy').format(appointment.appointmentDate)} at ${appointment.appointmentTime}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.errorColor,
            ),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    // Cancel appointment
    final result = await AppointmentService.cancelAppointment(appointment.id);

    if (result['success'] == true && mounted) {
      Fluttertoast.showToast(
        msg: result['message'] ?? "Appointment cancelled successfully",
        backgroundColor: AppTheme.successColor,
      );
      _loadAppointments(); // Reload appointments
    } else if (mounted) {
      Fluttertoast.showToast(
        msg: result['message'] ?? "Failed to cancel appointment",
        backgroundColor: AppTheme.errorColor,
      );
    }
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.errorColor,
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.logout();
      // The main.dart will automatically navigate to login screen
    }
  }

  @override
  Widget build(BuildContext context) {
    final upcomingAppointments = _appointments
        .where((a) => a.status != 'CANCELLED' && a.status != 'COMPLETED')
        .toList();
    final pastAppointments = _appointments
        .where((a) => a.status == 'CANCELLED' || a.status == 'COMPLETED')
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Appointments'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _appointments.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.event_busy,
                        size: 80,
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No appointments yet',
                        style: AppTheme.heading3.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Book your first appointment',
                        style: AppTheme.bodyText.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.add),
                        label: const Text('Book Appointment'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadAppointments,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Upcoming Appointments
                      if (upcomingAppointments.isNotEmpty) ...[
                        Row(
                          children: [
                            const Icon(
                              Icons.schedule,
                              color: AppTheme.accentColor,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Upcoming (${upcomingAppointments.length})',
                              style: AppTheme.heading3,
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ...upcomingAppointments.map(
                          (appointment) => AppointmentCard(
                            appointment: appointment,
                            onCancel: appointment.canBeCancelled
                                ? () => _cancelAppointment(appointment)
                                : null,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],

                      // Past Appointments
                      if (pastAppointments.isNotEmpty) ...[
                        Row(
                          children: [
                            const Icon(
                              Icons.history,
                              color: Colors.grey,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Past (${pastAppointments.length})',
                              style: AppTheme.heading3.copyWith(
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ...pastAppointments.map(
                          (appointment) => AppointmentCard(
                            appointment: appointment,
                            onCancel: null, // Cannot cancel past appointments
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
    );
  }
}

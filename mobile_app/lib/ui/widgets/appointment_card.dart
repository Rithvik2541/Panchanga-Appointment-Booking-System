import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/appointment_model.dart';
import '../../core/constants/theme.dart';

/// Reusable Appointment Card Widget
class AppointmentCard extends StatelessWidget {
  final Appointment appointment;
  final VoidCallback? onCancel;

  const AppointmentCard({
    super.key,
    required this.appointment,
    this.onCancel,
  });

  Color _getStatusColor() {
    switch (appointment.status) {
      case 'PENDING':
        return AppTheme.warningColor;
      case 'CONFIRMED':
        return AppTheme.accentColor;
      case 'COMPLETED':
        return AppTheme.successColor;
      case 'CANCELLED':
        return AppTheme.errorColor;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon() {
    switch (appointment.status) {
      case 'PENDING':
        return Icons.schedule;
      case 'CONFIRMED':
        return Icons.check_circle;
      case 'COMPLETED':
        return Icons.task_alt;
      case 'CANCELLED':
        return Icons.cancel;
      default:
        return Icons.help;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPast = appointment.status == 'CANCELLED' || 
                    appointment.status == 'COMPLETED';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: isPast ? 1 : 2,
      color: isPast ? Colors.grey.shade50 : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Consultant Name and Status
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: _getStatusColor().withOpacity(0.2),
                  child: Text(
                    appointment.consultantId.username[0].toUpperCase(),
                    style: TextStyle(
                      color: _getStatusColor(),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        appointment.consultantId.username,
                        style: AppTheme.heading3.copyWith(
                          color: isPast ? AppTheme.textSecondary : AppTheme.textPrimary,
                        ),
                      ),
                      Text(
                        appointment.consultantId.mail,
                        style: AppTheme.caption,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor().withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _getStatusColor().withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getStatusIcon(),
                        size: 14,
                        color: _getStatusColor(),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        appointment.status,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: _getStatusColor(),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Appointment Details
            Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 16,
                  color: isPast ? Colors.grey : AppTheme.primaryColor,
                ),
                const SizedBox(width: 8),
                Text(
                  DateFormat('EEEE, MMM d, yyyy').format(appointment.appointmentDate),
                  style: AppTheme.bodyText.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isPast ? AppTheme.textSecondary : AppTheme.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  Icons.access_time,
                  size: 16,
                  color: isPast ? Colors.grey : AppTheme.primaryColor,
                ),
                const SizedBox(width: 8),
                Text(
                  '${appointment.appointmentTime} (30 min)',
                  style: AppTheme.bodyText.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isPast ? AppTheme.textSecondary : AppTheme.textPrimary,
                  ),
                ),
              ],
            ),

            // Cancel Button
            if (onCancel != null && appointment.canBeCancelled) ...[
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    onPressed: onCancel,
                    icon: const Icon(Icons.cancel, size: 18),
                    label: const Text('Cancel Appointment'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppTheme.errorColor,
                    ),
                  ),
                ],
              ),
            ],

            // Reminder Indicator
            if (appointment.reminderSent) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppTheme.accentColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.email,
                      size: 12,
                      color: AppTheme.accentColor,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Reminder sent',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppTheme.accentColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

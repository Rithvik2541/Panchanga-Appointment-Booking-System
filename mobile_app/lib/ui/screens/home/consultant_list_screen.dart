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
    setState(() {
      _isLoading = true;
    });

    try {
      final consultants = await AppointmentService.getConsultants();
      setState(() {
        _consultants = consultants;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      Fluttertoast.showToast(
        msg: 'Failed to load consultants: $e',
        backgroundColor: AppTheme.errorColor,
      );
    }
  }

  void _navigateToSlotSelection(Consultant consultant) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SlotSelectionScreen(consultant: consultant),
      ),
    );
  }

  void _navigateToMyAppointments() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const MyAppointmentsScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Available Consultants'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today),
            onPressed: _navigateToMyAppointments,
            tooltip: 'My Appointments',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadConsultants,
              child: _consultants.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.person_off,
                            size: 64,
                            color: Colors.grey.shade400,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No consultants available',
                            style: AppTheme.bodyText.copyWith(
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _consultants.length,
                      itemBuilder: (context, index) {
                        final consultant = _consultants[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          elevation: 2,
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(16),
                            leading: CircleAvatar(
                              radius: 30,
                              backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                              child: Text(
                                consultant.username[0].toUpperCase(),
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryColor,
                                ),
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
                                Text(
                                  consultant.mail,
                                  style: AppTheme.caption,
                                ),
                                const SizedBox(height: 8),
                                Chip(
                                  label: Text(
                                    consultant.specialization ?? 'General',
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                  backgroundColor: AppTheme.accentColor.withOpacity(0.2),
                                  padding: EdgeInsets.zero,
                                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                              ],
                            ),
                            trailing: Icon(
                              Icons.arrow_forward_ios,
                              color: AppTheme.primaryColor,
                            ),
                            onTap: () => _navigateToSlotSelection(consultant),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}

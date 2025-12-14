import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:intl/intl.dart';
import '../../../data/models/consultant_model.dart';
import '../../../core/constants/theme.dart';
import 'book_appointment_screen.dart';

class SlotSelectionScreen extends StatefulWidget {
  final Consultant consultant;

  const SlotSelectionScreen({super.key, required this.consultant});

  @override
  State<SlotSelectionScreen> createState() => _SlotSelectionScreenState();
}

class _SlotSelectionScreenState extends State<SlotSelectionScreen> {
  DateTime _selectedDate = DateTime.now();
  String? _selectedSlot;
  
  // Generate available time slots (10:00 AM - 5:30 PM, 30-minute intervals)
  final List<String> _timeSlots = [
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
  ];

  // Filter slots based on business rules
  List<String> get _availableSlots {
    final now = DateTime.now();
    final selectedDateStart = DateTime(_selectedDate.year, _selectedDate.month, _selectedDate.day);
    final isToday = selectedDateStart.year == now.year &&
        selectedDateStart.month == now.month &&
        selectedDateStart.day == now.day;

    if (isToday) {
      // Filter out past slots for today
      return _timeSlots.where((slot) {
        final parts = slot.split(':');
        final slotTime = DateTime(
          now.year,
          now.month,
          now.day,
          int.parse(parts[0]),
          int.parse(parts[1]),
        );
        return slotTime.isAfter(now);
      }).toList();
    }

    return _timeSlots;
  }

  Future<void> _selectDate(BuildContext context) async {
    final now = DateTime.now();
    final firstDate = now;
    final lastDate = now.add(const Duration(days: 90));

    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: firstDate,
      lastDate: lastDate,
      selectableDayPredicate: (date) {
        // Only allow weekdays (Monday-Friday)
        return date.weekday >= DateTime.monday && date.weekday <= DateTime.friday;
      },
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primaryColor,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
        _selectedSlot = null; // Reset selected slot
      });
    }
  }

  void _proceedToBooking() {
    if (_selectedSlot == null) {
      Fluttertoast.showToast(
        msg: "Please select a time slot",
        backgroundColor: AppTheme.warningColor,
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => BookAppointmentScreen(
          consultant: widget.consultant,
          date: _selectedDate,
          timeSlot: _selectedSlot!,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final availableSlots = _availableSlots;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Date & Time'),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Consultant Info Card
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppTheme.primaryColor,
                    child: Text(
                      widget.consultant.username[0].toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.consultant.username,
                          style: AppTheme.heading3,
                        ),
                        const SizedBox(height: 4),
                        if (widget.consultant.specialization != null &&
                            widget.consultant.specialization!.isNotEmpty)
                          Text(
                            widget.consultant.specialization!,
                            style: AppTheme.caption,
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Date Selection
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Card(
              child: ListTile(
                leading: const Icon(Icons.calendar_today, color: AppTheme.primaryColor),
                title: const Text('Select Date'),
                subtitle: Text(
                  DateFormat('EEEE, MMM d, yyyy').format(_selectedDate),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () => _selectDate(context),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Time Slots Label
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Available Time Slots',
              style: AppTheme.heading3,
            ),
          ),
          const SizedBox(height: 8),

          // Time Slots Grid
          Expanded(
            child: availableSlots.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.event_busy,
                          size: 64,
                          color: Colors.grey.shade400,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No slots available for this date',
                          style: AppTheme.bodyText.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      childAspectRatio: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: availableSlots.length,
                    itemBuilder: (context, index) {
                      final slot = availableSlots[index];
                      final isSelected = slot == _selectedSlot;

                      return InkWell(
                        onTap: () {
                          setState(() {
                            _selectedSlot = slot;
                          });
                        },
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppTheme.accentColor
                                : Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isSelected
                                  ? AppTheme.accentColor
                                  : Colors.grey.shade300,
                              width: 2,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              slot,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: isSelected ? Colors.white : AppTheme.textPrimary,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // Book Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: ElevatedButton(
              onPressed: _proceedToBooking,
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  'Continue to Book',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

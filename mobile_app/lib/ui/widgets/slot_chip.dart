import 'package:flutter/material.dart';
import '../../core/constants/theme.dart';

/// Reusable Time Slot Chip Widget
class SlotChip extends StatelessWidget {
  final String timeSlot;
  final bool isSelected;
  final bool isAvailable;
  final VoidCallback? onTap;

  const SlotChip({
    super.key,
    required this.timeSlot,
    this.isSelected = false,
    this.isAvailable = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: isAvailable ? onTap : null,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.accentColor
              : isAvailable
                  ? Colors.grey.shade200
                  : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? AppTheme.accentColor
                : isAvailable
                    ? Colors.grey.shade300
                    : Colors.grey.shade200,
            width: 2,
          ),
        ),
        child: Center(
          child: Text(
            timeSlot,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: isSelected
                  ? Colors.white
                  : isAvailable
                      ? AppTheme.textPrimary
                      : AppTheme.textSecondary,
              decoration: isAvailable
                  ? TextDecoration.none
                  : TextDecoration.lineThrough,
            ),
          ),
        ),
      ),
    );
  }
}

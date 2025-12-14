/// Appointment Model
class Appointment {
  final String id;
  final String username;
  final String userMail;
  final String userId;
  final ConsultantInfo consultantId;
  final DateTime appointmentDate;
  final String appointmentTime;
  final DateTime slotStart;
  final DateTime slotEnd;
  final String status;
  final bool reminderSent;
  final DateTime createdAt;
  final DateTime updatedAt;

  Appointment({
    required this.id,
    required this.username,
    required this.userMail,
    required this.userId,
    required this.consultantId,
    required this.appointmentDate,
    required this.appointmentTime,
    required this.slotStart,
    required this.slotEnd,
    required this.status,
    required this.reminderSent,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create from JSON
  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['_id'] ?? json['id'] ?? '',
      username: json['username'] ?? '',
      userMail: json['userMail'] ?? '',
      userId: json['userId'] ?? '',
      consultantId: ConsultantInfo.fromJson(json['consultantId'] ?? {}),
      appointmentDate: DateTime.parse(json['appointmentDate']),
      appointmentTime: json['appointmentTime'] ?? '',
      slotStart: DateTime.parse(json['slotStart']),
      slotEnd: DateTime.parse(json['slotEnd']),
      status: json['status'] ?? 'PENDING',
      reminderSent: json['reminderSent'] ?? false,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'userMail': userMail,
      'userId': userId,
      'consultantId': consultantId.toJson(),
      'appointmentDate': appointmentDate.toIso8601String(),
      'appointmentTime': appointmentTime,
      'slotStart': slotStart.toIso8601String(),
      'slotEnd': slotEnd.toIso8601String(),
      'status': status,
      'reminderSent': reminderSent,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Check if appointment can be cancelled
  bool get canBeCancelled {
    return status != 'CANCELLED' && status != 'COMPLETED' && slotStart.isAfter(DateTime.now());
  }
}

/// Consultant Info in Appointment
class ConsultantInfo {
  final String id;
  final String username;
  final String mail;

  ConsultantInfo({
    required this.id,
    required this.username,
    required this.mail,
  });

  factory ConsultantInfo.fromJson(Map<String, dynamic> json) {
    return ConsultantInfo(
      id: json['_id'] ?? json['id'] ?? '',
      username: json['username'] ?? '',
      mail: json['mail'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'mail': mail,
    };
  }
}

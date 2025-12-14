/// Consultant Model
class Consultant {
  final String id;
  final String mail;
  final String username;
  final String role;
  final String? specialization;
  final bool isVerified;
  final DateTime createdAt;
  final DateTime updatedAt;

  Consultant({
    required this.id,
    required this.mail,
    required this.username,
    required this.role,
    this.specialization,
    required this.isVerified,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create from JSON
  factory Consultant.fromJson(Map<String, dynamic> json) {
    return Consultant(
      id: json['_id'] ?? json['id'] ?? '',
      mail: json['mail'] ?? '',
      username: json['username'] ?? '',
      role: json['role'] ?? 'CONSULTANT',
      specialization: json['specialization'],
      isVerified: json['isVerified'] ?? true,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mail': mail,
      'username': username,
      'role': role,
      'specialization': specialization,
      'isVerified': isVerified,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

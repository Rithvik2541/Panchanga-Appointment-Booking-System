/**
 * Appointment Model
 * Represents appointment bookings in the system
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
  },
  userMail: {
    type: String,
    required: [true, 'User email is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  consultantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultant',
    required: [true, 'Consultant ID is required'],
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    // Normalized to the start of the day (00:00:00)
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    // Format: "HH:mm" (e.g., "10:00", "14:30")
  },
  slotStart: {
    type: Date,
    required: [true, 'Slot start time is required'],
    // Combination of appointmentDate + appointmentTime
  },
  slotEnd: {
    type: Date,
    required: [true, 'Slot end time is required'],
    // slotStart + 30 minutes
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update updatedAt timestamp (Mongoose 9.x async version)
appointmentSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

// Index 1: Prevent overlapping appointments for the same consultant and slot
// Only applies to appointments that are not cancelled
appointmentSchema.index(
  { consultantId: 1, slotStart: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'CANCELLED' } },
  }
);

// Index 2: For querying appointments per day
appointmentSchema.index({ appointmentDate: 1, consultantId: 1 });

// Index 3: For user's appointments lookup
appointmentSchema.index({ userId: 1, appointmentDate: 1 });

// Index 4: For finding appointments needing reminders
appointmentSchema.index({ status: 1, reminderSent: 1, slotStart: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

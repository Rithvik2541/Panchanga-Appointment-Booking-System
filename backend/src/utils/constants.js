/**
 * Application Constants
 * Centralized constants for roles, statuses, and working hours
 */

// User roles
const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  CONSULTANT: 'CONSULTANT',
};

// Appointment statuses
const STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Working hours (24-hour format)
const WORK_START_HOUR = 10;  // 10:00 AM
const WORK_END_HOUR = 18;     // 6:00 PM (last slot starts at 17:30)

// Slot duration in minutes
const SLOT_DURATION_MINUTES = 30;

// OTP expiration time in minutes
const OTP_EXPIRY_MINUTES = 10;

// Maximum appointments per user per day
const MAX_APPOINTMENTS_PER_USER_PER_DAY = 3;

// Reminder time before appointment (in minutes)
const REMINDER_BEFORE_MINUTES = 15;

// Days to keep completed appointments before deletion
const COMPLETED_RETENTION_DAYS = 30;

module.exports = {
  ROLES,
  STATUSES,
  WORK_START_HOUR,
  WORK_END_HOUR,
  SLOT_DURATION_MINUTES,
  OTP_EXPIRY_MINUTES,
  MAX_APPOINTMENTS_PER_USER_PER_DAY,
  REMINDER_BEFORE_MINUTES,
  COMPLETED_RETENTION_DAYS,
};

/**
 * Time Utility Functions
 * Helper functions for time slots and working hours validation
 */

// Working hours constants
const WORK_START_HOUR = 10; // 10:00 AM
const WORK_END_HOUR = 18;    // 6:00 PM (18:00) - last slot starts at 17:30

/**
 * Combines date string and time string into a Date object
 * @param {string} dateStr - Date in format 'YYYY-MM-DD'
 * @param {string} timeStr - Time in format 'HH:mm' (e.g., '10:00', '14:30')
 * @returns {Date} Combined Date object
 */
const combineDateTime = (dateStr, timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Checks if a date is a weekday (Monday-Friday)
 * @param {Date} date - Date to check
 * @returns {boolean} True if weekday (Mon-Fri), false otherwise
 */
const isWeekday = (date) => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday = 1, Friday = 5
};

/**
 * Validates if minutes are valid for 30-minute slots
 * @param {number} totalMinutes - Total minutes in the day (hours * 60 + minutes)
 * @returns {boolean} True if valid slot time (divisible by 30)
 */
const isValidSlotMinutes = (totalMinutes) => {
  return totalMinutes % 30 === 0;
};

/**
 * Checks if a date/time is within working hours
 * Working hours: 10:00-18:00, Monday-Friday, 30-minute slots only
 * @param {Date} date - Date and time to check
 * @returns {boolean} True if within working hours
 */
const isWithinWorkingHours = (date) => {
  // Must be a weekday
  if (!isWeekday(date)) {
    return false;
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Check if hours are within range (10-17, since last slot starts at 17:30)
  if (hours < WORK_START_HOUR || hours >= WORK_END_HOUR) {
    return false;
  }

  // Check if minutes are valid (0 or 30)
  if (minutes !== 0 && minutes !== 30) {
    return false;
  }

  // If hour is 17, only :30 is NOT allowed (last slot is 17:30-18:00)
  // Actually, slots can start at 17:30, so this is fine
  // But slots cannot start at 18:00 or later
  if (hours === 17 && minutes === 30) {
    // This is the last slot of the day (17:30-18:00)
    return true;
  }

  return true;
};

/**
 * Normalizes a date to the start of the day (00:00:00)
 * @param {Date|string} date - Date to normalize
 * @returns {Date} Date set to start of day
 */
const normalizeToStartOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

/**
 * Gets the end time of a slot (start time + 30 minutes)
 * @param {Date} startTime - Slot start time
 * @returns {Date} Slot end time
 */
const getSlotEndTime = (startTime) => {
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 30);
  return endTime;
};

module.exports = {
  WORK_START_HOUR,
  WORK_END_HOUR,
  combineDateTime,
  isWeekday,
  isValidSlotMinutes,
  isWithinWorkingHours,
  normalizeToStartOfDay,
  getSlotEndTime,
};

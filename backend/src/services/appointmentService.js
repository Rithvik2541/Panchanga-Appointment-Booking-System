/**
 * Appointment Service
 * Core business logic for appointment booking and management
 */

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Consultant = require('../models/Consultant');
const {
  combineDateTime,
  isWithinWorkingHours,
  normalizeToStartOfDay,
  getSlotEndTime,
} = require('../utils/timeUtils');
const { STATUSES, MAX_APPOINTMENTS_PER_USER_PER_DAY } = require('../utils/constants');

/**
 * Create a new appointment
 * Business rules:
 * - Working hours: 10:00-18:00 (Mon-Fri)
 * - 30 minute slots only
 * - No overlapping appointments for the same consultant & slot
 * - Max 3 appointments per user per day (excluding CANCELLED)
 * 
 * @param {Object} user - Authenticated user object (from req.user)
 * @param {Object} appointmentData - { consultantId, appointmentDate, appointmentTime }
 * @returns {Promise<Object>} Created appointment
 */
const createAppointment = async (user, appointmentData) => {
  try {
    const { consultantId, appointmentDate, appointmentTime } = appointmentData;

    // Get full user details from appropriate collection
    let userDetails;
    if (user.collection === 'consultants') {
      userDetails = await Consultant.findById(user.id);
    } else {
      userDetails = await User.findById(user.id);
    }
    
    if (!userDetails) {
      throw new Error('User not found');
    }

    // Verify consultant exists
    const consultant = await Consultant.findById(consultantId);
    if (!consultant) {
      throw new Error('Consultant not found');
    }

    // 1. Convert appointmentDate + appointmentTime to slotStart and slotEnd
    const slotStart = combineDateTime(appointmentDate, appointmentTime);
    const slotEnd = getSlotEndTime(slotStart);

    // 2. Validate slot is within working hours and weekday
    if (!isWithinWorkingHours(slotStart)) {
      throw new Error(
        'Invalid appointment time. Working hours are 10:00-18:00, Monday-Friday, with 30-minute slots (00 or 30 minutes)'
      );
    }

    // Ensure appointment is in the future
    if (slotStart <= Date.now()) {
      throw new Error('Appointment time must be in the future');
    }

    // 3. Count user's appointments on that day (status != CANCELLED)
    const dayStart = normalizeToStartOfDay(appointmentDate);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const userAppointmentsCount = await Appointment.countDocuments({
      userId: user.id,
      appointmentDate: dayStart,
      status: { $ne: STATUSES.CANCELLED },
    });

    if (userAppointmentsCount >= MAX_APPOINTMENTS_PER_USER_PER_DAY) {
      throw new Error(
        `Maximum ${MAX_APPOINTMENTS_PER_USER_PER_DAY} appointments per day reached. Please cancel an existing appointment or choose a different day.`
      );
    }

    // 4. Check if slot is already booked for this consultant
    const existingAppointment = await Appointment.findOne({
      consultantId,
      slotStart,
      status: { $ne: STATUSES.CANCELLED },
    });

    if (existingAppointment) {
      throw new Error('This slot is already booked. Please choose a different time.');
    }

    // 5. Create appointment
    const newAppointment = new Appointment({
      username: userDetails.username,
      userMail: userDetails.mail,
      userId: user.id,
      consultantId,
      appointmentDate: dayStart,
      appointmentTime,
      slotStart,
      slotEnd,
      status: STATUSES.PENDING,
    });

    await newAppointment.save();

    // Populate consultant details
    await newAppointment.populate('consultantId', 'username mail');

    return newAppointment;
  } catch (error) {
    throw error;
  }
};

/**
 * Get appointments for admin with filters
 * @param {Object} filters - { date, consultantId, status }
 * @returns {Promise<Array>} List of appointments
 */
const getAppointmentsForAdmin = async (filters = {}) => {
  try {
    const query = {};

    // Filter by date (YYYY-MM-DD)
    if (filters.date) {
      const dayStart = normalizeToStartOfDay(filters.date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      query.appointmentDate = {
        $gte: dayStart,
        $lt: dayEnd,
      };
    }

    // Filter by consultant
    if (filters.consultantId) {
      query.consultantId = filters.consultantId;
    }

    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }

    const appointments = await Appointment.find(query)
      .populate('userId', 'username mail role')
      .populate('consultantId', 'username mail role')
      .sort({ slotStart: 1 });

    return appointments;
  } catch (error) {
    throw error;
  }
};

/**
 * Get appointments for a specific user
 * @param {string} userId - User's ID
 * @returns {Promise<Array>} List of user's appointments
 */
const getAppointmentsForUser = async (userId) => {
  try {
    const appointments = await Appointment.find({ userId })
      .populate('consultantId', 'username mail')
      .sort({ slotStart: -1 });

    return appointments;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel appointment by user
 * Only allowed if status is PENDING or CONFIRMED and slot hasn't started yet
 * @param {string} userId - User's ID
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} Updated appointment
 */
const cancelAppointmentByUser = async (userId, appointmentId) => {
  try {
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId,
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Check if already cancelled or completed
    if (appointment.status === STATUSES.CANCELLED) {
      throw new Error('Appointment is already cancelled');
    }

    if (appointment.status === STATUSES.COMPLETED) {
      throw new Error('Cannot cancel a completed appointment');
    }

    // Check if appointment time hasn't passed
    if (appointment.slotStart <= Date.now()) {
      throw new Error('Cannot cancel an appointment that has already started or passed');
    }

    // Cancel the appointment
    appointment.status = STATUSES.CANCELLED;
    await appointment.save();

    return appointment;
  } catch (error) {
    throw error;
  }
};

/**
 * Update appointment status by admin
 * Allowed transitions:
 * - PENDING -> CONFIRMED
 * - PENDING -> CANCELLED
 * - CONFIRMED -> CANCELLED
 * NOT allowed: Setting COMPLETED manually (auto-handled by cron job)
 * 
 * @param {string} appointmentId - Appointment ID
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Updated appointment
 */
const updateAppointmentStatusByAdmin = async (appointmentId, newStatus) => {
  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const currentStatus = appointment.status;

    // Validate status transitions
    const validTransitions = {
      [STATUSES.PENDING]: [STATUSES.CONFIRMED, STATUSES.CANCELLED],
      [STATUSES.CONFIRMED]: [STATUSES.CANCELLED],
      [STATUSES.CANCELLED]: [], // Cannot change from cancelled
      [STATUSES.COMPLETED]: [], // Cannot change from completed
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }

    // Don't allow manual setting to COMPLETED
    if (newStatus === STATUSES.COMPLETED) {
      throw new Error('COMPLETED status is automatically set by the system');
    }

    appointment.status = newStatus;
    await appointment.save();

    await appointment.populate('userId', 'username mail role');
    await appointment.populate('consultantId', 'username mail role');

    return appointment;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createAppointment,
  getAppointmentsForAdmin,
  getAppointmentsForUser,
  cancelAppointmentByUser,
  updateAppointmentStatusByAdmin,
};

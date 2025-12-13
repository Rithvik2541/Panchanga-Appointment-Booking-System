/**
 * Appointment Controller
 * Handles appointment-related HTTP requests for users
 */

const appointmentService = require('../services/appointmentService');

/**
 * Get all appointments for logged-in user
 * GET /api/appointments/my
 */
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getAppointmentsForUser(req.user.id);

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new appointment
 * POST /api/appointments
 * Body: { consultantId, appointmentDate, appointmentTime }
 */
const createAppointment = async (req, res, next) => {
  try {
    const { consultantId, appointmentDate, appointmentTime } = req.body;

    // Validation
    if (!consultantId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide consultantId, appointmentDate, and appointmentTime',
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(appointmentTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:mm (e.g., 10:00, 14:30)',
      });
    }

    const appointment = await appointmentService.createAppointment(req.user, {
      consultantId,
      appointmentDate,
      appointmentTime,
    });

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an appointment
 * PATCH /api/appointments/:id/cancel
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await appointmentService.cancelAppointmentByUser(
      req.user.id,
      appointmentId
    );

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAppointments,
  createAppointment,
  cancelAppointment,
};

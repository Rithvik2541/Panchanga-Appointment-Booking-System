/**
 * Admin Controller
 * Handles admin-related HTTP requests for appointment management
 */

const appointmentService = require('../services/appointmentService');

/**
 * Get all appointments with optional filters
 * GET /api/admin/appointments
 * Query params: date (YYYY-MM-DD), consultantId, status
 */
const getAppointments = async (req, res, next) => {
  try {
    const { date, consultantId, status } = req.query;

    const filters = {};
    if (date) filters.date = date;
    if (consultantId) filters.consultantId = consultantId;
    if (status) filters.status = status;

    const appointments = await appointmentService.getAppointmentsForAdmin(filters);

    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment status
 * PATCH /api/admin/appointments/:id
 * Body: { status }
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status',
      });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const appointment = await appointmentService.updateAppointmentStatusByAdmin(
      appointmentId,
      status
    );

    res.status(200).json({
      success: true,
      data: appointment,
      message: `Appointment status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  updateAppointmentStatus,
};

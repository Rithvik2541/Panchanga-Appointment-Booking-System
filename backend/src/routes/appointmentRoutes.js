/**
 * Appointment Routes
 * Defines routes for appointment management (user-facing)
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roles');

// All appointment routes require authentication
router.use(auth);

// All these routes are for USER role
router.use(checkRole(['USER']));

/**
 * @route   GET /api/appointments/my
 * @desc    Get all appointments for logged-in user
 * @access  Private (USER)
 */
router.get('/my', appointmentController.getMyAppointments);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private (USER)
 */
router.post('/', appointmentController.createAppointment);

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private (USER)
 */
router.patch('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;

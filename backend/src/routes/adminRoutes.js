/**
 * Admin Routes
 * Defines routes for admin appointment management
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roles');

// All admin routes require authentication and ADMIN role
router.use(auth);
router.use(checkRole(['ADMIN']));

/**
 * @route   GET /api/admin/appointments
 * @desc    Get all appointments with optional filters
 * @access  Private (ADMIN)
 * @query   date (YYYY-MM-DD), consultantId, status
 */
router.get('/appointments', adminController.getAppointments);

/**
 * @route   GET /api/admin/users
 * @desc    Get all admin users (excluding current user)
 * @access  Private (ADMIN)
 */
router.get('/users', adminController.getAdminUsers);

/**
 * @route   PATCH /api/admin/appointments/:id
 * @desc    Update appointment status
 * @access  Private (ADMIN)
 */
router.patch('/appointments/:id', adminController.updateAppointmentStatus);

module.exports = router;

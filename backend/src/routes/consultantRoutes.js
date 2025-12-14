/**
 * Consultant Routes
 * Public routes for viewing consultants
 */

const express = require('express');
const consultantController = require('../controllers/consultantController');

const router = express.Router();

// Public routes - no authentication needed to view consultants
router.get('/', consultantController.getAllConsultants);
router.get('/:id', consultantController.getConsultantById);

module.exports = router;

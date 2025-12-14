/**
 * Consultant Controller
 * Handles consultant-related HTTP requests
 */

const Consultant = require('../models/Consultant');

/**
 * Get all verified consultants
 * GET /api/consultants
 */
const getAllConsultants = async (req, res, next) => {
  try {
    const consultants = await Consultant.find(
      { isVerified: true },
      { hashedPassword: 0, otpCode: 0, otpExpiresAt: 0 }
    ).sort({ username: 1 });

    res.status(200).json({
      success: true,
      data: consultants,
      count: consultants.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get consultant by ID
 * GET /api/consultants/:id
 */
const getConsultantById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const consultant = await Consultant.findById(
      id,
      { hashedPassword: 0, otpCode: 0, otpExpiresAt: 0 }
    );

    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found',
      });
    }

    if (!consultant.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Consultant account not verified',
      });
    }

    res.status(200).json({
      success: true,
      data: consultant,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllConsultants,
  getConsultantById,
};

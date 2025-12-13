/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/authService');

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { mail, username, password }
 */
const register = async (req, res, next) => {
  try {
    // Debug logging
    console.log('📥 Register Request:', {
      body: req.body,
      contentType: req.get('Content-Type'),
      bodyKeys: req.body ? Object.keys(req.body) : 'no body'
    });

    const { mail, username, password } = req.body;

    // Validation
    if (!mail || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mail, username, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const result = await authService.register(mail, username, password);

    res.status(201).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP code
 * POST /api/auth/verify-otp
 * Body: { mail, otp }
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { mail, otp } = req.body;

    // Validation
    if (!mail || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mail and otp',
      });
    }

    const result = await authService.verifyOtp(mail, otp);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 * Body: { mail, password }
 */
const login = async (req, res, next) => {
  try {
    // Debug logging
    console.log('📥 Login Request:', {
      body: req.body,
      contentType: req.get('Content-Type'),
      bodyKeys: req.body ? Object.keys(req.body) : 'no body'
    });

    const { mail, password } = req.body;

    // Validation
    if (!mail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mail and password',
      });
    }

    const result = await authService.login(mail, password);

    res.status(200).json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOtp,
  login,
};

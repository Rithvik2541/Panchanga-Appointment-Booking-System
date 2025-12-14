/**
 * Authentication Service
 * Handles user registration, OTP verification, and login for both Users and Consultants
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Consultant = require('../models/Consultant');
const { generateOtp } = require('../utils/otpUtils');
const { sendOtpMail } = require('./mailService');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');
const { OTP_EXPIRY_MINUTES } = require('../utils/constants');

/**
 * Register a new user or consultant
 * @param {string} mail - User's email
 * @param {string} username - User's username
 * @param {string} password - User's plain text password
 * @param {string} role - User role (USER or CONSULTANT)
 * @param {string} specialization - Consultant specialization (optional, only for CONSULTANT)
 * @returns {Promise<Object>} Registration result
 */
const register = async (mail, username, password, role = 'USER', specialization = '') => {
  try {
    // Validate role
    if (!['USER', 'CONSULTANT'].includes(role)) {
      throw new Error('Invalid role. Must be USER or CONSULTANT');
    }

    // Check if user already exists in both collections
    const existingUser = await User.findOne({ mail: mail.toLowerCase() });
    const existingConsultant = await Consultant.findOne({ mail: mail.toLowerCase() });
    
    if (existingUser || existingConsultant) {
      throw new Error('Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Create new user or consultant based on role
    let newAccount;
    if (role === 'CONSULTANT') {
      newAccount = new Consultant({
        mail: mail.toLowerCase(),
        username,
        hashedPassword,
        otpCode: otp,
        otpExpiresAt,
        isVerified: false,
        specialization: specialization || '',
      });
    } else {
      newAccount = new User({
        mail: mail.toLowerCase(),
        username,
        hashedPassword,
        role: 'USER',
        otpCode: otp,
        otpExpiresAt,
        isVerified: false,
      });
    }

    await newAccount.save();

    // Send OTP email
    await sendOtpMail(mail, otp, username);

    return {
      success: true,
      message: `Registration successful as ${role}. Please check your email for OTP verification code.`,
      role: role,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP code (checks both User and Consultant collections)
 * @param {string} mail - User's email
 * @param {string} otp - OTP code to verify
 * @returns {Promise<Object>} Verification result
 */
const verifyOtp = async (mail, otp) => {
  try {
    // Find user by email in both collections
    let account = await User.findOne({ mail: mail.toLowerCase() });
    if (!account) {
      account = await Consultant.findOne({ mail: mail.toLowerCase() });
    }
    
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if already verified
    if (account.isVerified) {
      return {
        success: true,
        message: 'Email already verified. You can login now.',
      };
    }

    // Check if OTP exists
    if (!account.otpCode) {
      throw new Error('No OTP found. Please request a new one.');
    }

    // Check if OTP has expired
    if (account.otpExpiresAt < Date.now()) {
      throw new Error('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    if (account.otpCode !== otp) {
      throw new Error('Invalid OTP code');
    }

    // Mark account as verified and clear OTP
    account.isVerified = true;
    account.otpCode = null;
    account.otpExpiresAt = null;
    await account.save();

    return {
      success: true,
      message: 'Email verified successfully! You can now login.',
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user or consultant (checks both collections)
 * @param {string} mail - User's email
 * @param {string} password - User's plain text password
 * @param {string} role - User role (USER or CONSULTANT)
 * @returns {Promise<Object>} Login result with token
 */
const login = async (mail, password, role = 'USER') => {
  try {
    // Validate role
    if (!['USER', 'CONSULTANT'].includes(role)) {
      throw new Error('Invalid role. Must be USER or CONSULTANT');
    }

    // Find account by email in the appropriate collection
    let account;
    if (role === 'CONSULTANT') {
      account = await Consultant.findOne({ mail: mail.toLowerCase() });
    } else {
      account = await User.findOne({ mail: mail.toLowerCase() });
    }

    if (!account) {
      throw new Error('Invalid email, password, or role');
    }

    // Check if email is verified
    if (!account.isVerified) {
      throw new Error('Email not verified. Please verify your email first.');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, account.hashedPassword);
    if (!isPasswordValid) {
      throw new Error('Invalid email, password, or role');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: account._id,
        role: role === 'CONSULTANT' ? 'CONSULTANT' : account.role,
        username: account.username,
        collection: role === 'CONSULTANT' ? 'consultants' : 'users',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    return {
      success: true,
      token,
      user: {
        id: account._id,
        mail: account.mail,
        username: account.username,
        role: role === 'CONSULTANT' ? 'CONSULTANT' : account.role,
        specialization: account.specialization || undefined,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  verifyOtp,
  login,
};

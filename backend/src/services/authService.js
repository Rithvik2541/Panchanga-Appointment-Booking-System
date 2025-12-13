/**
 * Authentication Service
 * Handles user registration, OTP verification, and login
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Hero = require('../models/Hero');
const { generateOtp } = require('../utils/otpUtils');
const { sendOtpMail } = require('./mailService');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');
const { OTP_EXPIRY_MINUTES } = require('../utils/constants');

/**
 * Register a new user
 * @param {string} mail - User's email
 * @param {string} username - User's username
 * @param {string} password - User's plain text password
 * @returns {Promise<Object>} Registration result
 */
const register = async (mail, username, password) => {
  try {
    // Check if user already exists
    const existingUser = await Hero.findOne({ mail: mail.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Create new user
    const newUser = new Hero({
      mail: mail.toLowerCase(),
      username,
      hashedPassword,
      otpCode: otp,
      otpExpiresAt,
      isVerified: false,
    });

    await newUser.save();

    // Send OTP email
    await sendOtpMail(mail, otp, username);

    return {
      success: true,
      message: 'Registration successful. Please check your email for OTP verification code.',
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP code
 * @param {string} mail - User's email
 * @param {string} otp - OTP code to verify
 * @returns {Promise<Object>} Verification result
 */
const verifyOtp = async (mail, otp) => {
  try {
    // Find user by email
    const user = await Hero.findOne({ mail: mail.toLowerCase() });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      return {
        success: true,
        message: 'Email already verified. You can login now.',
      };
    }

    // Check if OTP exists
    if (!user.otpCode) {
      throw new Error('No OTP found. Please request a new one.');
    }

    // Check if OTP has expired
    if (user.otpExpiresAt < Date.now()) {
      throw new Error('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    if (user.otpCode !== otp) {
      throw new Error('Invalid OTP code');
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    return {
      success: true,
      message: 'Email verified successfully! You can now login.',
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * @param {string} mail - User's email
 * @param {string} password - User's plain text password
 * @returns {Promise<Object>} Login result with token
 */
const login = async (mail, password) => {
  try {
    // Find user by email
    const user = await Hero.findOne({ mail: mail.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new Error('Email not verified. Please verify your email first.');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    return {
      success: true,
      token,
      user: {
        id: user._id,
        mail: user.mail,
        username: user.username,
        role: user.role,
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

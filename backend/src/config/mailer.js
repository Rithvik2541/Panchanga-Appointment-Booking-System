/**
 * Nodemailer Configuration
 * Creates and exports configured nodemailer transport for sending emails
 */

const nodemailer = require('nodemailer');
const path = require('path');

// Load environment variables from .env file in backend directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Nodemailer configuration for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️  Mailer configuration error:', error);
    console.log('⚠️  EMAIL_USER:', process.env.EMAIL_USER);
    console.log('⚠️  EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
  } else {
    console.log('✅ Mail server is ready to send emails');
  }
});

module.exports = transporter;

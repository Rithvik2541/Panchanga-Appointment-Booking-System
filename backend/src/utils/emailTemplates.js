/**
 * Email Templates
 * Functions that return email subject and body for various notifications
 */

const { MAIL_FROM } = require('../config/env');

/**
 * OTP verification email template
 * @param {string} username - User's name
 * @param {string} otp - 6-digit OTP code
 * @returns {Object} Email subject and text
 */
const getOtpEmail = (username, otp) => {
  return {
    subject: 'Verify Your Email - OTP Code',
    text: `
Hello ${username},

Thank you for registering with our Appointment Booking System!

Your OTP verification code is: ${otp}

This code will expire in 10 minutes. Please use it to verify your email address.

If you did not request this code, please ignore this email.

Best regards,
Appointment Booking System Team
    `.trim(),
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Email Verification</h2>
  <p>Hello <strong>${username}</strong>,</p>
  <p>Thank you for registering with our Appointment Booking System!</p>
  <p>Your OTP verification code is:</p>
  <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
    ${otp}
  </div>
  <p>This code will expire in <strong>10 minutes</strong>. Please use it to verify your email address.</p>
  <p style="color: #666; font-size: 12px; margin-top: 30px;">
    If you did not request this code, please ignore this email.
  </p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
  <p style="color: #999; font-size: 11px;">
    Appointment Booking System Team
  </p>
</div>
    `.trim(),
  };
};

/**
 * Appointment reminder email template (15 minutes before)
 * @param {string} username - User's name
 * @param {Object} appointment - Appointment details
 * @returns {Object} Email subject and text
 */
const getReminderEmail = (username, appointment) => {
  const appointmentDate = new Date(appointment.slotStart).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return {
    subject: 'Appointment Reminder - Starting in 15 Minutes',
    text: `
Hello ${username},

This is a friendly reminder that your appointment is starting in 15 minutes!

Appointment Details:
- Date & Time: ${appointmentDate} at ${appointment.appointmentTime}
- Status: ${appointment.status}

Please be ready for your appointment.

Best regards,
Appointment Booking System Team
    `.trim(),
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">⏰ Appointment Reminder</h2>
  <p>Hello <strong>${username}</strong>,</p>
  <p>This is a friendly reminder that your appointment is starting in <strong>15 minutes</strong>!</p>
  <div style="background-color: #e8f4fd; padding: 20px; border-left: 4px solid #2196F3; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1976D2;">Appointment Details</h3>
    <p><strong>Date & Time:</strong> ${appointmentDate} at ${appointment.appointmentTime}</p>
    <p><strong>Status:</strong> ${appointment.status}</p>
  </div>
  <p>Please be ready for your appointment.</p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
  <p style="color: #999; font-size: 11px;">
    Appointment Booking System Team
  </p>
</div>
    `.trim(),
  };
};

/**
 * Appointment completed email template
 * @param {string} username - User's name
 * @param {Object} appointment - Appointment details
 * @returns {Object} Email subject and text
 */
const getCompletedEmail = (username, appointment) => {
  const appointmentDate = new Date(appointment.slotStart).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    subject: 'Appointment Completed - Thank You',
    text: `
Hello ${username},

Your appointment has been completed successfully!

Appointment Details:
- Date & Time: ${appointmentDate} at ${appointment.appointmentTime}
- Status: COMPLETED

Thank you for using our Appointment Booking System. We hope to see you again!

Best regards,
Appointment Booking System Team
    `.trim(),
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">✅ Appointment Completed</h2>
  <p>Hello <strong>${username}</strong>,</p>
  <p>Your appointment has been completed successfully!</p>
  <div style="background-color: #e8f5e9; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #388E3C;">Appointment Details</h3>
    <p><strong>Date & Time:</strong> ${appointmentDate} at ${appointment.appointmentTime}</p>
    <p><strong>Status:</strong> COMPLETED</p>
  </div>
  <p>Thank you for using our Appointment Booking System. We hope to see you again!</p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
  <p style="color: #999; font-size: 11px;">
    Appointment Booking System Team
  </p>
</div>
    `.trim(),
  };
};

module.exports = {
  getOtpEmail,
  getReminderEmail,
  getCompletedEmail,
};

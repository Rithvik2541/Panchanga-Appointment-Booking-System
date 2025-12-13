/**
 * Mail Service
 * Handles sending emails using nodemailer
 */

const transporter = require('../config/mailer');
const { MAIL_FROM } = require('../config/env');
const { getOtpEmail, getReminderEmail, getCompletedEmail } = require('../utils/emailTemplates');

/**
 * IMPORTANT: Ensure that the mailer transport is properly configured in config/mailer.js
 * with real SMTP credentials before using this service in production.
 * 
 * For Gmail:
 * - Enable 2-factor authentication
 * - Generate an App Password
 * - Use the app password in MAIL_PASS environment variable
 * 
 * For other providers (SendGrid, Mailgun, etc.):
 * - Update MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS accordingly in .env
 */

/**
 * Sends OTP verification email
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} username - User's name
 * @returns {Promise<Object>} Mail send result
 */
const sendOtpMail = async (to, otp, username) => {
  try {
    const { subject, text, html } = getOtpEmail(username, otp);

    const mailOptions = {
      from: MAIL_FROM,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  OTP email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending OTP email to ${to}:`, error.message);
    throw new Error('Failed to send OTP email. Please check mail configuration.');
  }
};

/**
 * Sends appointment reminder email (15 minutes before)
 * @param {string} to - Recipient email address
 * @param {string} username - User's name
 * @param {Object} appointmentInfo - Appointment details
 * @returns {Promise<Object>} Mail send result
 */
const sendReminderMail = async (to, username, appointmentInfo) => {
  try {
    const { subject, text, html } = getReminderEmail(username, appointmentInfo);

    const mailOptions = {
      from: MAIL_FROM,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  Reminder email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending reminder email to ${to}:`, error.message);
    throw new Error('Failed to send reminder email.');
  }
};

/**
 * Sends appointment completed email
 * @param {string} to - Recipient email address
 * @param {string} username - User's name
 * @param {Object} appointmentInfo - Appointment details
 * @returns {Promise<Object>} Mail send result
 */
const sendCompletedMail = async (to, username, appointmentInfo) => {
  try {
    const { subject, text, html } = getCompletedEmail(username, appointmentInfo);

    const mailOptions = {
      from: MAIL_FROM,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  Completion email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending completion email to ${to}:`, error.message);
    // Don't throw error for completion emails, just log it
    return null;
  }
};

module.exports = {
  sendOtpMail,
  sendReminderMail,
  sendCompletedMail,
};

/**
 * Environment Variables Configuration
 * Reads and exports environment variables from .env file
 */

require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  
  // Database Configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/appointment-booking',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // Email Configuration
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  MAIL_FROM: process.env.EMAIL_USER || 'noreply@appointmentbooking.com',
  
  // Application Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
};

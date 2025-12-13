/**
 * OTP Utility Functions
 * Generates OTP codes for user verification
 */

/**
 * Generates a random 6-digit OTP code
 * @returns {string} 6-digit OTP code as string
 */
const generateOtp = () => {
  // Generate random number between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

module.exports = {
  generateOtp,
};

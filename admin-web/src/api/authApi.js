import axiosClient from './axiosClient';

export const authApi = {
  /**
   * POST /api/auth/register
   * Registers a new admin user
   * @param {string} mail - Email
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {string} role - Role ('ADMIN' for admin users)
   */
  register: (mail, username, password, role = 'ADMIN') =>
    axiosClient.post('/api/auth/register', { mail, username, password, role }),

  /**
   * POST /api/auth/login
   * Logs in an admin user and returns JWT token
   */
  login: (mail, password) =>
    axiosClient.post('/api/auth/login', { mail, password, role: 'ADMIN' }),

  /**
   * POST /api/auth/verify-otp
   * Verifies OTP for email confirmation
   */
  verifyOtp: (mail, otp) =>
    axiosClient.post('/api/auth/verify-otp', { mail, otp }),
};

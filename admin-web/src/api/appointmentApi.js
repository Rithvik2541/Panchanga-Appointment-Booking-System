import axiosClient from './axiosClient';

export const appointmentApi = {
  /**
   * GET /api/admin/appointments
   * Fetch appointments with optional filters
   */
  getAppointments: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.consultantId) params.append('consultantId', filters.consultantId);
    if (filters.status) params.append('status', filters.status);
    return axiosClient.get(`/api/admin/appointments?${params.toString()}`);
  },

  /**
   * PATCH /api/admin/appointments/:id
   * Update appointment status
   */
  updateStatus: (appointmentId, status) =>
    axiosClient.patch(`/api/admin/appointments/${appointmentId}`, { status }),

  /**
   * GET /api/admin/users
   * Fetch all admin users
   */
  getAdminUsers: () =>
    axiosClient.get('/api/admin/users'),

  /**
   * GET /api/consultants
   * Fetch all consultants
   */
  getConsultants: () =>
    axiosClient.get('/api/consultants'),

  /**
   * GET /api/consultants/:id
   * Fetch single consultant
   */
  getConsultantById: (id) =>
    axiosClient.get(`/api/consultants/${id}`),
};

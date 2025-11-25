// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// INTERCEPTOR: Attaches 'user_token' to every request
// ============================================================
apiClient.interceptors.request.use(
  (config) => {
    // We use 'user_token' because that is what you used in LoginView.vue
    const token = localStorage.getItem('user_token'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default {
  // ===== DASHBOARD STATS =====
  getDashboardStats() {
    return apiClient.get('/appointments');
  },

  // ===== APPOINTMENTS =====
  getAllAppointments() {
    return apiClient.get('/appointments');
  },
  getAppointmentById(id) {
    return apiClient.get(`/appointments/${id}`);
  },
  createAppointment(data) {
    return apiClient.post('/appointments', data);
  },

  getAppointmentsByStatus(status) {
    return apiClient.get(`/appointments/status/${status}`);
  },

  getAppointmentsByDate(date) {
    return apiClient.get(`/appointments/date/${date}`);
  },

  updateAppointmentStatus(id, status) {
    return apiClient.patch(`/appointments/${id}/status`, { status });
  },

  deleteAppointment(id) {
    return apiClient.delete(`/appointments/${id}`);
  },

  // ===== ANALYTICS DATA =====
  getAnalyticsData() {
    return apiClient.get('/appointments');
  },

  // ===== PATIENTS =====
  getAllPatients() {
    return apiClient.get('/patients');
  },

  // ===== DOCTORS =====
  getAllDoctors() {
    return apiClient.get('/doctors');
  },
  // 1. Get Stats (Total Appts, Vaccine Count)
  getAdminStats() {
    // Backend should return: { total_appointments: 100, vaccine_stock: 42, upcoming: 5 }
    return apiClient.get('/admin/stats');
  },

  // 2. Get DSA Analytics Data
  getDSAData() {
    // Backend returns prediction data
    return apiClient.get('/admin/analytics');
  },

  // 3. Get Summary Reports
  getSummaryReports() {
    return apiClient.get('/admin/reports');
  }
};
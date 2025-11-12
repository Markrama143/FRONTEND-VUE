// API Configuration & Service
import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  // ===== DASHBOARD STATS =====
  getDashboardStats() {
    return apiClient.get('/appointments');
  },

  // ===== APPOINTMENTS =====
  getAllAppointments() {
    return apiClient.get('/appointments');
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
};

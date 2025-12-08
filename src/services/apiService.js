import axios from "axios";

const API_BASE_URL = process.env.VUE_APP_API_URL || "http://192.168.68.102:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR: Attaches 'user_token' to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("user_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, // FIX: Prefix 'error' with underscore to remove the 'no-unused-vars' warning
  (_error) => {
    return Promise.reject(_error); // We still pass it along, just mark it as locally unused
  }
);

export default {
  // ===== APPOINTMENTS (User & Admin CRUD) =====

  // Gets all appointments (used by Admin Table) or User appointments (used by User Table)
  getAllAppointments() {
    return apiClient.get("/appointments");
  },
  getAppointmentById(id) {
    return apiClient.get(`/appointments/${id}`);
  },
  createAppointment(data) {
    return apiClient.post("/appointments", data);
  }, // Update full appointment details (Maps to PATCH/PUT in AppointmentsController)
  updateAppointment(id, data) {
    return apiClient.put(`/appointments/${id}`, data);
  },
  deleteAppointment(id) {
    return apiClient.delete(`/appointments/${id}`);
  }, // Update ONLY status (Maps to PATCH /appointments/{id}/status)

  updateAppointmentStatus(id, status) {
    return apiClient.patch(`/appointments/${id}/status`, { status });
  }, // ===== ADMIN / ANALYTICS FUNCTIONS (Maps to AnalyticsController) ===== // 1. Get Dashboard Stats (Total Appointments, Vaccine Stock, Pending Count)

  getAdminStats() {
    return apiClient.get("/admin/stats");
  }, // 2. Get Animal Type Analytics (For DSA Charting)

  getAnimalTypeAnalytics() {
    return apiClient.get("/admin/analytics/animal-counts");
  }, // 3. Get Summary Reports (General reporting data)

  getSummaryReports() {
    return apiClient.get("/admin/reports");
  }, // FIX: Re-adding the missing function to resolve the TypeError in AdminDashboardView.vue

  getDSAData() {
    return apiClient.get("/admin/analytics");
  }, // --- DEPRECATED/UNUSED GENERIC METHODS (Cleaned up from previous state) ---

  getAppointmentsByStatus(status) {
    return apiClient.get(`/appointments/status/${status}`);
  },
  getAppointmentsByDate(date) {
    return apiClient.get(`/appointments/date/${date}`);
  },

  getAllPatients() {
    return apiClient.get("/patients");
  },
  getAllDoctors() {
    return apiClient.get("/doctors");
  },
  getVaccineStock() {
    return apiClient.get("/vaccines/stock");
  },

  postVaccineStock(quantity) {
    return apiClient.post("/vaccines/stock", quantity);
  },

  deductVaccineStock(quantity) {
    return apiClient.post("/vaccines/deduct", { quantity });
  },
};



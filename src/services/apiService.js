import axios from "axios";

const API_BASE_URL = process.env.VUE_APP_API_URL || "http://172.20.10.2:8000/api";

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
  },
  (_error) => {
    return Promise.reject(_error);
  }
);

export default {
  // ===== 🔑 AUTH & PUBLIC ROUTES =====

  /**
   * Registers a new user. (POST /register)
   */
  register(data) {
    return apiClient.post("/register", data);
  },

  /**
   * Logs a user in. (POST /login)
   */
  login(data) {
    return apiClient.post("/login", data);
  },

  /**
   * Gets available time slots for booking. (GET /appointments/availability)
   */
  getAppointmentAvailability() {
    return apiClient.get("/appointments/availability");
  },

  /**
   * Gets the recommended best day for an appointment. (GET /recommendation/best-day)
   */
  getBestDayRecommendation() {
    return apiClient.get("/recommendation/best-day");
  },

  /**
   * Gets vaccine stock level (Public/Admin access). (GET /vaccines/stock)
   */
  getVaccineStock() {
    return apiClient.get("/vaccines/stock");
  },

  // ===== 👤 PROTECTED USER & PROFILE ROUTES =====

  /**
   * Gets the currently authenticated user's profile. (GET /user)
   */
  getCurrentUser() {
    return apiClient.get("/user");
  },

  /**
   * Uploads or updates the user's avatar. (POST /user/avatar)
   */
  updateUserAvatar(data) {
    // Note: data should be FormData for file uploads
    return apiClient.post("/user/avatar", data);
  },

  /**
   * Fetches user's notifications. (GET /notifications)
   */
  getNotifications() {
    return apiClient.get("/notifications");
  },

  /**
   * Marks a specific notification as read. (POST /notifications/{id}/read)
   */
  markNotificationAsRead(id) {
    return apiClient.post(`/notifications/${id}/read`);
  },

  // ===== 📅 APPOINTMENTS (Standard CRUD) =====

  /**
   * Gets all appointments (User or Admin list). (GET /appointments)
   * Accepts optional params: { page, per_page, status, search }
   */
  getAllAppointments(params = {}) {
    return apiClient.get("/appointments", { params });
  },

  /**
   * Creates a new appointment. (POST /appointments)
   */
  createAppointment(data) {
    return apiClient.post("/appointments", data);
  },

  /**
   * Gets a specific appointment by ID. (GET /appointments/{id})
   */
  getAppointmentById(id) {
    return apiClient.get(`/appointments/${id}`);
  },

  /**
   * Updates an existing appointment. (PUT /appointments/{id})
   */
  updateAppointment(id, data) {
    return apiClient.put(`/appointments/${id}`, data);
  },

  /**
   * Deletes an appointment. (DELETE /appointments/{id})
   */
  deleteAppointment(id) {
    return apiClient.delete(`/appointments/${id}`);
  },

  /**
   * Updates ONLY the status of an appointment. (PATCH /appointments/{id}/status)
   */
  updateAppointmentStatus(id, status) {
    return apiClient.patch(`/appointments/${id}/status`, { status });
  },

  // ===== 💉 VACCINE/STOCK (Admin Functionality) =====

  /**
   * Adds or updates vaccine stock via form (Protected POST /vaccines/stock).
   */
  postVaccineStock(data) {
    return apiClient.post("/vaccines/stock", data);
  },

  // ===== 📊 ADMIN / ANALYTICS FUNCTIONS (Protected Routes) =====

  /**
   * Gets Dashboard Stats (Total Appointments, Vaccine Stock, Pending Count). (GET /admin/stats)
   */
  getAdminStats() {
    return apiClient.get("/admin/stats");
  },

  /**
   * Gets Animal Type Analytics (For DSA Charting). (GET /admin/analytics/animal-counts)
   */
  getAnimalTypeAnalytics() {
    return apiClient.get("/admin/analytics/animal-counts");
  },

  /**
   * Gets Summary Reports. (GET /admin/reports)
   */
  getSummaryReports() {
    return apiClient.get("/admin/reports");
  },

  /**
   * Fetches raw appointment data for frontend prediction. (GET /admin/analytics/raw-appointments)
   */
  getAllAppointmentsRaw(params = {}) {
    return apiClient.get("/admin/analytics/raw-appointments", { params });
  },

  // ===== 🗓️ HOLIDAY MANAGEMENT (Protected Routes) =====

  /**
   * Fetches the list of all set clinic holidays. (GET /holidays)
   */
  getHolidays() {
    return apiClient.get("/holidays");
  },
  

  /**
   * Declares a new clinic holiday entry. (POST /holidays)
   */
  createHoliday(data) {
    return apiClient.post("/holidays", data);
  },
    
    /**
     * Updates an existing holiday entry by ID. (PUT /holidays/{id}) ⬅️ **NEW**
     */
    updateHoliday(id, data) {
        return apiClient.put(`/holidays/${id}`, data);
    },

  /**
   * Deletes a holiday entry by ID. (DELETE /holidays/{id})
   */
  deleteHoliday(id) {
    return apiClient.delete(`/holidays/${id}`);
  },

  // ===== 📝 AUDIT LOGS (Protected Routes) =====

  /**
   * Fetches a paginated list of audit logs. (GET /audit-logs)
   * @param {Object} params - Optional query parameters (e.g., { page: 1, per_page: 20 })
   */
  getAuditLogs(params = {}) {
    return apiClient.get("/audit-logs", { params });
  },

  /**
   * Fetches a single audit log by ID. (GET /audit-logs/{id})
   */
  getAuditLogById(id) {
    return apiClient.get(`/audit-logs/${id}`);
  },
};





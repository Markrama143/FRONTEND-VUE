import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const authService = {
  // Login user
  login(email, password) {
    return axios.post(`${API_BASE_URL}/login`, {
      email,
      password,
    });
  },

  // Logout user
  logout() {
    const token = localStorage.getItem('token');
    if (token) {
      return axios.post(
        `${API_BASE_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  },

  // Get current user
  getCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      return axios.get(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  },

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Clear stored data on logout
  clearStoredData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;








































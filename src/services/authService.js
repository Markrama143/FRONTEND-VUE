import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Change to your API URL

const authService = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      if (response.data.access_token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data.access_token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post(`${API_URL}/logout`, {}, config);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error.response?.data || error.message;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  setupAxios: () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};

export default authService;

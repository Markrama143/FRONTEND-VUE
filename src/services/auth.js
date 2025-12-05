import axios from 'axios';

// CHANGE: Use a relative path.
// This allows the Vue DevServer Proxy to intercept the request and forward it to Laravel.
// It also solves CORS issues automatically.
const API_URL = '/api/'; 

export function register(name, email, password, password_confirmation) {
  return axios.post(API_URL + 'register', {
    name,
    email,
    password,
    password_confirmation,
  });
}

export function login(email, password) {
  return axios.post(API_URL + 'login', {
    email,
    password,
  });
}

export function logout(token) {
  return axios.post(API_URL + 'logout', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
}













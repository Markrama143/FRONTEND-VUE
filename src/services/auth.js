import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/'; // Change as needed

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

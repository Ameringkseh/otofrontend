import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8080', // URL Server Backend Go-Fiber Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

// Otomatis menyisipkan token JWT jika user sudah login
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
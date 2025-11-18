// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  console.log('➡️ Sending request to:', config.baseURL + config.url);
  console.log('📦 Request data:', config.data);
  console.log('🍪 Cookies:', document.cookie);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

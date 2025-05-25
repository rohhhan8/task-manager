// src/services/api.js
import axios from 'axios';

// Create an axios instance with a base URL
const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://task-manager-hd1x.onrender.com/api'
    : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the auth token in all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getUser: () => API.get('/auth/user'),
};

// Tasks API calls
export const tasksAPI = {
  createTask: (taskData) => API.post('/tasks', taskData),
  getTasks: () => API.get('/tasks'),
  deleteTask: (taskId) => API.delete(`/tasks/${taskId}`),
};

export default API;

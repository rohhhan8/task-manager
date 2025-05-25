// src/services/api.js
import axios from 'axios';

// Get API URL from environment or use defaults
const getApiUrl = () => {
  // Check for custom environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Default URLs based on environment
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-backend-url.cyclic.app/api'; // Update this after deploying to Cyclic
  }

  return 'http://localhost:5000/api';
};

// Create an axios instance with a base URL
const API = axios.create({
  baseURL: getApiUrl(),
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

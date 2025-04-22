// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks'; // Replace with your backend URL

// Set JWT token in headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Assume token is saved in localStorage
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Create task
export const createTask = (taskData) => {
  return axios.post(API_URL, taskData, { headers: getAuthHeaders() });
};

// Get tasks
export const getTasks = () => {
  return axios.get(API_URL, { headers: getAuthHeaders() });
};

// Delete task
export const deleteTask = (taskId) => {
  return axios.delete(`${API_URL}/${taskId}`, { headers: getAuthHeaders() });
};

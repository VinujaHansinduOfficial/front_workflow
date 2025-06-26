// src/services/authService.js

import axios from "axios";

const API_URL = "https://slt-workbench-backend.up.railway.app/api/auth/internal"; // Update with your backend auth API

// Get token from local storage
export const getToken = () => {
  return localStorage.getItem("token");
};

// Save token to local storage
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

// Remove token on logout
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login"; // Redirect to login page
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken(); // Returns true if token exists
};

// Axios interceptor to attach token to requests
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Login function
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const token = response.data.token;
    if (token) {
      setToken(token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || "Login failed";
  }
};

// Register function (optional)
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Registration failed";
  }
};

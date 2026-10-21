import axios from 'axios';

// Get base URL from environment or fall back to localhost:5000/api
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired sessions and format error responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If token expired or unauthorized, clear storage
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected server error occurred. Please try again.';

    const customError = new Error(message);
    customError.statusCode = error.response?.status;
    customError.errors = error.response?.data?.errors;
    customError.raw = error.response?.data;

    return Promise.reject(customError);
  }
);

export default api;

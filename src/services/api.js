console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
import axios from 'axios';

// Base API URL - change this to your backend URL
const API_URL = import.meta.env.VITE_API_URL;
// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    getCurrentUser: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout')
};

// User API calls
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/change-password', data)
};

// Admin API calls
export const adminAPI = {
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    activateUser: (id) => api.put(`/admin/users/${id}/activate`),
    deactivateUser: (id) => api.put(`/admin/users/${id}/deactivate`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

export default api;
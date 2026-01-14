import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Interceptor to handle auth errors
api.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        console.error('API 401 Unauthorized detected:', error.config.url);
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
        // window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;

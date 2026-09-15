import axios from 'axios';

// Centralized Axios instance configured with the base backend API URL
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

// Interceptor to automatically attach the JWT to every outgoing request if the user is logged in
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;

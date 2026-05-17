// src/api/axios.js

import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers.Accept = "application/json";

    // Only set Content-Type for non-FormData requests
    if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    }

    return config;
});

export default api;

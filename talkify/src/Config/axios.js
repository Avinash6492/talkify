import axios from 'axios';

const axiosInstance = axios.create({
    // Points to your Node.js server
    baseURL: 'http://localhost:5000/api', 
    
    // Essential for cross-origin requests and handling cookies/sessions
    withCredentials: true, 
    
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * 🚀 AXIOS INTERCEPTOR
 * This logic runs automatically before every single request.
 * It grabs the 'token' from localStorage and puts it in the headers
 * so your backend 'protectRoute' can verify who you are.
 */
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            // We use 'token' as the key to match your auth.js logic:
            // const token = req.headers.token;
            config.headers.token = token; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * 🛠️ RESPONSE INTERCEPTOR (Optional but helpful)
 * If the backend ever returns a 401 (Unauthorized), it means 
 * the token expired, so we log the user out automatically.
 */
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
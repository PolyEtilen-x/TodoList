import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format and normalize backend/network errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      const data = error.response.data;
      if (data && data.message) {
        if (Array.isArray(data.message)) {
          // NestJS class-validator errors are returned as arrays
          errorMessage = data.message.join('. ');
        } else {
          errorMessage = data.message;
        }
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to the backend server. Please verify it is running.';
    } else {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;

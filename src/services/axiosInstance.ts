import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach guest session ID
axiosInstance.interceptors.request.use((config) => {
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    // Generate standard UUID v4 prefix with guest_
    guestId = 'guest_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('guest_id', guestId);
  }
  config.headers['x-guest-id'] = guestId;
  return config;
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

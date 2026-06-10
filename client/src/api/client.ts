import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitplan_token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Use the auth store to properly clear state and trigger React-based redirect
      // instead of doing a hard window.location redirect which loses React state
      const store = useAuthStore.getState();
      if (store.isAuthenticated) {
        store.logout();
      }
    }
    return Promise.reject(error);
  },
);

export default client;

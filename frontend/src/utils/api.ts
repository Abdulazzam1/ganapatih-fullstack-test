// src/utils/api.ts
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Izinkan pengiriman cookie (penting untuk refresh token)
  withCredentials: true, 
});

// Interceptor: Berjalan SEBELUM setiap request dikirim
api.interceptors.request.use(
  (config) => {
    // Ambil token dari Zustand store
    const token = useAuthStore.getState().accessToken;

    if (token) {
      // Jika token ada, tambahkan ke header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Kita akan tambahkan interceptor response di sini nanti untuk Poin Bonus

export default api;
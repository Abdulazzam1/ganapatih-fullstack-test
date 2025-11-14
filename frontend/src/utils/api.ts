// src/utils/api.ts
import axios from 'axios'; // <-- Pastikan 'axios' di-import
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // WAJIB ada untuk mengirim/menerima cookie
});

// Interceptor REQUEST (Sudah Benar)
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token; 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interceptor RESPONSE (VERSI CANGGIH & STABIL) ---
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { setToken, logout } = useAuthStore.getState();

    // Cek 401 & BUKAN request /api/login & belum di-retry
    if (
      error.response?.status === 401 && 
      originalRequest.url !== '/api/login' && 
      !originalRequest._retry 
    ) {
      if (isRefreshing) {
        // Jika sedang refresh, masukkan ke antrian
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // =================================================================
        // --- PERBAIKAN BUG INTERCEPTOR ---
        // Panggil 'axios.post' (versi bersih) BUKAN 'api.post'
        // Ini agar 'Authorization' header yang kedaluwarsa tidak ikut terkirim.
        const baseURL = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.post(`${baseURL}/api/refresh`, {}, {
          withCredentials: true, // Pastikan cookie dikirim
        });
        // =================================================================

        const { token: newAccessToken } = res.data; //

        // 1. Simpan token baru (15 menit)
        setToken(newAccessToken);
        
        // 2. Ulangi request asli
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);
        return api(originalRequest);

      } catch (refreshError) {
        // Jika refresh gagal (cookie refreshToken juga kedaluwarsa)
        processQueue(refreshError, null);
        logout(); // Logout pengguna
        window.location.href = '/login'; // Paksa ke login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
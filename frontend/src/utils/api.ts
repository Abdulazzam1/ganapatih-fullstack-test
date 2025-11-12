// src/utils/api.ts
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Izinkan pengiriman cookie
});

// --- Interceptor REQUEST (YANG SUDAH ADA) ---
// Ini menambahkan token ke SETIAP request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interceptor RESPONSE (BARU) ---
// Ini menangani token expired dan auto-refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void, reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Jika request sukses, langsung kembalikan
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { setToken, logout } = useAuthStore.getState();

    // Cek jika error 401 dan BUKAN request ke /api/refresh itu sendiri
    if (error.response?.status === 401 && originalRequest.url !== '/api/refresh') {
      
      if (isRefreshing) {
        // Jika sudah ada proses refresh, 'antri' request ini
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Panggil endpoint /api/refresh
        const res = await api.post('/api/refresh');
        const { token: newAccessToken } = res.data;

        // 1. Simpan token baru ke Zustand
        setToken(newAccessToken);

        // 2. Perbarui header request asli dengan token baru
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        
        // 3. Proses 'antrian' request yang gagal
        processQueue(null, newAccessToken);

        // 4. Ulangi request asli
        return api(originalRequest);

      } catch (refreshError: any) {
        // Jika /api/refresh gagal (refresh token tidak valid)
        console.error("Refresh token failed:", refreshError);
        processQueue(refreshError, null);
        logout(); // Logout pengguna
        window.location.href = '/login'; // Paksa redirect ke login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Untuk error selain 401, langsung kembalikan error
    return Promise.reject(error);
  }
);

export default api;
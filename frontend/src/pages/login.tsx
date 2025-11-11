// src/pages/login.tsx
import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router'; // Import useRouter
import styles from './login.module.css'; 
import api from '../utils/api'; // <-- 1. IMPORT API CLIENT (dari src/utils)
import { useAuthStore } from '../store/auth.store'; // <-- 2. IMPORT ZUSTAND STORE

type FormMode = 'login' | 'register';

const LoginPage: NextPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<FormMode>('login');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter(); // Inisialisasi router
  const setToken = useAuthStore((state) => state.setToken); // <-- 3. Ambil 'setToken' dari store

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password cannot be empty');
      return;
    }
    setError('');
    setIsLoading(true);

    if (mode === 'register') {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  // --- FUNGSI REGISTER (MENGGUNAKAN AXIOS) ---
  const handleRegister = async () => {
    try {
      // Gunakan 'api' client, bukan 'fetch'
      const res = await api.post('/api/register', { username, password }); // [cite: 101-110]
      
      // Sukses register
      console.log('Register success:', res.data);
      alert('Registration successful! Please login.');
      setMode('login'); // Otomatis pindah ke tab login

    } catch (err: any) {
      // Axios membungkus error di 'err.response.data'
      setError(err.response?.data?.message || 'Failed to register'); // [cite: 60-62]
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI LOGIN (MENGGUNAKAN AXIOS & ZUSTAND) ---
  const handleLogin = async () => {
    try {
      // Gunakan 'api' client, bukan 'fetch'
      const res = await api.post('/api/login', { username, password });// [cite: 113-124]

      const { token } = res.data; // Ambil access token dari respons

      // **INI LANGKAH PENTINGNYA:**
      setToken(token); // Simpan token ke global store (Zustand)

      // Redirect ke halaman utama
      router.push('/'); // Pindah ke halaman feed

    } catch (err: any) {
      // Axios membungkus error di 'err.response.data'
      setError(err.response?.data?.message || 'Failed to login'); // [cite: 60-62]
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Login / Register - Ganapatih Feed</title>
      </Head>

      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Ganapatih Feed</h2>

        <div className={styles.toggleButtons}>
          <button
            onClick={() => setMode('login')}
            disabled={isLoading}
            className={`${styles.toggleButton} ${
              mode === 'login' ? styles.active : ''
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('register')}
            disabled={isLoading}
            className={`${styles.toggleButton} ${
              mode === 'register' ? styles.active : ''
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading
                ? 'Loading...'
                : mode === 'login'
                ? 'Login'
                : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
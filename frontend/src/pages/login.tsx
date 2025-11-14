// src/pages/login.tsx
import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from './login.module.css'; 
import api from '../utils/api';
import { useAuthStore } from '../store/auth.store';

type FormMode = 'login' | 'register';

const LoginPage: NextPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<FormMode>('login');
  
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken); // (PERBAIKAN)

  const handleModeChange = (newMode: FormMode) => {
    setMode(newMode);
    setLoginError(null);
    setRegisterError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') setLoginError(null);
    else setRegisterError(null);
    
    if (!username || !password) {
      const msg = 'Username and password cannot be empty';
      mode === 'login' ? setLoginError(msg) : setRegisterError(msg);
      return;
    }
    setIsLoading(true);

    if (mode === 'register') {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  const handleRegister = async () => {
    try {
      const res = await api.post('/api/register', { username, password });
      console.log('Register success:', res.data);
      alert('Registration successful! Please login.');
      handleModeChange('login');
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || 'Failed to register');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await api.post('/api/login', { username, password });

      // (PERBAIKAN) Ambil 'token' (sesuai PDF)
      const { token } = res.data; 

      // (PERBAIKAN) Kirim 1 token ke Zustand
      setToken(token); 

      setTimeout(() => {
        router.push('/');
      }, 0);

    } catch (err: any) {
      let errorMessage = 'Login failed. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      setLoginError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... JSX Anda (Form, Button, dll) TIDAK PERLU DIUBAH ...
    // ... (Salin semua JSX dari file lama Anda ke sini) ...
    <div className={styles.container}>
      <Head>
        <title>Login / Register - Ganapatih Feed</title>
      </Head>

      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Ganapatih Feed</h2>

        <div className={styles.toggleButtons}>
          <button
            onClick={() => handleModeChange('login')}
            disabled={isLoading}
            className={`${styles.toggleButton} ${
              mode === 'login' ? styles.active : ''
            }`}
          >
            Login
          </button>
          <button
            onClick={() => handleModeChange('register')}
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

          {mode === 'login' && loginError && (
            <div className={styles.error}>{loginError}</div>
          )}
          {mode === 'register' && registerError && (
            <div className={styles.error}>{registerError}</div>
          )}

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
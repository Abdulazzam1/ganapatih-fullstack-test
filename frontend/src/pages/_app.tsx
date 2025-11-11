// src/pages/_app.tsx
import '@/styles/globals.css'; // <-- BARIS INI SANGAT PENTING
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
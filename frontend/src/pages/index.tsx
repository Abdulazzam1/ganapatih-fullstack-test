// src/pages/index.tsx
import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/auth.store'; // Import store
import api from '../utils/api'; // Import client API

// Tipe data untuk Post
interface Post {
  id: number;
  userid: number;
  content: string;
  createdat: string;
}

const HomePage: NextPage = () => {
  const router = useRouter();
  
  // State untuk data feed dan loading
  const [posts, setPosts] = useState<Post[]>([]);
  // Mulai dengan state loading, ini PENTING untuk proteksi rute
  const [isLoading, setIsLoading] = useState(true);
  const [feedError, setFeedError] = useState('');

  useEffect(() => {
    // useEffect dengan array kosong [] hanya berjalan SATU KALI di sisi klien
    // Ini menjamin bahwa Zustand sudah selesai membaca dari localStorage
    
    // 1. Ambil token dari store SETELAH komponen 'mount'
    const token = useAuthStore.getState().accessToken;

    if (!token) {
      // 2. JIKA TIDAK ADA TOKEN:
      // Pindahkan paksa ke halaman login
      router.replace('/login');
    } else {
      // 3. JIKA ADA TOKEN:
      // Kita terotentikasi, ambil data feed
      
      const fetchFeed = async () => {
        try {
          // Panggil API feed, token akan ditambahkan otomatis oleh 'api.ts'
          const res = await api.get('/api/feed'); // [cite: 146-155]
          setPosts(res.data.posts);
          setFeedError('');
        } catch (err: any) {
          console.error("Failed to fetch feed:", err);
          setFeedError(err.message || "Failed to load feed.");
        } finally {
          // Selesai (sukses atau gagal), berhenti loading
          setIsLoading(false);
        }
      };

      fetchFeed();
    }
  }, [router]); // Tambahkan router sebagai dependensi

  // --- TAMPILAN LOADING ---
  // Tampilkan ini sementara kita mengecek token atau mengambil data
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // --- TAMPILAN HALAMAN UTAMA (jika sudah login) ---
  return (
    <main className="container mx-auto max-w-2xl p-4">
      <Head>
        <title>Ganapatih Feed</title>
      </Head>

      <h1 className="mb-4 text-2xl font-bold">Ganapatih Feed</h1>

      {/* TODO: Form "Create Post" akan kita tambahkan di sini nanti */}

      {/* --- Daftar Feed --- */}
      <div className="mt-6 space-y-4">
        {feedError && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
            {feedError}
          </div>
        )}

        {/* Cek jika tidak mengikuti siapa pun  */}
        {posts.length === 0 && !feedError && (
          <div className="rounded-md bg-gray-50 p-6 text-center text-gray-500">
            <h3 className="text-lg font-medium">Your feed is empty</h3>
            <p>Start following other users to see their posts!</p>
          </div>
        )}

        {/* Tampilkan postingan */}
        {posts.map((post) => (
          <div key={post.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center space-x-2">
              <span className="font-bold">User {post.userid}</span>
              <span className="text-sm text-gray-500">
                {/* TODO (Bonus): Format 'createdat' menjadi "time ago" [cite: 194-195] */}
                {new Date(post.createdat).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-800">{post.content}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default HomePage;
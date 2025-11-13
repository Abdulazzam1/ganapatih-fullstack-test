// src/pages/index.tsx
import { useState, useEffect, useCallback } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/auth.store';
import api from '../utils/api';

// Import Komponen
import CreatePostForm from '../components/CreatePostForm';
import UserList from '../components/UserList';
import TimeAgo from '../components/TimeAgo'; // <-- 1. IMPORT BARU

// Import CSS Module
import styles from './index.module.css';

// Tipe data untuk Post
interface Post {
  id: number;
  userid: number;
  content: string;
  createdat: string;
}

const HomePage: NextPage = () => {
  const router = useRouter();
  // Mengambil token, meskipun tidak digunakan secara langsung di JSX,
  // ini penting untuk memicu re-render jika state berubah (walau logic kita saat ini bergantung pada `useEffect`
  const token = useAuthStore((state) => state.accessToken); 
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Untuk cek auth
  const [isLoadingFeed, setIsLoadingFeed] = useState(false); // Untuk loading feed
  const [feedError, setFeedError] = useState('');

  // 'fetchFeed' sekarang di-wrap dengan useCallback
  const fetchFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      const res = await api.get('/api/feed');
      setPosts(res.data.posts);
      setFeedError('');
    } catch (err: any) {
      console.error("Failed to fetch feed:", err);
      setFeedError(err.message || "Failed to load feed.");
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    // Cek token saat komponen mount (setelah hidrasi)
    const tokenOnMount = useAuthStore.getState().accessToken;

    if (!tokenOnMount) {
      router.replace('/login');
    } else {
      fetchFeed();
      setIsLoading(false); // Selesai cek auth
    }
    // Kita jalankan ini berdasarkan token dan router, 
    // tapi 'fetchFeed' di-memoize oleh useCallback
  }, [router, fetchFeed, token]); 

  // Tampilan loading utama (saat cek auth)
  if (isLoading) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    );
  }

  // --- TAMPILAN HALAMAN UTAMA (jika sudah login) ---
  return (
    <div className={styles.container}>
      <Head>
        <title>Ganapatih Feed</title>
      </Head>

      {/* --- KOLOM UTAMA (KIRI) --- */}
      <main className={styles.mainContent}>
        <CreatePostForm onPostCreated={fetchFeed} />

        {/* --- Daftar Feed --- */}
        <div className={styles.feedList}>
          {isLoadingFeed && <p>Loading feed posts...</p>}
          
          {feedError && (
            <div className={styles.error}>
              {feedError}
            </div>
          )}

          {/* Cek jika tidak mengikuti siapa pun */}
          {posts.length === 0 && !feedError && !isLoadingFeed && (
            <div className={styles.emptyFeed}>
              <h3 className={styles.emptyFeedTitle}>Your feed is empty</h3>
              <p>Start following other users to see their posts!</p>
            </div>
          )}

          {/* Tampilkan postingan */}
          {!isLoadingFeed && posts.map((post) => (
            <div key={post.id} className={styles.post}>
              <div className={styles.postHeader}>
                <span className={styles.postUser}>User {post.userid}</span>
                {/* --- 2. PERUBAHAN DI SINI --- */}
                <span className={styles.postTime}>
                  <TimeAgo timestamp={post.createdat} />
                </span>
              </div>
              <p className={styles.postContent}>{post.content}</p>
            </div>
          ))}
        </div>
      </main>

      {/* --- SIDEBAR (KANAN) --- */}
      <aside className={styles.sidebar}>
        <UserList onFollowSuccess={fetchFeed} />
      </aside>
    </div>
  );
};

export default HomePage;
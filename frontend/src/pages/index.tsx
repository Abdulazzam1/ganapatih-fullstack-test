// src/pages/index.tsx
import { useState, useEffect, useCallback } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/auth.store';
import api from '../utils/api';

// Import Komponen
import CreatePostForm from '../components/CreatePostForm';
import UserList from '../components/UserList'; // <-- 1. IMPORT USERLIST

// Import CSS Module
import styles from './index.module.css'; // <-- 2. IMPORT CSS LAYOUT BARU

// Tipe data untuk Post
interface Post {
  id: number;
  userid: number;
  content: string;
  createdat: string;
}

const HomePage: NextPage = () => {
  const router = useRouter();
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
    const token = useAuthStore.getState().accessToken;

    if (!token) {
      router.replace('/login');
    } else {
      fetchFeed();
      setIsLoading(false); // Selesai cek auth
    }
  }, [router, fetchFeed]);

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
                <span className={styles.postTime}>
                  {new Date(post.createdat).toLocaleString()}
                </span>
              </div>
              <p className={styles.postContent}>{post.content}</p>
            </div>
          ))}
        </div>
      </main>

      {/* --- SIDEBAR (KANAN) --- */}
      <aside className={styles.sidebar}>
        <UserList /> {/* <-- 3. TAMPILKAN USERLIST DI SINI */}
      </aside>
    </div>
  );
};

export default HomePage;
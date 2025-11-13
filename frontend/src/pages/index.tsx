// src/pages/index.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/auth.store';
import api from '../utils/api';

// Import Komponen
import CreatePostForm from '../components/CreatePostForm';
import UserList from '../components/UserList';
import TimeAgo from '../components/TimeAgo';

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
  const token = useAuthStore((state) => state.accessToken); 
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Untuk cek auth
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  const [feedError, setFeedError] = useState('');

  // --- FUNGSI FETCHFEED YANG DIPERBAIKI ---
  const fetchFeed = useCallback(async (pageNum: number, isReset: boolean = false) => {
    // 1. Cek guard
    if (isLoadingFeed) return;
    // Hanya cek 'hasMore' jika ini BUKAN sebuah reset
    if (!isReset && !hasMore) {
      console.log("No more data to fetch.");
      return; 
    }

    setIsLoadingFeed(true);
    setFeedError('');
    
    try {
      const res = await api.get(`/api/feed?page=${pageNum}&limit=10`);
      
      if (res.data.posts.length > 0) {
        // **PERBAIKAN BUG 1: Ganti (replace) saat reset, Tambah (append) saat tidak**
        setPosts(prevPosts => 
          isReset ? res.data.posts : [...prevPosts, ...res.data.posts]
        );
        setPage(pageNum + 1); // Siapkan untuk halaman berikutnya
        setHasMore(true); // Kita dapat data, jadi pasti 'hasMore'
      } else {
        setHasMore(false); // Tidak ada data lagi
        // Jika ini adalah reset (page 1) dan tidak ada data, pastikan posts kosong
        if (isReset) {
          setPosts([]);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch feed:", err);
      setFeedError(err.message || "Failed to load feed.");
    } finally {
      setIsLoadingFeed(false);
    }
    // 'hasMore' tidak diperlukan sebagai dependensi di sini
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingFeed]); 

  // --- FUNGSI BARU UNTUK RESET ---
  // Ini adalah fungsi yang akan kita panggil dari komponen anak
  const handleResetFeed = () => {
    console.log("Resetting feed...");
    setPosts([]);       // Kosongkan post
    setPage(1);         // Reset halaman ke 1
    setHasMore(true);   // Reset hasMore
    // Panggil fetchFeed(1, true)
    // Kita panggil di useEffect di bawah agar state-nya update dulu
    
    // PERBAIKAN BUG 2: Panggil fetchFeed(1, true) secara eksplisit
    // Ini akan mengabaikan 'hasMore' yang lama dan me-reset feed
    fetchFeed(1, true);
  };
  
  // --- EFEK UNTUK PROTEKSI RUTE ---
  useEffect(() => {
    const tokenOnMount = useAuthStore.getState().accessToken;
    if (!tokenOnMount) {
      router.replace('/login');
    } else {
      // Panggil halaman PERTAMA saat load
      fetchFeed(1, true); // (page=1, isReset=true)
      setIsLoading(false); // Selesai cek auth
    }
    // Hapus fetchFeed dari dependensi ini agar hanya jalan sekali
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); 

  // --- LOGIKA INTERSECTION OBSERVER ---
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingFeed) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log("Last post visible, fetching more data (page " + page + ")");
        // Panggil halaman berikutnya (bukan reset)
        fetchFeed(page, false); 
      }
    });

    if (node) observer.current.observe(node);
    
  }, [isLoadingFeed, hasMore, page, fetchFeed]);
  // ------------------------------------

  // Tampilan loading utama (saat cek auth)
  if (isLoading) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    );
  }

  // --- TAMPILAN HALAMAN UTAMA ---
  return (
    <div className={styles.container}>
      <Head>
        <title>Ganapatih Feed</title>
      </Head>

      {/* --- KOLOM UTAMA (KIRI) --- */}
      <main className={styles.mainContent}>
        {/* Panggil fungsi 'handleResetFeed' */}
        <CreatePostForm onPostCreated={handleResetFeed} />

        {/* --- Daftar Feed --- */}
        <div className={styles.feedList}>
          {/* Tampilkan postingan */}
          {posts.map((post, index) => {
            // Cek apakah ini postingan terakhir
            if (posts.length === index + 1) {
              // Jika ya, pasang 'ref' di sini
              return (
                <div ref={lastPostRef} key={post.id} className={styles.post}>
                  <div className={styles.postHeader}>
                    <span className={styles.postUser}>User {post.userid}</span>
                    <span className={styles.postTime}>
                      <TimeAgo timestamp={post.createdat} />
                    </span>
                  </div>
                  <p className={styles.postContent}>{post.content}</p>
                </div>
              );
            } else {
              // Jika bukan, render seperti biasa
              return (
                <div key={post.id} className={styles.post}>
                  <div className={styles.postHeader}>
                    <span className={styles.postUser}>User {post.userid}</span>
                    <span className={styles.postTime}>
                      <TimeAgo timestamp={post.createdat} />
                    </span>
                  </div>
                  <p className={styles.postContent}>{post.content}</p>
                </div>
              );
            }
          })}

          {/* Tampilkan loading di bagian bawah saat mengambil data baru */}
          {isLoadingFeed && <p>Loading more posts...</p>}

          {feedError && (
            <div className={styles.error}>
              {feedError}
            </div>
          )}

          {/* Cek jika tidak mengikuti siapa pun ATAU sudah tidak ada data lagi */}
          {!isLoadingFeed && posts.length === 0 && !feedError && (
            <div className={styles.emptyFeed}>
              <h3 className={styles.emptyFeedTitle}>Your feed is empty</h3>
              <p>Start following other users to see their posts!</p>
            </div>
          )}
          {!isLoadingFeed && !hasMore && posts.length > 0 && (
             <div className={styles.emptyFeed}>
              <p>You have reached the end of the feed.</p>
            </div>
          )}
        </div>
      </main>

      {/* --- SIDEBAR (KANAN) --- */}
      <aside className={styles.sidebar}>
        {/* Panggil fungsi 'handleResetFeed' */}
        <UserList onFollowSuccess={handleResetFeed} />
      </aside>
    </div>
  );
};

export default HomePage;
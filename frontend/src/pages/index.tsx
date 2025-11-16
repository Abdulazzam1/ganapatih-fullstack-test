// src/pages/index.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/auth.store';
import api from '../utils/api';

import CreatePostForm from '../components/CreatePostForm';
import UserList from '../components/UserList';
import TimeAgo from '../components/TimeAgo';
import styles from './index.module.css';

interface Post {
  id: number;
  userid: number;
  content: string;
  createdat: string;
}

const HomePage: NextPage = () => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [isHydrating, setIsHydrating] = useState(true); // STATE KUNCI
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [feedError, setFeedError] = useState('');

  // (Fungsi fetchFeed Anda sudah benar dari v3.1)
  const fetchFeed = useCallback(async (pageNum: number, isReset: boolean = false) => {
    if (isLoadingFeed) return;
    if (!isReset && !hasMore) {
      console.log("No more data to fetch.");
      return; 
    }
    setIsLoadingFeed(true);
    setFeedError('');
    try {
      const res = await api.get(`/api/feed?page=${pageNum}&limit=10`);
      if (res.data.posts.length > 0) {
        setPosts(prevPosts => 
          isReset ? res.data.posts : [...prevPosts, ...res.data.posts]
        );
        setPage(pageNum + 1);
        setHasMore(true);
      } else {
        setHasMore(false);
        if (isReset) setPosts([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch feed:", err);
      setFeedError(err.message || "Failed to load feed.");
    } finally {
      setIsLoadingFeed(false);
    }
  }, [isLoadingFeed, hasMore]);

  // ==========================================================
  // --- (PERBAIKAN BUG MINOR "FEED HILANG") ---
  // ==========================================================
  const handleResetFeed = () => {
    console.log("Resetting feed after follow/post...");
    // Hapus 'setPosts([])' untuk mencegah "kedipan" atau "feed hilang"
    // setPosts([]); // <-- INI ADALAH BUG-NYA (BARIS INI DIHAPUS)
    setPage(1);
    setHasMore(true);
    // Langsung panggil fetchFeed. 'isReset=true' akan
    // mengganti 'setPosts' dengan data baru secara otomatis.
    fetchFeed(1, true);
  };
  // ==========================================================
  
  // (useEffect Pertama - Hidrasi - Sudah benar dari v3.1)
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      console.log("Already hydrated.");
      setIsHydrating(false);
    } else {
      const unsubscribe = useAuthStore.subscribe(() => {
        if (useAuthStore.persist.hasHydrated()) {
          console.log("Rehydration complete via subscribe.");
          setIsHydrating(false);
          unsubscribe(); 
        }
      });
      
      return () => {
        unsubscribe(); 
      };
    }
  }, []);


  // (useEffect Kedua - Logika Auth/Load - Sudah benar dari v3.1)
  useEffect(() => {
    if (isHydrating) {
      console.log("Waiting for hydration...");
      return; 
    }

    if (!token) {
      console.log("Hydration complete, NO token found. Redirecting to login.");
      router.replace('/login');
    } else {
      console.log("Hydration complete, token FOUND. Loading data.");
      fetchFeed(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrating, token, router]);


  // (Logika Intersection Observer Anda sudah benar)
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingFeed) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchFeed(page, false); 
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingFeed, hasMore, page, fetchFeed]);

  // (Tampilan loading utama diubah untuk menangani hidrasi - Sudah benar)
  if (isHydrating) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    );
  }

  // (Sisa JSX Anda sudah benar)
  return (
    <div className={styles.container}>
      <Head>
        <title>Ganapatih Feed</title>
      </Head>
      <main className={styles.mainContent}>
        <CreatePostForm onPostCreated={handleResetFeed} />
        <div className={styles.feedList}>
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
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
          {isLoadingFeed && <p>Loading more posts...</p>}
          {feedError && (<div className={styles.error}>{feedError}</div>)}
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
      <aside className={styles.sidebar}>
        <UserList onFollowSuccess={handleResetFeed} />
      </aside>
    </div>
  );
};

export default HomePage;
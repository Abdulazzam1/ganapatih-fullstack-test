// src/components/UserList.tsx
import { useState, useEffect } from 'react';
import styles from './UserList.module.css';
import api from '../utils/api';

// Tipe data untuk User
interface User {
  id: number;
  username: string;
}

// Props
interface UserListProps {
  onFollowSuccess: () => void; // Fungsi untuk me-refresh feed
}

export default function UserList({ onFollowSuccess }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State baru untuk melacak siapa yang sudah kita follow
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil daftar SEMUA user
        const usersRes = await api.get('/api/users');
        setUsers(usersRes.data);

        // 2. Ambil daftar ID yang SUDAH kita follow
        const followingRes = await api.get('/api/following');
        // 'followingRes.data' adalah array seperti [5, 7]
        setFollowingIds(new Set(followingRes.data));

      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // Hanya jalan sekali

  const handleFollowToggle = async (userId: number) => {
    // Cek apakah kita sudah follow user ini?
    const isCurrentlyFollowing = followingIds.has(userId);

    try {
      if (isCurrentlyFollowing) {
        // --- LOGIKA UNFOLLOW ---
        await api.delete(`/api/follow/${userId}`); // Panggil DELETE
        // Update state secara optimis (langsung)
        setFollowingIds(prevIds => {
          const newIds = new Set(prevIds);
          newIds.delete(userId);
          return newIds;
        });
      } else {
        // --- LOGIKA FOLLOW ---
        await api.post(`/api/follow/${userId}`); // Panggil POST
        // Update state secara optimis (langsung)
        setFollowingIds(prevIds => {
          const newIds = new Set(prevIds);
          newIds.add(userId);
          return newIds;
        });
      }

      // 3. Panggil refresh feed (untuk kedua aksi)
      onFollowSuccess();

    } catch (err: any) {
      console.error("Follow/unfollow failed:", err);
      alert(err.response?.data?.message || "Failed");
    }
  };

  if (isLoading) {
    return <div className={styles.container}>Loading users...</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Who to follow</h3>
      <div className={styles.list}>
        {users.length === 0 && <p>No other users found.</p>}
        
        {users.map((user) => {
          const isFollowing = followingIds.has(user.id);
          
          return (
            <div key={user.id} className={styles.userItem}>
              <span className={styles.username}>{user.username}</span>
              <button 
                className={styles.followButton}
                onClick={() => handleFollowToggle(user.id)}
                // 4. Ganti style dan teks tombol secara dinamis
                style={{
                  backgroundColor: isFollowing ? '#6b7280' : '#3b82f6', // Abu-abu jika following
                  color: 'white',
                }}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
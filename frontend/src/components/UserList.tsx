// src/components/UserList.tsx
import { useState, useEffect } from 'react';
import styles from './UserList.module.css';
import api from '../utils/api';

// Tipe data untuk User
interface User {
  id: number;
  username: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ambil daftar user saat komponen dimuat
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/users');
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []); // Dependensi kosong, hanya jalan sekali

  const handleFollow = async (userId: number) => {
    try {
      // Panggil API follow [cite: 136-140]
      const res = await api.post(`/api/follow/${userId}`);
      alert(res.data.message);
      // Idealnya, kita harus me-refresh feed, tapi untuk sekarang alert saja cukup
    } catch (err: any) {
      console.error("Failed to follow user:", err);
      alert(err.response?.data?.message || "Failed to follow");
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
        
        {users.map((user) => (
          <div key={user.id} className={styles.userItem}>
            <span className={styles.username}>{user.username}</span>
            <button 
              className={styles.followButton}
              onClick={() => handleFollow(user.id)}
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
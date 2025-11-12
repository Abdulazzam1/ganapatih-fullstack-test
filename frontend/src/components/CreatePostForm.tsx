// src/components/CreatePostForm.tsx
import { useState } from 'react';
import styles from './CreatePostForm.module.css';
import api from '../utils/api';

// Props: Fungsi yang akan dipanggil setelah post berhasil dibuat
interface CreatePostFormProps {
  onPostCreated: () => void; // Kita akan gunakan ini untuk me-refresh feed
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const charCount = content.length;
  const isOverLimit = charCount > 200; // [cite: 64-65]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit || charCount === 0) return;

    setIsLoading(true);
    setError('');

    try {
      // Panggil API create post [cite: 126-135]
      await api.post('/api/posts', { content });
      
      // Berhasil!
      setContent(''); // Kosongkan form
      onPostCreated(); // Panggil fungsi refresh dari parent [cite: 66-68]

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <textarea
        className={styles.textarea}
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
      />
      
      {error && <p className={styles.counter}>{error}</p>}

      <div className={styles.footer}>
        {/* Real-time character counter [cite: 64-65] */}
        <span 
          className={`${styles.counter} ${isOverLimit ? styles.error : ''}`}
        >
          {charCount} / 200
        </span>
        
        <button 
          type="submit" 
          className={styles.button}
          disabled={isLoading || isOverLimit || charCount === 0}
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
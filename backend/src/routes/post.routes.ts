// src/routes/post.routes.ts
import { Router } from 'express';
// Impor getFeed
import { createPost, getFeed } from '../controllers/post.controller';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();

// Terapkan authMiddleware di sini
router.post('/api/posts', authMiddleware, createPost);

// Tambahkan route baru untuk GET /api/feed
router.get('/api/feed', authMiddleware, getFeed);

export default router;
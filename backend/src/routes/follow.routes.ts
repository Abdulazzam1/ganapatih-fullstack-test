// src/routes/follow.routes.ts
import { Router } from 'express';
import { followUser, unfollowUser } from '../controllers/follow.controller';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();

// Terapkan authMiddleware di semua rute ini
router.post('/api/follow/:userid', authMiddleware, followUser);
router.delete('/api/follow/:userid', authMiddleware, unfollowUser);

export default router;
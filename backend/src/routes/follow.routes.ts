// backend/src/routes/follow.routes.ts
import { Router } from 'express';
// 1. Import 'getFollowing'
import { followUser, unfollowUser, getFollowing } from '../controllers/follow.controller';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();

// 2. Tambahkan rute baru ini
router.get('/api/following', authMiddleware, getFollowing);

router.post('/api/follow/:userid', authMiddleware, followUser);
router.delete('/api/follow/:userid', authMiddleware, unfollowUser);

export default router;
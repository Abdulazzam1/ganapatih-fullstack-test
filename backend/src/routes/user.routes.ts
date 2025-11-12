// src/routes/user.routes.ts
import { Router } from 'express';
import { getAllUsers } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();

// Rute baru untuk dapatkan semua user (perlu login)
router.get('/api/users', authMiddleware, getAllUsers);

export default router;
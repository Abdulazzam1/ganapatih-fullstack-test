// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login, refresh } from '../controllers/auth.controller';

// FIX: Tambahkan tipe anotasi ": Router" untuk memperbaiki error
const router: Router = Router();

router.post('/api/register', register);
router.post('/api/login', login);
router.post('/api/refresh', refresh);

export default router;
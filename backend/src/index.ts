// src/index.ts (VERSI FINAL YANG BERSIH)
import "dotenv/config";
import express from 'express';
import cookieParser from 'cookie-parser';

// --- IMPORT SEMUA ROUTER ---
import authRouter from './routes/auth.routes';
import postRouter from './routes/post.routes';
import followRouter from './routes/follow.routes';

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

// --- GUNAKAN SEMUA ROUTERS ---
app.use(authRouter);   // Mendaftarkan /api/register, /api/login, /api/refresh
app.use(postRouter);   // Mendaftarkan /api/posts
app.use(followRouter); // Mendaftarkan /api/follow/:userid

// --- (Pastikan ini selalu di paling bawah) ---
// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
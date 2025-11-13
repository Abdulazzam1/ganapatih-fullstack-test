// backend/src/index.ts
import "dotenv/config";
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// --- IMPORT SEMUA ROUTER ---
import authRouter from './routes/auth.routes';
import postRouter from './routes/post.routes';
import followRouter from './routes/follow.routes';
import userRouter from './routes/user.routes'; // <-- 1. IMPORT BARU

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

// --- MIDDLEWARE CORS ---
app.use(cors({
  origin: 'http://localhost:3000', // Izinkan port frontend
  credentials: true, // Izinkan pengiriman cookie (untuk refresh token)
}));

// --- GUNAKAN ROUTERS ---
app.use(authRouter);
app.use(postRouter);
app.use(followRouter);
app.use(userRouter); // <-- 2. TAMBAHKAN BARIS INI

// --- Jalankan server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
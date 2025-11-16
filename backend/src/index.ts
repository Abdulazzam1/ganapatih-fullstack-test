// backend/src/index.ts
import "dotenv/config";
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// --- IMPORT SEMUA ROUTER (Sudah benar dari file Anda) ---
import authRouter from './routes/auth.routes';
import postRouter from './routes/post.routes';
import followRouter from './routes/follow.routes';
import userRouter from './routes/user.routes';

const app = express();
// Port ini akan dibaca dari environment (misal 8080 di Railway) atau 4000
const PORT = process.env.PORT || 4000;

// --- Middleware (Sudah benar dari file Anda) ---
app.use(express.json());
app.use(cookieParser());

// ==========================================================
// --- (PERBAIKAN) KONFIGURASI CORS FINAL UNTUK VERCEL ---
// ==========================================================
// Daftar domain yang diizinkan (Whitelist)
const whitelist = [
    'https://ganapatih-fullstack-test-2mx1iicdz-abdulazzam1s-projects.vercel.app', // <-- Domain Vercel Anda
    'http://localhost:3000' // <-- Jaga agar 'pnpm run dev' & Docker lokal tetap berfungsi
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Izinkan jika origin ada di whitelist (atau jika origin 'undefined' misal: Postman)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Tolak jika origin tidak ada di whitelist
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // <-- WAJIB untuk mengizinkan cookie (Refresh Token)
};

// Gunakan middleware cors yang sudah dikonfigurasi
app.use(cors(corsOptions));
// ==========================================================
// --- AKHIR PERBAIKAN CORS ---
// ==========================================================


// --- GUNAKAN ROUTERS (Sudah benar dari file Anda) ---
app.use(authRouter);
app.use(postRouter);
app.use(followRouter);
app.use(userRouter);

// --- Jalankan server ---
app.listen(PORT, () => {
  // Log ini akan muncul di log Railway
  console.log(`Server is running on port ${PORT}`);
});
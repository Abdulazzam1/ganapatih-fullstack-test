// backend/src/index.ts
import "dotenv/config";
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// --- IMPORT SEMUA ROUTER ---
import authRouter from './routes/auth.routes';
import postRouter from './routes/post.routes';
import followRouter from './routes/follow.routes';
import userRouter from './routes/user.routes';

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

// ==========================================================
// --- (PERBAIKAN) MENAMBAHKAN URL PRODUKSI VERCEL ---
// ==========================================================
const whitelist = [
    // URL Preview Vercel
    'https://ganapatih-fullstack-test-2mx1iicdz-abdulazzam1s-projects.vercel.app',
    // URL Produksi Vercel (BARU DITAMBAHKAN)
    'https://ganapatih-fullstack-test.vercel.app', 
    // Lingkungan Lokal & Docker
    'http://localhost:3000' 
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, 
};

app.use(cors(corsOptions));
// ==========================================================
// --- AKHIR PERBAIKAN CORS ---
// ==========================================================


// --- GUNAKAN ROUTERS ---
app.use(authRouter);
app.use(postRouter);
app.use(followRouter);
app.use(userRouter);

// --- Jalankan server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
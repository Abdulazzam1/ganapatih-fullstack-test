# --- Tahap 1: Build Stage (Membangun Aplikasi) ---
FROM node:20-alpine AS builder

WORKDIR /app

# --- PERBAIKAN ---
# Salin file dari folder 'backend' di dalam konteks build
COPY backend/package.json backend/pnpm-lock.yaml ./

# Install pnpm dan install dependensi
RUN npm install -g pnpm
RUN pnpm install

# --- PERBAIKAN ---
# Salin sisa kode HANYA dari folder 'backend'
COPY backend/ .

# Terima 'build argument' bernama DATABASE_URL
ARG DATABASE_URL
# Set 'environment variable' HANYA UNTUK TAHAP BUILD INI
ENV DATABASE_URL=$DATABASE_URL

# Jalankan 'prisma generate' (wajib ada setelah install)
RUN pnpm prisma generate

# Jalankan 'build' script
RUN pnpm build

# --- Tahap 2: Runtime Stage (Menjalankan Aplikasi) ---
# (Saya juga menerapkan rekomendasi Node 20 di sini)
FROM node:20-alpine

WORKDIR /app

# (Semua 'COPY --from=builder' di bawah ini sudah benar,
# karena mereka menyalin dari 'builder' stage, BUKAN dari konteks lokal)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Tentukan user non-root untuk keamanan
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Tentukan port yang akan diekspos
EXPOSE 4000

# Perintah untuk menjalankan aplikasi saat container dimulai
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
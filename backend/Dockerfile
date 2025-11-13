# --- Tahap 1: Build Stage (Membangun Aplikasi) ---
# Kita gunakan image Node.js 18 yang 'penuh' untuk membangun
FROM node:20-alpine AS builder

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan pnpm-lock.yaml terlebih dahulu
# Ini memanfaatkan cache Docker. Jika file-file ini tidak berubah,
# Docker tidak akan meng-install ulang dependensi.
COPY package.json pnpm-lock.yaml ./

# Install pnpm dan install dependensi
RUN npm install -g pnpm
RUN pnpm install

# Salin sisa kode aplikasi (termasuk .env, prisma, src)
COPY . .

# Terima 'build argument' bernama DATABASE_URL
ARG DATABASE_URL
# Set 'environment variable' HANYA UNTUK TAHAP BUILD INI
ENV DATABASE_URL=$DATABASE_URL

# Jalankan 'prisma generate' (wajib ada setelah install)
RUN pnpm prisma generate

# Jalankan 'build' script (yang akan kita buat) untuk mengubah TypeScript -> JavaScript
RUN pnpm build

# --- Tahap 2: Runtime Stage (Menjalankan Aplikasi) ---
# Kita gunakan image Node.js 18 yang 'slim' (lebih kecil) untuk produksi
FROM node:18-alpine

WORKDIR /app

# Salin hanya file yang diperlukan dari 'builder'
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Salin schema.prisma (penting untuk runtime Prisma)
# COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma

# Tentukan user non-root untuk keamanan (opsional tapi bagus)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Tentukan port yang akan diekspos
EXPOSE 4000

# Perintah untuk menjalankan aplikasi saat container dimulai
# Kita akan menjalankan JavaScript yang sudah di-build, bukan ts-node-dev
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
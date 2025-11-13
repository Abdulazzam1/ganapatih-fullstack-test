# --- Tahap 1: Build Stage (Membangun Aplikasi) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Salin file package.json dan pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependensi
RUN pnpm install

# Salin sisa kode aplikasi
COPY . .

# Set environment variable untuk build (agar tidak error)
ARG NEXT_PUBLIC_API_URL
# Set 'environment variable' HANYA UNTUK TAHAP BUILD INI
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build aplikasi Next.js
RUN pnpm build

# --- Tahap 2: Runtime Stage (Menjalankan Aplikasi) ---
FROM node:20-alpine

WORKDIR /app

# Install pnpm (diperlukan untuk 'pnpm start')
RUN npm install -g pnpm

# Salin hanya file yang diperlukan dari 'builder'
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Tentukan user non-root untuk keamanan
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Tentukan port yang akan diekspos (Next.js berjalan di port 3000)
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
# 'pnpm start' akan menjalankan 'next start'
CMD ["pnpm", "start"]
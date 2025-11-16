# Ganapatih Full-Stack Test: Simple News Feed System

Ini adalah submisi untuk *Take-Home Test* posisi Full-Stack Developer dari **PT Ganapatih Akasa Solutions**.

Proyek ini adalah "Simple News Feed System", sebuah klon mini Twitter/Instagram, di mana pengguna dapat mendaftar, membuat postingan teks, mengikuti pengguna lain, dan melihat *feed* berisi postingan dari pengguna yang mereka ikuti.

**Penulis:** Abdullah Azzam

---

## 🚀 Tautan Deployment (Wajib)

Aplikasi ini di-deploy sepenuhnya menggunakan *stack* Vercel (Frontend), Railway (Backend), dan Neon (Database), sesuai persyaratan submisi.

* **Frontend (Vercel):**  
  [**https://ganapatih-fullstack-test.vercel.app**](https://ganapatih-fullstack-test.vercel.app)

* **Backend (Railway):**  
  [**https://ganapatih-fullstack-test-production.up.railway.app**](https://ganapatih-fullstack-test-production.up.railway.app)

---

## ✨ Fitur Utama

Aplikasi ini memenuhi semua persyaratan fungsional dan non-fungsional dari dokumen tes:

* **Manajemen Pengguna:** Registrasi dan Login (Otentikasi)
* **Manajemen Postingan:** Pengguna dapat membuat postingan teks (maks 200 karakter)
* **Sistem Follow/Unfollow:** Pengguna dapat mengikuti dan berhenti mengikuti pengguna lain
* **News Feed:** Halaman utama menampilkan *feed* postingan dari pengguna yang di-*follow*, diurutkan dari yang terbaru, dengan dukungan paginasi
* **Penanganan Error:** Implementasi penuh *error handling* sisi server (401, 404, 409, 422)

## 🏆 Poin Bonus yang Diimplementasikan

Selain persyaratan wajib, proyek ini juga mengimplementasikan 3 Poin Bonus utama:

1. **Authentication (JWT with Refresh Tokens)**  
   Menggunakan strategi otentikasi canggih dengan `accessToken` (15 menit) dan `refreshToken` (7 hari, disimpan dalam `httpOnly` *cookie*).  
   Mengimplementasikan *interceptor* `axios` di *frontend* yang secara otomatis menangani *refresh* token di latar belakang.

2. **Containerization (Docker & Docker Compose)**  
   Menyediakan `Dockerfile` *multi-stage* yang teroptimasi untuk *backend* (Node/Express) dan *frontend* (Next.js).  
   Menyediakan file `docker-compose.yml` yang lengkap untuk menjalankan seluruh *stack* aplikasi (FE, BE, DB) secara lokal dengan satu perintah.

3. **UI/UX (Infinite Scroll & Time-Ago)**  
   * **Infinite Scroll:** *Feed* secara otomatis memuat postingan lama saat pengguna *scroll* ke bawah.  
   * **Time-Ago:** *Timestamp* postingan ditampilkan dalam format relatif (mis: "15 minutes ago" atau "1 day ago").

---

## 🛠️ Stack Teknologi

* **Frontend:** Next.js, TypeScript, Zustand (State Management), Axios  
* **Backend:** Node.js, Express, TypeScript, Prisma (ORM)  
* **Database:** PostgreSQL  
* **Deployment:**  
   * **Frontend:** Vercel  
   * **Backend:** Railway (via Dockerfile)  
   * **Database:** Neon

---

## ⚙️ Setup dan Instalasi

Proyek ini dapat dijalankan dengan dua cara:

### 1. Setup Lokal (Development)

**Prasyarat:** Node.js, `pnpm`, PostgreSQL (berjalan di lokal).

1. **Clone Repository:**
    ```bash
    git clone https://github.com/Abdulazzam1/ganapatih-fullstack-test.git
    cd ganapatih-fullstack-test
    ```

2. **Setup Backend:**
    ```bash
    cd backend
    pnpm install
    
    # Salin .env.example dan isi nilainya
    cp .env.example .env 
    
    # Jalankan migrasi database
    pnpm prisma migrate dev
    
    # Jalankan server backend (di http://localhost:4000)
    pnpm run dev
    ```

3. **Setup Frontend (di terminal baru):**
    ```bash
    cd frontend
    pnpm install
    
    # Salin .env.local.example dan isi nilainya
    cp .env.local.example .env.local
    
    # Jalankan server frontend (di http://localhost:3000)
    pnpm run dev
    ```

### 2. Setup Docker (Recommended)

**Prasyarat:** Docker Desktop (berjalan).

Cara ini akan menjalankan *frontend*, *backend*, dan *database* PostgreSQL di dalam *container*.

1. **Clone Repository:**
    ```bash
    git clone https://github.com/Abdulazzam1/ganapatih-fullstack-test.git
    cd ganapatih-fullstack-test
    ```

2. **Buat Environment Files:**
    * Buat file `backend/.env` (gunakan `backend/.env.example` sebagai template).
    * Buat file `frontend/.env.local` (gunakan `frontend/.env.local.example` sebagai template).
    * *PENTING:* Untuk Docker, `DATABASE_URL` di `backend/.env` harus menunjuk ke *service* Docker: `postgresql://admin:password123@db:5432/ganapatih_feed?schema=public`

3. **Jalankan Docker Compose:**
    ```bash
    docker-compose up --build
    ```

4. Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🔑 Variabel Lingkungan (.env.example)

Proyek ini membutuhkan file `.env` di *backend* dan *frontend*.

#### `backend/.env.example`
```ini
# URL koneksi ke database PostgreSQL Anda
DATABASE_URL="postgresql://admin:password123@db:5432/ganapatih_feed?schema=public"

# Kunci rahasia untuk menandatangani Access Token (15m)
JWT_SECRET="rahasia-jwt-anda"

# Kunci rahasia untuk menandatangani Refresh Token (7d)
REFRESH_TOKEN_SECRET="rahasia-refresh-token-anda-yang-berbeda"

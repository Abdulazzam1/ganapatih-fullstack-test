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
```
#### `frontend/.env.local.example`
```ini
# URL di mana backend API Anda berjalan
NEXT_PUBLIC_API_URL="http://localhost:4001"
```

## 📚 Kontrak API
| Endpoint | Method | Auth | Body | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `/api/register` | `POST` | Tidak | `{ "username", "password" }` | Registrasi pengguna baru. |
| `/api/login` | `POST` | Tidak | `{ "username", "password" }` | Login pengguna, mengembalikan `accessToken` (JSON) dan `refreshToken` (Cookie). |
| `/api/refresh` | `POST` | Tidak | (Kosong, perlu *cookie*) | Menggunakan `refreshToken` dari *cookie* untuk menerbitkan `accessToken` baru (Poin Bonus). |
| `/api/posts` | `POST` | Wajib | `{ "content" }` | Membuat postingan baru (maks 200 char). |
| `/api/feed` | `GET` | Wajib | (Query: `?page=1&limit=10`) | Mengambil *feed* postingan (paginasi) dari pengguna yang di-*follow*. |
| `/api/follow/:userid` | `POST` | Wajib | (Kosong) | Mengikuti seorang pengguna. |
| `/api/follow/:userid` | `DELETE`| Wajib | (Kosong) | Berhenti mengikuti seorang pengguna. |
| `/api/users` | `GET` | Wajib | (Kosong) | Mengambil daftar semua pengguna (untuk "Who to follow"). |

## ✅ Skenario Pengujian

| Test Case | Fitur | Skenario Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-1.1** | User Mgmt | Registrasi pengguna baru | "Registration successful!" | **Lulus** |
| **TC-1.2** | User Mgmt | Registrasi pengguna duplikat | Error 409: "Username already exists" | **Lulus** |
| **TC-1.3** | User Mgmt | Registrasi input kosong | Error: "cannot be empty" | **Lulus** |
| **TC-1.4** | User Mgmt | Login dengan kredensial valid | Berhasil masuk ke halaman feed (`/`) | **Lulus** |
| **TC-1.5** | User Mgmt | Login dengan password salah | Error 401: "Invalid username or password" | **Lulus** |
| **TC-2.1** | Posts | Membuat postingan baru (<200 char) | Postingan baru muncul di feed | **Lulus** |
| **TC-2.2** | Posts | Validasi postingan (>200 char) | Tombol "Post" nonaktif (disabled) | **Lulus** |
| **TC-3.1** | Follow | Follow seorang pengguna | Tombol berubah menjadi "Unfollow" | **Lulus** |
| **TC-3.2** | Follow | Unfollow seorang pengguna | Tombol berubah menjadi "Follow" | **Lulus** |
| **TC-4.1** | News Feed | Feed (setelah follow pengguna) | Postingan dari pengguna yang di-follow muncul | **Lulus** |
| **TC-4.2** | News Feed | Feed (tidak follow siapa pun) | Menampilkan pesan "Your feed is empty" | **Lulus** |
| **TC-B1.1** | Bonus: Auth | Refresh halaman setelah login ("Bug Pentalan") | Pengguna tetap login, tidak terpental | **Lulus** |
| **TC-B1.2** | Bonus: Auth | Aksi setelah 16 menit (token kedaluwarsa) | Aksi berhasil (auto refresh token) | **Lulus** |
| **TC-B2.1** | Bonus: UI/UX | Tampilan timestamp postingan | Menampilkan format "time-ago" (mis: "15 minutes ago") | **Lulus** |
| **TC-B2.2** | Bonus: UI/UX | Scroll feed ke paling bawah | Menampilkan "You have reached the end of the feed." | **Lulus** |
| **TC-C1.1** | Bonus: Docker| `docker-compose up --build` | Semua 3 layanan (FE, BE, DB) berjalan sukses | **Lulus** |
| **TC-C1.2** | Bonus: Docker| Tes koneksi FE <-> BE di Docker | Registrasi pengguna baru di `localhost:3000` berhasil | **Lulus** |
| **TC-D1.1** | Deploy | Tes koneksi BE <-> DB (Railway <-> Neon) | Migrasi database berjalan sukses di log deploy | **Lulus** |
| **TC-D1.2** | Deploy | Tes CORS (Vercel <-> Railway) | Registrasi pengguna di URL Vercel berhasil (CORS teratasi) | **Lulus** |
| **TC-F1.1** | Bug Fix | Tes "Feed Hilang" saat Follow/Unfollow | Feed me-refresh dengan mulus tanpa "menghilang" | **Lulus** |

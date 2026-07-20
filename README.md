# 🏍️ OtoMeet - Frontend Application

OtoMeet adalah platform aplikasi web interaktif yang didesain khusus untuk komunitas motor di Indonesia. Aplikasi ini memudahkan komunitas dalam manajemen agenda touring, diskusi antar anggota, serta manajemen profil pengguna.

Repositori ini berisi kode sumber untuk bagian **Frontend** dari aplikasi OtoMeet.

## 🚀 Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan teknologi modern untuk memastikan performa yang cepat dan antarmuka yang elegan:

- **React.js** - Library JavaScript utama untuk membangun antarmuka pengguna (UI).
- **Vite** - Build tool yang sangat cepat untuk pengembangan Frontend modern.
- **Tailwind CSS** - Framework CSS utility-first untuk desain responsif dan kustomisasi yang cepat.
- **React Router Dom** - Penanganan navigasi (routing) halaman tunggal (SPA).
- **Lucide React** - Kumpulan ikon minimalis dan modern.
- **Axios** - HTTP client untuk melakukan request ke backend API.

## ✨ Fitur Utama

- **Autentikasi Pengguna**: Login dan Register menggunakan JWT (JSON Web Token) dengan standar keamanan yang baik.
- **Dashboard**: Panel kontrol utama yang menampilkan statistik, daftar touring yang tersedia, dan informasi profil.
- **Manajemen Agenda (Admin)**: Hak akses khusus bagi peran `admin` untuk menambahkan dan mengelola jadwal touring baru.
- **Manajemen Profil**: Pengguna dapat melihat dan memperbarui data diri, biografi, serta foto profil (avatar).
- **Forum Diskusi**: Fitur obrolan (chat) real-time untuk setiap agenda touring, dilengkapi dengan pemisah tanggal dan notifikasi pesan belum dibaca.
- **Tema Terang/Gelap (Dark Mode)**: Mendukung mode gelap elegan yang nyaman di mata untuk penggunaan malam hari.
- **Desain Responsif & Premium**: Tampilan antarmuka yang sangat modern (glassmorphism, transisi halus) dan dapat menyesuaikan ukuran layar (Mobile & Desktop).

## 📋 Persyaratan Sistem

Sebelum menjalankan proyek ini, pastikan Anda telah menginstal:
- **Node.js** (versi 18.x atau lebih baru disarankan)
- **npm** atau **yarn**

## 🛠️ Instalasi dan Menjalankan Proyek

1. **Clone Repositori ini:**
   ```bash
   git clone <url-repo-frontend>
   cd otofrontend
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment (Variabel Lingkungan):**
   Buat file `.env` di root direktori (sejajar dengan `package.json`) dan tambahkan URL Backend API Anda:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
   *(Sesuaikan URL di atas dengan port tempat backend Golang Anda berjalan)*

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan secara lokal. Buka `http://localhost:5173` (atau port yang diberikan oleh Vite) di browser Anda.

## 📦 Build untuk Production

Jika Anda ingin melakukan kompilasi proyek untuk lingkungan produksi (deployment):
```bash
npm run build
```
Hasil build akan berada di dalam folder `dist/`, yang siap untuk di-deploy ke platform seperti Vercel, Netlify, atau web server lainnya.

---
Dibuat dengan ❤️ untuk komunitas motor Indonesia.

# Dokumentasi Tugas Besar Pemrograman III (Webservice)
**OtoMeet - Sistem Manajemen Agenda Touring & Komunitas Otomotif**

---

## 1. Nama Anggota Kelompok
1. Rafli Mochamad Ramadhan (NPM: 714240059)
2. Muhammad Bagus Tri Atmaja (NPM: 714240060)

## 2. Deskripsi Singkat Aplikasi
**OtoMeet** adalah sebuah aplikasi berbasis web yang dirancang untuk memfasilitasi manajemen kegiatan komunitas otomotif, khususnya dalam pengelolaan jadwal *touring*. Sistem ini memudahkan anggota komunitas untuk melihat agenda, mendaftar kegiatan, dan berdiskusi pada masing-masing agenda *touring*.

Sistem ini menghubungkan 2 peran utama:
*   **User/Anggota:** Dapat membuat akun, mengelola data garasi kendaraan (motor & plat nomor), bergabung dengan agenda *touring* yang tersedia, memantau riwayat jadwal yang diikuti, serta berpartisipasi dalam forum diskusi *real-time* per agenda *touring*.
*   **Admin:** Bertanggung jawab penuh mengelola sistem, membuat jadwal agenda *touring* baru (CRUD: nama kegiatan, tujuan, tanggal, kuota, deskripsi), memantau statistik pendaftar, mencetak rekap data, serta mengelola/mengeluarkan peserta jika diperlukan.

## 3. Desain Database & Relasi Tabel
Aplikasi OtoMeet menggunakan Supabase (PostgreSQL) sebagai basis datanya. Berikut adalah struktur tabel utama beserta relasinya:

1.  **users**: Menyimpan data autentikasi dan profil pengguna (Username, Email, Nama, Password Hash bcrypt, Role). Tabel ini merupakan tabel induk yang terhubung ke hampir semua tabel lainnya.
2.  **tourings**: Tabel utama yang menyimpan data kegiatan (nama_touring, tujuan, tanggal, deskripsi, kuota). Tabel ini memiliki *foreign key* `created_by` yang merujuk ke tabel `users` (admin pembuat).
3.  **vehicles**: Menyimpan data kendaraan (model motor, plat nomor) milik pengguna. Memiliki *foreign key* `user_id` yang terhubung ke tabel `users` (*One-to-Many*).
4.  **pendaftaran_touring**: Tabel *pivot* yang mencatat pengguna mana yang mendaftar ke agenda mana beserta kendaraan yang dibawa. Menghubungkan tabel `users` dan `tourings` (*Many-to-Many*).
5.  **forum_messages**: Menyimpan histori percakapan diskusi. Menghubungkan tabel `users` (pengirim pesan) dan `tourings` (ruang diskusi/topik).

---

## 4. Dokumentasi Visual & Pengujian (Screenshots)

### A. Tabel di Supabase
**Penjelasan:** Screenshot ini menampilkan antarmuka Supabase Table Editor yang menunjukkan tabel-tabel utama (seperti `users`, `tourings`, `pendaftaran_touring`, `vehicles`) beserta kolom-kolomnya yang sudah terstruktur dengan baik sesuai dengan skema relasi database PostgreSQL di atas.

> 🖼️ **[TEMPELKAN SCREENSHOT TABEL SUPABASE DI SINI]**

---

### B. Hasil Pengujian Endpoint (Swagger / Postman)

#### 1. Registrasi Akun Pengguna
**Aktivitas:** Pengguna mengirimkan data pendaftaran via metode POST ke endpoint `/api/register`.
**Hasil Sistem:** Sistem memberikan respons `201 (Created)` dengan pesan registrasi sukses. Data pengguna beserta password yang sudah di-hash tersimpan di tabel `users`.

> 🖼️ **[TEMPELKAN SCREENSHOT PENGUJIAN ENDPOINT REGISTER DI SINI]**

#### 2. Melakukan Login untuk Mendapatkan Token
**Aktivitas:** Pengguna melakukan login dengan mengirimkan *username* dan *password* ke endpoint `/api/login`.
**Hasil Sistem:** Sistem memverifikasi kredensial dan memberikan respons `200 (OK)` serta menerbitkan **Bearer Token (JWT)** sebagai kunci otorisasi akses ke *endpoint protected*.

> 🖼️ **[TEMPELKAN SCREENSHOT PENGUJIAN ENDPOINT LOGIN DI SINI]**

#### 3. Mengakses Endpoint Terproteksi (Contoh: Menampilkan Jadwal Touring)
**Aktivitas:** Dengan menyertakan token di *header Authorization*, pengguna mengakses endpoint `/api/touring` dengan metode GET.
**Hasil Sistem:** Sistem merespons `200 (OK)` dengan pesan "berhasil mengambil data", lalu mengembalikan format array JSON berisi jadwal *touring*.

> 🖼️ **[TEMPELKAN SCREENSHOT PENGUJIAN GET DATA DI SINI]**

---

### C. Dokumentasi Halaman Frontend

#### 1. Halaman Login dan Registrasi
**Penjelasan:** Tampilan antarmuka halaman Login dan Registrasi. Halaman ini sudah dilengkapi dengan validasi *form* untuk mencegah data kosong, serta *feedback* interaktif jika input tidak sesuai.

> 🖼️ **[TEMPELKAN SCREENSHOT HALAMAN LOGIN & REGISTER DI SINI]**

#### 2. Penggunaan Token JWT (Local Storage)
**Penjelasan:** Gambar ini menunjukkan tab *Application > Local Storage* di *DevTools* browser (atau tab Network). Menandakan bahwa *token JWT* dari backend telah sukses tersimpan di *client-side* dan disisipkan otomatis (melalui Axios Interceptors) ke dalam *header Authorization* saat mengambil data agenda.

> 🖼️ **[TEMPELKAN SCREENSHOT LOCAL STORAGE / NETWORK HEADER JWT DI SINI]**

#### 3. Halaman Frontend Utama (Dashboard)
**Penjelasan:** Halaman Dasbor OtoMeet. Menyajikan statistik ringkas secara *real-time* (Total Pengguna, Agenda, Registrasi) dengan grafik analitik (*Bar Chart*), lengkap dengan opsi filter data, fitur pencarian (*search*), dan ekspor data ke Excel/PDF.

> 🖼️ **[TEMPELKAN SCREENSHOT HALAMAN DASHBOARD DI SINI]**

#### 4. CRUD Data Utama (Agenda Touring & Garasi)
**Penjelasan:** Siklus CRUD beroperasi penuh pada menu Agenda Touring dan Profil (Garasi).
*   **Create:** Admin dapat membuat jadwal *touring* baru, dan pengguna biasa dapat menambahkan data motor ke garasi mereka.
*   **Read:** Data ditampilkan di dalam tabel interaktif beserta status (Akan Datang/Penuh/Selesai).
*   **Update:** Admin dapat mengedit detail agenda (tanggal, kuota, tujuan).
*   **Delete:** Terdapat notifikasi konfirmasi berlapis sebelum Admin menghapus sebuah agenda atau mengeluarkan peserta, guna mencegah penghapusan data secara tak sengaja.

> 🖼️ **[TEMPELKAN SCREENSHOT FORM TAMBAH AGENDA, EDIT, DAN MODAL HAPUS DI SINI]**

---

## 5. Tautan Repositori & Aplikasi
*   **Repository GitHub Backend (Golang/Fiber):** [https://github.com/username/otomeet-backend]
*   **Repository GitHub Frontend (React/Vite):** [https://github.com/username/otofrontend]
*   **Link Deploy Backend:** [https://otomeet-backend.railway.app]
*   **Link Deploy Frontend:** [https://otomeet-frontend.vercel.app]
*   **Link Swagger UI Backend:** [https://otomeet-backend.railway.app/docs]

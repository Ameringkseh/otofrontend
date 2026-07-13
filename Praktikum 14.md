# 🚀 Praktikum Deploy Backend Railway + Frontend Vercel

## Backend Golang Fiber + PostgreSQL dan Frontend React Vite

<p align="center">
  <img width="360" height="160" alt="Railway" src="https://railway.com/brand/logo-light.png" />
</p>

<p align="center">
  <img width="300" height="120" alt="Vercel" src="https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png" />
</p>

---

## 🎯 Pendahuluan

Pada praktikum ini kita akan melakukan deploy aplikasi fullstack sederhana yang terdiri dari:

- **Backend** menggunakan **Golang Fiber**, **GORM**, **JWT**, **Swagger**, dan **PostgreSQL**.
- **Frontend** menggunakan **React Vite**.
- **Backend** akan dideploy ke **Railway**.
- **Frontend** akan dideploy ke **Vercel**.

Setelah praktikum selesai, mahasiswa diharapkan dapat memahami alur deploy aplikasi fullstack, mulai dari menyiapkan repository GitHub, mengatur environment variable, melakukan deploy backend, menghubungkan frontend ke backend production, hingga mengatasi masalah CORS dan routing pada Vercel.

---

## 🧠 Gambaran Alur Praktikum

Alur praktikum ini adalah sebagai berikut:

```txt
Frontend Local / Vercel
        |
        | request API
        v
Backend Railway
        |
        | koneksi database
        v
PostgreSQL / Supabase PostgreSQL
```

Urutannya:

1. Siapkan backend dan pastikan sudah menggunakan PostgreSQL.
2. Push backend ke GitHub.
3. Deploy backend ke Railway.
4. Ambil domain backend Railway.
5. Tes backend melalui browser atau Swagger.
6. Ubah base URL frontend agar mengarah ke backend Railway.
7. Push frontend ke GitHub.
8. Deploy frontend ke Vercel.
9. Tambahkan domain Vercel ke CORS backend.
10. Tes login dan fitur aplikasi melalui URL Vercel.

---

# BAGIAN 1 — Persiapan Backend

## 1. Pastikan Project Backend Sudah Berjalan di Local

Sebelum deploy ke Railway, pastikan backend dapat berjalan di local.

Jalankan perintah berikut:

```bash
go mod tidy
go run main.go
```

Jika berhasil, backend biasanya berjalan pada:

```txt
http://localhost:3000
```

Kemudian coba buka Swagger:

```txt
http://localhost:3000/docs/index.html
```

atau:

```txt
http://localhost:3000/docs/
```

---

## 2. Environment Backend

Backend pada contoh ini menggunakan PostgreSQL. Pada project `be_latihan`, konfigurasi database membaca environment variable berikut:

```env
SUPABASE_DSN=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
JWT_SECRET=isi_secret_jwt_kalian
```

Keterangan:

| Variable | Keterangan |
|---|---|
| `SUPABASE_DSN` | Connection string PostgreSQL. Bisa dari Supabase PostgreSQL atau PostgreSQL lain. |
| `JWT_SECRET` | Secret key untuk generate dan validasi JWT. |

> ⚠️ Jangan upload file `.env` ke GitHub. File `.env` berisi data sensitif seperti password database dan JWT secret.

Pastikan `.gitignore` sudah berisi:

```gitignore
.env
```

Jika file `.env` sudah terlanjur ter-push ke GitHub, sebaiknya hapus dari repository dan ganti password database atau JWT secret yang sudah pernah terlihat.

---

# BAGIAN 2 — Deploy Backend ke Railway

## 1. Masuk ke Railway

Buka Railway dan login menggunakan akun GitHub.

Setelah login, klik **New Project**.

![Buat Project Railway](./Railway/buat_project.png)

---

## 2. Tambahkan Repository GitHub

Pilih menu untuk menambahkan repository dari GitHub.

![Tambahkan GitHub Repository](./Railway/tambahkan_github_repository.png)

Jika repository belum muncul, pilih **Configure GitHub App** atau sambungkan GitHub terlebih dahulu.

![Tambahkan GitHub Repository 2](./Railway/tambahkan_github_repository2.png)

---

## 3. Pilih Repository Backend

Pilih repository backend, misalnya:

```txt
be_latihan
```

![Pilih Repository Railway](./Railway/pilih_repository.png)

Pastikan repository yang dipilih adalah repository backend, bukan frontend.

---

## 4. Deploy Backend

Masuk ke menu **Variables** pada service backend Railway.

![Isi Variables Railway](./Railway/isi_variables.png)

Tambahkan environment variable berikut:

| Variable | Contoh Isi | Keterangan |
|---|---|---|
| `SUPABASE_DSN` | `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require` | Connection string PostgreSQL. |
| `JWT_SECRET` | `isi_secret_jwt_kalian` | Secret JWT. |

Jika sudah, lalu klik tombol **Deploy**.

![Deploy Backend](./Railway/deploy_be.png)

Tunggu sampai proses deploy selesai.

![Tunggu Deploy Railway](./Railway/tunggu_deploy.png)

Jika berhasil, status deploy akan menjadi sukses.

![Deploy Berhasil Railway](./Railway/deploy_berhasil.png)

---

## 5. Generate Domain Railway

Agar backend dapat diakses dari internet, kita perlu membuat public domain.

Masuk ke bagian **Settings** atau **Networking**, kemudian pilih **Generate Domain**.

![Generate Domain Railway](./Railway/generate_domain.png)

Sesuaikan dengan port backend.

![Masukkan Port Railway](./Railway/masukkan_port.png)

Setelah domain berhasil dibuat, Railway akan menampilkan URL backend.

![Hasil Domain Railway](./Railway/hasil_domain.png)

Contoh domain:

```txt
https://belatihan-production.up.railway.app
```
---

## 6. Konfigurasi Swagger dan CORS Backend

Masuk ke file **main.go**

import package `docs`

```go
"be_latihan/docs"
```

Kemudian tambahkan kode berikut di dalam function main (di bawah fungsi logger)

```go
// Swagger host configuration
swaggerHost := os.Getenv("SWAGGER_HOST")
if swaggerHost == "" {
  swaggerHost = "127.0.0.1:3000"
}

docs.SwaggerInfo.Host = swaggerHost
```

Masuk ke file **cors.go**. Lalu tambahkan url hasil deploy kalian seperti di bawah.

![Tambahkan Link Deploy di CORS Railway](./Railway/tambahkan_link_deploy_di_cors.png)

Lakukan push ke Github untuk project backendnya.

Masuk ke Railway, tambahkan variabel SWAGGER_HOST seperti berikut:

![Variables Swagger](./Railway/variables_swagger.png)

> Catatan: untuk link di atas sesuaikan dengan hasil link deploy kalian masing-masing

Setelah environment variable diisi, lakukan deploy kembali.

Tunggu sampai deploy selesai dan statusnya sukses.

## 7. Tes Backend Railway

Buka domain Railway kalian:

```txt
https://domain-railway-kalian.up.railway.app
```

Jika backend aktif, biasanya akan muncul response seperti:

```json
{
  "message": "API be_latihan aktif"
}
```

Kemudian buka Swagger:

```txt
https://domain-railway-kalian.up.railway.app/docs/index.html
```

atau:

```txt
https://domain-railway-kalian.up.railway.app/docs/
```

Jika Swagger berhasil terbuka, backend sudah siap digunakan oleh frontend.

---

# BAGIAN 3 — Persiapan Frontend

## 1. Pastikan Frontend Berjalan di Local

Masuk ke folder frontend, kemudian jalankan:

```bash
npm install
npm run dev
```

Biasanya frontend akan berjalan pada:

```txt
http://localhost:5173
```

---

## 2. Gunakan Environment Variable untuk Base URL API

Ubah file `.env` frontend:

```env
VITE_API_BASE_URL=https://belatihan-production.up.railway.app/api
VITE_API_TIMEOUT=10000
```

Keterangan:

| Variable | Keterangan |
|---|---|
| `VITE_API_BASE_URL` | Base URL backend Railway. |
| `VITE_API_TIMEOUT` | Timeout request API. |

Pastikan base URL tidak lagi mengarah ke localhost.

![Ubah Base URL Frontend](./Vercel/ubah_baseurl_frontend.png)

---

## 3. Tambahkan `vercel.json` untuk React Router

Jika frontend menggunakan React Router, halaman bisa mengalami error **404 Not Found** ketika di-refresh pada route tertentu.

Solusinya, tambahkan file `vercel.json` di root project frontend.

![Tambah Vercel JSON](./Vercel/tambah_vercel_json.png)

Isi file `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. Push Perubahan Frontend ke GitHub

Setelah mengubah `.env.example`, konfigurasi Axios, atau `vercel.json`, push perubahan ke repository frontend.

```bash
git add .
git commit -m "setup deploy vercel"
git push origin main
```

> ⚠️ File `.env` sebaiknya tidak di-push.

---

# BAGIAN 4 — Deploy Frontend ke Vercel

## 1. Masuk ke Vercel

Buka Vercel dan login menggunakan GitHub. Jika baru punya akun pilih plan berikut agar tidak ada biaya

![Vercel Awal](./Vercel/Vercel1.png)

Jika sudah melakukan setup. Selanjutnya klik **Add New Project** atau **New Project**.

![Buat Project Vercel](./Vercel/buat_project.png)

---

## 2. Pastikan GitHub Sudah Terhubung

Pastikan akun Vercel sudah terkoneksi dengan GitHub.

![Pastikan Connect GitHub](./Vercel/pastikan_connect_github.png)

Jika belum, izinkan Vercel untuk membaca repository GitHub kalian.

---

## 3. Pilih Repository Frontend

Pilih repository frontend, misalnya:

```txt
my-fe
```

![Pilih Repo Vercel](./Vercel/pilih_repo.png)

Pastikan yang dipilih adalah repository frontend React Vite, bukan backend.

---

## 4. Isi Build Settings

Pada bagian build settings, sesuaikan seperti berikut:

![Isi Bagian Build Vercel](./Vercel/isi_bagian_build.png)

| Setting | Isi |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## 5. Isi Environment Variable di Vercel

Pada bagian **Environment Variables**, masukkan variable berikut:

![Isi ENV Vercel](./Vercel/isi_env.png)

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://domain-backend-railway-kalian.up.railway.app/api` |
| `VITE_API_TIMEOUT` | `10000` |

Contoh:

```txt
VITE_API_BASE_URL=https://belatihan-production.up.railway.app/api
VITE_API_TIMEOUT=10000
```

> Pastikan base URL backend menggunakan `https://` dan tidak mengarah ke `localhost`.

---

## 6. Deploy Frontend

Klik **Deploy**.

Tunggu proses build dan deploy selesai.

![Tunggu Deploy Vercel](./Vercel/tunggu_deploy.png)

Jika berhasil, Vercel akan menampilkan status deploy sukses.

![Deploy Berhasil Vercel](./Vercel/deploy_berhasil.png)

Lanjutkan ke dashboard project.

![Lanjut Dashboard Vercel](./Vercel/lanjut_dashboard.png)

---

## 7. Ambil URL Frontend Vercel

Setelah deploy berhasil, Vercel akan memberikan URL frontend.

![URL Frontend Vercel](./Vercel/url_fe.png)

Contoh URL:

```txt
https://my-fe-ten.vercel.app
```

URL ini harus ditambahkan ke CORS backend.

---

# BAGIAN 5 — Menghubungkan Frontend Vercel ke Backend Railway

## 1. Tambahkan URL Vercel ke CORS Backend

Buka file CORS backend, misalnya:

```txt
config/cors.go
```

Tambahkan URL frontend Vercel.

![Tambah URL CORS](./Vercel/tambah_url_cors.png)

Contoh:

```go
package config

var allowedOrigins = []string{
	"http://localhost:5173",
	"http://localhost:5174",
	"https://my-fe-ten.vercel.app",
}

func GetAllowedOrigins() []string {
	return allowedOrigins
}
```

Kemudian push perubahan backend:

```bash
git add .
git commit -m "add vercel domain to cors"
git push origin main
```

Railway akan melakukan deploy ulang secara otomatis jika repository sudah terhubung dengan GitHub.

Jika deploy tidak otomatis, lakukan redeploy manual dari dashboard Railway.

---

## 2. Tes Login dari Frontend Vercel

Buka URL Vercel kalian, kemudian coba login.

![Halaman Login](./Vercel/login.png)

Jika berhasil login dan data dari backend muncul, artinya frontend Vercel sudah berhasil terhubung ke backend Railway.

![Login Berhasil](./Vercel/login_berhasil.png)

---
# 📌 Penutup

Pada praktikum ini, kalian sudah mempelajari proses deploy aplikasi fullstack dengan backend Golang Fiber di Railway dan frontend React Vite di Vercel. Selain deploy, kalian juga belajar mengatur environment variable, menghubungkan frontend ke backend production, memperbaiki CORS, mengatur Swagger production, dan mengatasi routing error pada Vercel.

Dengan memahami alur ini, kalian dapat menerapkan konsep yang sama untuk project tugas besar atau aplikasi lain yang memiliki backend, frontend, dan database.

---

© 2026 - Praktikum Pemrograman III

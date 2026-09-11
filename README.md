# SIPARS (Sistem Informasi Pengarsipan)

**Dinas Komunikasi dan Informatika Kabupaten Deiyai**

SIPARS adalah aplikasi web pengelolaan arsip digital responsif berbasis **Tailwind CSS**, **Alpine.js**, **SweetAlert2**, dan **Chart.js**.

---

## 📁 Struktur File & Halaman

| File                               | Deskripsi                                                                                      |
| :--------------------------------- | :--------------------------------------------------------------------------------------------- |
| [`index.html`](file:///index.html) | **Halaman Utama / Login & Registrasi** (Portal autentikasi dengan role switcher & quick-fill). |
| [`admin.html`](file:///admin.html) | **Dashboard & Pengelolaan Arsip** (Sistem manajemen arsip, peminjaman, pengguna, dan laporan). |
| [`arsip.js`](file:///arsip.js)     | Logika aplikasi, state reactive Alpine.js, sinkronisasi `localStorage`, dan filter data.       |
| [`style.css`](file:///style.css)   | Desain glassmorphism, variabel warna, animasi, dan tema (Dark / Light Mode).                   |

---

## 👥 Kredensial Pengujian (Default)

| Role                    | Email                    | Password       | Hak Akses                                                         |
| :---------------------- | :----------------------- | :------------- | :---------------------------------------------------------------- |
| 👑 **Admin Utama**      | `admin@kominfo.go.id`    | `Admin@123`    | Akses penuh ke semua fitur, audit log, dan manajemen user.        |
| ⚙️ **Operator Kominfo** | `operator@kominfo.go.id` | `Operator@123` | Mengelola, verifikasi, dan publikasikan dokumen arsip.            |
| 👤 **User Unit**        | `user@deiyai.go.id`      | `User@123`     | Melihat dokumen publik dan membuat permintaan peminjaman.         |
| 👁️ **Viewer**           | `viewer@deiyai.go.id`    | `Viewer@123`   | Akses baca saja (_read-only_) untuk dokumen yang telah disetujui. |

---

## 🚀 Cara Menjalankan

1. Buka folder proyek di browser lokal atau jalankan live server (misal VS Code Live Server).
2. Akses halaman awal di [`index.html`](file:///index.html).
3. Pilih salah satu role atau klik pada daftar akun default untuk mengisi otomatis form login.
4. Klik **Masuk ke SIPARS** untuk masuk ke dashboard [`admin.html`](file:///admin.html).

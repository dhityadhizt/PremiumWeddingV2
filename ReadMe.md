# 💍 Digital Wedding Invitation & Live Photo Sharing

Website undangan pernikahan digital yang responsif, dilengkapi dengan fitur **RSVP / Ucapan Doa** serta **Live Photo Sharing** (kamera langsung untuk tamu undangan) yang terintegrasi secara *real-time* dengan Google Drive dan Google Sheets.

---

## ✨ Fitur Utama
- **📸 Live Photo Sharing**: Tamu dapat mengambil foto langsung dari browser (mendukung kamera depan/belakang, format PNG *lossless*, *preview*, dan otomatis tampil di galeri undangan).
- **💌 Ucapan & Doa (RSVP)**: Tamu dapat mengirimkan konfirmasi kehadiran dan pesan ucapan secara langsung.
- **☁️ Integrasi Google Workspace**: Foto tersimpan otomatis di **Google Drive**, sementara log foto dan data ucapan tercatat rapi di **Google Sheets**.
- **📱 Desain Responsif & Interaktif**: Tampilan optimal di berbagai ukuran layar dengan animasi halus (*AOS*).

---

## 🛠️ Teknologi yang Digunakan
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=google&logoColor=white)
![Google Sheets & Drive](https://img.shields.io/badge/Google%20Workspace-34A853?style=flat&logo=googlesheets&logoColor=white)
![AOS](https://img.shields.io/badge/AOS-Animate%20On%20Scroll-38B2AC?style=flat)

---

## 📂 Struktur File Penting
Berikut adalah komponen utama dalam proyek ini yang mengelola data, galeri, dan backend:
- **`Code.gs`**: Script backend Google Apps Script untuk menangani unggahan foto PNG ke Google Drive, mencatat log foto ke Spreadsheet, serta menyimpan/mengambil data Ucapan & Doa.
- **`src/assets/data/data.js`**: Pusat konfigurasi data undangan (nama pengantin, jadwal, lokasi, tautan, dan endpoint API).
- **`src/services/galleryService.js`**: Service JavaScript untuk mengambil dan mengunggah foto secara *real-time*.
- **`src/js/galeri.js` & `src/css/galeri.css`**: Antarmuka (*UI*) dan logika Live Camera serta *carousel* galeri.

---

## 🚀 Panduan Instalasi & Konfigurasi

### Langkah 1: Persiapan Proyek & Kustomisasi Konten
1. **Unduh atau kloning repositori proyek**:
   ```bash
   git clone https://github.com/sandiperdiansah/wedding-invitation.git
   ```
2. **Sesuaikan data undangan** melalui file `src/assets/data/data.js`:
   - **Detail Acara**: Ubah nama pengantin, tanggal, waktu, dan alamat lengkap acara.
   - **Tautan Kalender & Peta**:
     - 📅 *Google Calendar*: Buat acara di Google Calendar, simpan, lalu salin tautan berbaginya (*Share link*).
     - 📍 *Google Maps*: Masukkan URL lokasi acara dari Google Maps.
   - **Media (Galeri & Audio)**: Ganti foto galeri bawaan (bisa lebih dari 5 gambar) dan file audio latar. Pastikan ukuran file sudah dioptimalkan agar website tetap ringan saat dimuat.

---

### Langkah 2: Setup Google Drive & Google Sheets
1. **Siapkan Folder Google Drive**:
   - Buat folder baru di Google Drive untuk menampung foto tamu, lalu salin **Folder ID**-nya dari URL browser (contoh: `10VPVOU3KRLyrHAyxUUFLO67C68ICidWm`).
2. **Buat Google Spreadsheet**:
   - Buka [Google Sheets](https://sheets.google.com) dan buat file spreadsheet baru.
   - Buat **2 tab sheet** di bagian bawah dengan struktur kolom (baris ke-1 / `A1:F1`) persis seperti berikut:

   **Tab 1: `Ucapan`** *(untuk data RSVP & pesan)*
   | A | B | C | D | E | F |
   | :--- | :--- | :--- | :--- | :--- | :--- |
   | `id` | `name` | `status` | `message` | `date` | `color` |

   **Tab 2: `LiveGaleri`** *(untuk log foto tamu)*
   | A | B | C | D | E | F |
   | :--- | :--- | :--- | :--- | :--- | :--- |
   | `ID` | `Waktu` | `Nama Tamu` | `Nama File` | `Image URL` | `Drive Link` |

---

### Langkah 3: Setup & Deploy Google Apps Script
1. Di dalam Google Spreadsheet tadi, klik menu **Ekstensi (Extensions) > Apps Script**.
2. Hapus seluruh kode bawaan di editor, lalu salin-tempel seluruh isi dari file **`Code.gs`** proyek Anda.
3. Pastikan variabel ID folder di dalam kode sudah sesuai dengan Folder ID Google Drive Anda:
   ```javascript
   const FOLDER_ID = 'GANTI_DENGAN_FOLDER_ID_DRIVE_ANDA';
   ```
4. Klik ikon **Simpan (Save)** atau tekan `Ctrl + S`.
5. Lakukan proses **Deploy**:
   - Klik tombol **Terapkan (Deploy) > Deployment baru (New deployment)**.
   - Klik ikon roda gigi di samping *Pilih jenis (Select type)*, lalu pilih **Aplikasi web (Web app)**.
   - Isi konfigurasi deployment:
     - **Deskripsi**: `Wedding Live Gallery & RSVP v1`
     - **Jalankan sebagai (Execute as)**: **Saya (Me)** *(wajib, agar unggahan foto tamu masuk ke akun Drive Anda)*.
     - **Yang memiliki akses (Who has access)**: **Siapa saja (Anyone)** *(wajib, agar tamu dapat mengunggah foto tanpa perlu login Google)*.
   - Klik **Terapkan (Deploy)**.
6. **Otorisasi Izin**:
   - Jika muncul jendela *Otorisasi akses (Authorize access)*, pilih akun Google Anda $\rightarrow$ klik **Lanjutan (Advanced)** $\rightarrow$ klik **Buka ... (tidak aman)** $\rightarrow$ klik **Izinkan (Allow)**.
7. **Salin URL Aplikasi Web** yang muncul (berformat `https://script.google.com/macros/s/...../exec`).

> 💡 **Catatan**: Jika terjadi kendala *cross-origin* (CORS) saat pengujian pertama kali, silakan lakukan *Deploy ulang* (*New deployment*) dan gunakan URL terbaru.

---

### Langkah 4: Menghubungkan API ke Website & Publikasi
1. Buka kembali file `src/assets/data/data.js`.
2. Tempelkan URL Web App yang sudah disalin pada properti `api`:
   ```javascript
   api: 'https://script.google.com/macros/s/URL_WEB_APP_ANDA/exec',
   ```
3. Unggah (*push*) seluruh proyek ke repositori **GitHub** Anda dan aktifkan **GitHub Pages** untuk menayangkan undangan secara online.

---

## 🎨 Penghargaan Desain
Proyek ini merupakan pengembangan dan redesain dari template undangan pernikahan karya [Dewanakl](https://github.com/dewanakl), dengan penyesuaian tata letak, estetika, serta penambahan fitur *Live Photo Sharing*.

---

Terima kasih telah menggunakan proyek ini. Semoga hari pernikahan Anda berjalan lancar dan penuh kebahagiaan! 😊
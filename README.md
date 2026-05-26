# 3 Berlian POS Penyewaan Kostum

Aplikasi POS untuk Sanggar Seni 3 Berlian. Fokus utama aplikasi ini adalah membantu kasir dan admin mengelola penyewaan kostum, pengembalian barang, inventaris, pelanggan, dan laporan operasional.

Project ini dibangun dengan React, Vite, Firebase/Firestore, Tailwind CSS, lucide-react, dan PWA.

## Fitur Utama

- Dashboard kasir dengan KPI, omzet, transaksi terakhir, pengembalian prioritas, produk terlaris, dan stok menipis.
- Halaman sewa bergaya POS dengan katalog produk, kategori, pencarian, keranjang sticky, checkout cepat, metode pembayaran, deposit, dan nota.
- Workflow pengembalian dengan kondisi barang, denda keterlambatan, biaya laundry/rusak/hilang, dan catatan pengembalian.
- Manajemen produk/inventaris dengan SKU, kategori, ukuran, warna, status, foto, stok, harga sewa, dan denda harian.
- Data pelanggan dengan riwayat transaksi, kontak, alamat, identitas, catatan, dan deposit.
- Laporan transaksi dengan filter, ringkasan omzet, metode pembayaran, pelanggan aktif, produk terlaris, export Excel/PDF, dan print.
- PWA installable dengan manifest aplikasi.
- Mode demo lokal untuk mengecek UI saat Firebase belum bisa dimuat.

## Struktur Project

```txt
src/
  App.jsx
  main.jsx
  index.css
  components/
    dashboard/
    layout/
  config/
    navigation.js
  utils/
    format.js
    invoice.js
    product.js
scripts/
  build-safe.mjs
  ui-audit-cdp.mjs
public/
  assets/
    branding/
```

Catatan: beberapa halaman besar masih berada di `src/App.jsx` dan sedang direfactor bertahap agar tidak merusak alur data lama.

## Menjalankan Aplikasi

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Build produksi:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Akun Default

Jika database masih kosong, aplikasi akan menampilkan tombol inisialisasi sistem.

```txt
Admin
username: admin
password: 12345

Kasir
username: kasir
password: 12345
```

## Firebase

Aplikasi memakai Firebase Auth dan Firestore. Agar login cloud berjalan, pastikan:

- Anonymous Authentication aktif di Firebase Authentication.
- Firestore Rules mengizinkan akses baca/tulis ke path data aplikasi.
- Koleksi data `products`, `customers`, `transactions`, dan `users` bisa dibaca.

Jika Firebase lambat atau gagal memberi respons, layar login akan menampilkan pesan error dan tombol `Gunakan Mode Demo Lokal`.

## Mode Demo Lokal

Mode demo lokal dipakai untuk mengecek UI/UX ketika Firebase belum siap. Mode ini memuat data produk dan user default dari kode aplikasi, tetapi tidak menggantikan integrasi cloud untuk operasional produksi.

## Catatan Build

Build memakai `scripts/build-safe.mjs` agar proses build tidak terganggu file sementara, folder audit, atau output lama.

Folder yang diabaikan saat build aman:

- `.git`
- `.sixth`
- `dist`

## Status Pengembangan

Sudah dilakukan:

- Perapihan layout global.
- Ekstraksi komponen layout.
- Ekstraksi sebagian komponen dashboard.
- Normalisasi data produk agar field lama dan baru tetap kompatibel.
- Perbaikan format invoice `INV-YYYYMMDD-XXXX`.
- Perbaikan PWA manifest.
- Timeout dan fallback ketika Firebase gagal memuat data.

Prioritas berikutnya:

- Stabilkan Firebase Auth dan Firestore Rules.
- Pecah halaman besar dari `App.jsx` ke folder `pages/`.
- Tambahkan komponen POS terpisah seperti `ProductCatalog`, `RentalCart`, dan `CheckoutPanel`.
- Uji alur end-to-end: login, sewa, cetak nota, pengembalian, laporan.


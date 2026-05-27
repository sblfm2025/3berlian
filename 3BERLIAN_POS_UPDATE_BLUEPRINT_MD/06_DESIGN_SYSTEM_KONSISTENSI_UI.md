# 06 — Design System dan Konsistensi UI 3 Berlian POS

## Tujuan
Membuat standar visual agar aplikasi tidak terasa campur antara dashboard, POS, dan admin panel. Dokumen ini menjaga konsistensi warna, tombol, kartu, spacing, typography, dan istilah.

## Arah visual
Brand utama aplikasi adalah biru + aksen hijau.

Pembagian fungsi warna:
- Biru: navigasi, brand, state aktif utama.
- Hijau: aksi sukses, konfirmasi, status siap, POS action.
- Orange/kuning: perhatian, warning, booking/agenda.
- Merah: terlambat, error, rusak/hilang, blokir.
- Slate/dark: teks utama, tombol sekunder kuat.

## Hindari konflik warna
Masalah saat ini: biru dan hijau sama-sama dominan.

Rules:
- Header dan navigasi: biru.
- Tombol transaksi utama di halaman sewa/pengembalian: hijau atau biru, pilih satu per konteks.
- Jangan memakai gradient besar terlalu sering.
- Gradient hanya untuk hero/ringkasan penting, bukan semua card.

## Typography
Mobile:
- Page title: 18–22px.
- Section title: 13–15px uppercase letter-spacing.
- Body: 13–15px.
- Label kecil: 11–12px.

Desktop:
- Page title: 24–32px.
- Section title: 14–16px.
- Body: 14–16px.

Rules:
- Jangan gunakan uppercase terlalu banyak.
- Nama produk maksimal 2 baris.
- Label teknis jangan lebih dominan dari data utama.

## Spacing
Mobile:
- Page padding: 14–16px.
- Card padding: 12–16px.
- Gap antar card: 10–14px.
- Bottom safe area wajib memperhitungkan bottom nav.

Desktop:
- Page padding: 24–32px.
- Card padding: 20–24px.
- Gap grid: 16–24px.

## Card system
Jenis card:
1. Summary card.
2. Action card.
3. Product card.
4. Detail card.
5. Warning card.
6. Empty state card.

Rules:
- Jangan semua elemen dijadikan card besar.
- Card mobile harus hemat tinggi.
- Card dashboard boleh besar, card POS harus compact.

## Button system
Tinggi minimal:
- Mobile primary: 44–48px.
- Mobile icon button: 40–44px.
- Desktop primary: 40–48px.

Jenis tombol:
- Primary: aksi utama halaman.
- Secondary: aksi pendukung.
- Ghost: navigasi ringan.
- Danger: pembatalan/hapus.
- Warning: aksi butuh perhatian.

Rules:
- Satu layar hanya punya satu primary paling dominan.
- Tombol disabled harus jelas alasan disabled-nya.

## Bottom navigation mobile
Bottom nav sekarang sudah baik.

Rules:
- Tombol tengah `Sewa` boleh tetap dominan.
- Pastikan sticky cart tidak menutupi bottom nav.
- Safe area iOS/Android harus dihitung.

CSS rekomendasi:
```css
.mobile-safe-bottom {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}
```

## Istilah standar aplikasi
Gunakan istilah konsisten:

| Gunakan | Hindari jika tidak perlu |
|---|---|
| Sewa | Rental, transaksi baru |
| Booking | Pemesanan awal |
| Nota | Invoice/ID transaksi campur-campur |
| Pengembalian | Return |
| Denda | Biaya terlambat |
| Biaya kondisi | Biaya rusak/laundry/hilang |
| Pelanggan | Customer |
| Kostum | Produk/barang jika konteksnya user-facing |

Developer boleh tetap memakai istilah teknis di kode, tetapi UI harus konsisten.

## Badge status
Standar badge:
- `SIAP DISEWA` hijau.
- `DISEWA` biru/slate.
- `TERLAMBAT` merah.
- `BOOKING` kuning/orange.
- `LAUNDRY` orange.
- `RUSAK` merah.
- `DIBLOKIR` merah gelap.

## Empty state
Jangan tampilkan teks kosong yang kaku.

Contoh baik:
```txt
Belum ada agenda hari ini
Booking dan sewa aktif pada tanggal ini akan tampil di sini.
```

## Loading state
Karena aplikasi memakai Firebase, loading harus terasa ringan.

Rules:
- Gunakan skeleton untuk list produk/pelanggan/nota.
- Hindari spinner besar terlalu lama.
- Jika data lambat, tampilkan pesan `Memuat data toko...`.
- Jika offline, tampilkan status offline dan data terakhir jika tersedia.

## Aksesibilitas
Wajib:
- Kontras teks cukup.
- Tombol minimal 44px.
- Focus state jelas untuk keyboard desktop.
- Jangan hanya mengandalkan warna untuk status; tetap pakai label teks.

## Definisi selesai
UI dianggap konsisten jika:
- Warna punya fungsi jelas.
- Tombol utama tidak berebut dominasi.
- Card POS lebih compact daripada card dashboard.
- Istilah user-facing seragam di semua halaman.

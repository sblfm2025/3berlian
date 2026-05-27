# 05 — Instruksi Teknis Desktop Layout dan Navigasi

## Tujuan
Merapikan pengalaman desktop agar terasa seperti workspace POS profesional: sidebar stabil, konten fokus, panel kanan berguna, dan tidak terlalu banyak elemen visual yang berebut perhatian.

## Prinsip desktop
Desktop boleh menampilkan lebih banyak informasi daripada mobile, tetapi harus tetap berorientasi kerja.

Prioritas visual desktop:
1. Aksi utama halaman.
2. Data kerja aktif.
3. Ringkasan pendukung.
4. Analitik tambahan.

## Sidebar
Sidebar saat ini sudah baik dan profesional.

Perbaikan kecil:
- Pastikan active state sangat jelas.
- Hindari icon terlalu banyak variasi berat visual.
- Tombol keluar di bawah sudah baik.
- Jika layar laptop kecil, sidebar bisa collapse ke icon-only.

Breakpoint:
```txt
>= 1280px: sidebar penuh
1024–1279px: sidebar compact opsional
< 1024px: bottom navigation mobile/tablet
```

## Header status desktop
Status kanan atas seperti hari ini, kasir aktif, status sinkron sudah bagus.

Perbaikan:
- Jangan terlalu besar.
- Status sinkron boleh hijau, tetapi jangan mengalahkan title halaman.
- Jika offline/sinkron gagal, status harus berubah jelas.

## Layout POS desktop
Final:
```txt
[Sidebar]
[Page header]
[Main content 2 columns]
  Left: Catalog/product list
  Right: Checkout panel sticky
```

Proporsi:
- Left: 65–70%.
- Right: 30–35%.
- Max content width: 1440–1560px.

## Masalah kategori chip desktop
Chip kategori yang terlalu banyak membuat halaman terasa berat.

Solusi:
- Tampilkan filter utama pendek.
- Sisanya masuk `Filter lengkap`.
- Tambahkan search filter.

Contoh:
```txt
[Semua] [Paling sering] [Bugis] [Aksesoris] [Anak] [Filter lengkap]
```

## Panel kanan POS
Panel kanan harus selalu berguna.

### Saat kosong
Tampilkan:
```txt
Mulai transaksi
Scan QR/barcode kostum atau pilih produk dari katalog.

Checklist:
- Keranjang belum kosong
- Pelanggan belum dipilih
- Tanggal kembali valid
- Pembayaran belum diisi
```

### Saat ada item
Tampilkan:
- Item cart.
- Total.
- Customer form.
- Payment form.
- Checklist.
- Tombol checkout.

Panel kanan harus sticky agar tidak hilang saat katalog discroll.

## Layout return desktop
Final:
```txt
[Sidebar]
[Header]
[Scan bar]
[Queue summary compact]
[2 columns]
  Left: nota list
  Right: return detail sticky
```

Perbaikan:
- Banner antrean jangan terlalu tinggi.
- Empty state kanan harus informatif.
- Tombol konfirmasi harus selalu terlihat ketika detail dipilih.

## Layout pelanggan desktop
Final:
```txt
[Summary compact]
[2 columns]
  Left: search + customer list
  Right: loyal customers + privacy panel
```

Perbaikan:
- Ringkasan atas maksimal tinggi 120–150px.
- List pelanggan bisa virtualized jika data besar.
- Detail pelanggan di drawer kanan agar tidak pindah halaman.

## Layout booking desktop
Final:
```txt
[Header]
[Calendar + agenda]
[Booking detail drawer/modal]
```

Kalender desktop boleh besar, tetapi harus punya indikator.

## Empty state standar
Setiap halaman wajib punya empty state yang membantu.

Format:
```txt
Judul singkat
Penjelasan 1 kalimat
Aksi utama
Aksi sekunder opsional
```

Contoh return:
```txt
Pilih nota terlebih dahulu
Transaksi aktif akan muncul di panel kiri untuk diproses.
[ Fokus ke scan nota ]
```

## QA desktop
Uji resolusi:
- 1366x768 laptop.
- 1440x900.
- 1920x1080.
- 1280x720.

Cek:
- Tidak ada horizontal scroll.
- Sidebar tidak menutupi konten.
- Panel kanan tidak keluar viewport.
- Tombol checkout/konfirmasi tetap terlihat.

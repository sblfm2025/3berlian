# 03 — Instruksi Teknis Update Pengembalian Fast Mode

## Tujuan
Merapikan halaman `Pengembalian Kostum` agar cepat dipakai kasir saat pelanggan datang mengembalikan barang. Pengembalian harus aman, jelas, dan minim salah klik.

## Masalah saat ini
Berdasarkan screenshot, halaman pengembalian sudah lengkap tetapi terlalu panjang di mobile. Informasi nota, pelanggan, item, kondisi, pembayaran, override denda, catatan, dan ringkasan semua tampil dalam satu alur panjang.

Untuk kasir, alur normal harus jauh lebih cepat:

1. Scan/cari nota.
2. Pilih nota.
3. Cek item.
4. Pilih kondisi.
5. Konfirmasi.

## Mode yang harus dibuat
### 1. Fast Return Mode
Default untuk mobile dan kasir.

Menampilkan:
- Scan/cari nota.
- Daftar prioritas terlambat.
- Detail nota ringkas.
- Item yang dikembalikan.
- Tombol kondisi cepat.
- Ringkasan biaya.
- Konfirmasi.

### 2. Detail/Admin Mode
Untuk admin atau kasus khusus.

Menampilkan:
- Override denda.
- Detail biaya manual.
- Catatan panjang.
- Riwayat perubahan.
- Audit log.

## Layout mobile final
```txt
[Header]
[Scan Nota / QR Unit]
[Jika belum pilih nota: prioritas nota]
[Jika sudah pilih nota: ringkasan nota]
[Checklist item]
[Quick condition actions]
[Ringkasan biaya sticky/compact]
[Konfirmasi]
```

## Scan/cari nota
Input scan harus menjadi fokus utama.

Spesifikasi:
- Placeholder: `Scan nota atau QR kostum`.
- Tombol: `Cari`.
- Jika scan QR unit menemukan nota aktif, otomatis pilih nota.
- Jika hasil lebih dari satu, tampilkan pilihan.

## Daftar prioritas nota
Daftar prioritas sudah bagus. Perbaikan:
- Tampilkan maksimal 3 prioritas di mobile.
- Tambahkan tombol `Lihat semua`.
- Badge terlambat harus konsisten: `Terlambat 32 hari`, bukan hanya `Terlambat 32`.

## Ringkasan nota terpilih
Saat nota dipilih, tampilkan ringkasan compact:

```txt
TRX-021952
Amirah · 1 item · Terlambat 32 hari
Sewa: 24 Apr 2026
Batas kembali: 25 Apr 2026
```

Jangan tampilkan terlalu banyak card besar sebelum item.

## Checklist item
Item dikembalikan harus mudah dicek.

Setiap item:
- Nama produk.
- Quantity kembali.
- Harga sewa.
- Kondisi.
- Biaya kondisi saat ini.

Jika semua item baik, tombol paling dominan:
`Semua Baik & Selesaikan`

## Quick condition actions
Tombol cepat:
- Semua Baik.
- Kotor/Laundry.
- Rusak Ringan.
- Rusak Berat.
- Hilang.

Rules:
- `Semua Baik` mengatur semua item ke baik dan biaya kondisi 0.
- `Kotor/Laundry` menerapkan biaya laundry sesuai aturan produk/default.
- `Rusak/Hilang` harus meminta konfirmasi karena berdampak biaya besar.

## Override denda
Masalah saat ini: override denda langsung terlihat dan bisa membuat kasir salah pakai.

Solusi:
- Masukkan ke accordion tertutup:
  `Atur denda manual / override`.
- Tambahkan teks peringatan: `Gunakan hanya jika ada keputusan admin`.
- Jika user bukan admin, disable atau butuh PIN/konfirmasi admin.

## Breakdown denda
Wajib tampil jika ada denda.

Contoh:
```txt
Denda keterlambatan
32 hari x Rp 5.000 = Rp 160.000
```

Jika ada beberapa item dengan denda berbeda:
```txt
Bando 3 susun: 32 hari x Rp 5.000 = Rp 160.000
Kipas: 32 hari x Rp 2.000 = Rp 64.000
Total denda = Rp 224.000
```

## Ringkasan biaya
Tampilkan sebelum konfirmasi:

```txt
Denda keterlambatan: Rp160.000
Biaya kondisi: Rp0
Deposit dipakai: Rp0
Total tambahan: Rp160.000
Metode bayar: Tunai
```

## Desktop return
Desktop tetap dua kolom:
- Kiri: scan + daftar nota.
- Kanan: detail nota.

Perbaikan:
- Banner status antrean compact.
- Panel kanan empty state berisi instruksi.
- Detail nota kanan sticky agar tombol konfirmasi tidak hilang.

## Validasi data
Pastikan saat konfirmasi:
- Status transaksi berubah sesuai mode return.
- Stok item kembali bertambah hanya untuk item yang benar-benar kembali.
- Jika partial return, transaksi tetap aktif sampai semua item selesai.
- Biaya tambahan tercatat di transaksi dan laporan.
- Audit log dibuat.

## Test case wajib
1. Return tepat waktu, semua item baik.
2. Return terlambat, semua item baik.
3. Return terlambat + laundry.
4. Return rusak ringan.
5. Return hilang.
6. Partial return.
7. Scan nota invalid.
8. Scan QR unit dari item pada nota aktif.
9. Override denda oleh admin.
10. Batalkan proses setelah nota dipilih.

## Definisi selesai
- Kasus normal bisa diselesaikan sangat cepat.
- Denda selalu jelas cara hitungnya.
- Override tidak mengganggu kasir.
- Desktop dan mobile konsisten secara data.

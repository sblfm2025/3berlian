# 07 — Konsistensi UI POS

## Tujuan

Membuat tampilan POS lebih profesional dan konsisten tanpa redesign total.

## Layout final desktop

Gunakan pola 3 kolom:

```txt
Kiri   : Katalog Produk
Tengah : Keranjang / Cart
Kanan  : Pelanggan + Pembayaran + Checkout
```

Rasio:

```txt
lg:grid-cols-[1.4fr_1fr_0.9fr]
```

## Layout final mobile

Gunakan:

- search produk di atas
- katalog produk
- sticky mobile bar cart
- drawer/tab untuk cart, pelanggan, pembayaran

Mobile tab:

```txt
Produk | Cart | Pelanggan | Bayar
```

Semua tab bebas dibuka.

## Prioritas visual

Urutan dominasi visual:

1. Total pembayaran
2. Cart item
3. Tombol checkout
4. Product search
5. Data pelanggan
6. Insight/warning

Jangan membuat insight/warning lebih dominan daripada cart.

## Checklist transaksi

Checklist kecil, bukan panel besar.

Contoh:

```txt
✓ Produk
! Pelanggan
✓ Pembayaran
! Tanggal kembali
```

Posisi:

- desktop: kanan atas CheckoutSummary
- mobile: dalam drawer checkout

## Panel yang perlu disederhanakan

Jika ada panel berikut di RentPage, jadikan collapsible atau kecil:

- statistik kategori
- stok menipis
- tips kasir
- insight operasional
- banner panjang

Halaman kasir bukan dashboard.

## Tombol utama

Hanya satu tombol utama di area checkout:

```txt
Checkout / Simpan Transaksi
```

Tombol lain:

- outline
- ghost
- secondary

## Warna status

Gunakan konsisten:

- hijau: berhasil/lengkap
- kuning: belum lengkap/perhatian
- merah: error/stok habis
- biru: informasi
- abu: nonaktif/void

## Empty state

Cart kosong:

```txt
Keranjang masih kosong.
Pilih produk dari katalog.
```

Produk tidak ditemukan:

```txt
Produk tidak ditemukan.
Coba kata kunci lain.
```

Pembayaran belum siap:

```txt
Tambahkan produk ke keranjang untuk mulai pembayaran.
```

## Error state

Jangan gunakan pesan generik:

```txt
Terjadi kesalahan
```

Gunakan spesifik:

```txt
Stok produk tidak cukup.
Nomor HP pelanggan belum diisi.
QR nota tidak valid.
Transaksi sudah dikembalikan.
```

## Acceptance criteria

- RentPage tidak terasa seperti dashboard.
- Cart dan total pembayaran paling jelas.
- Ukuran/qty/payment mudah ditemukan.
- Tidak ada panel besar yang tidak terkait langsung dengan checkout.
- UI desktop dan mobile memakai pola yang sama.

# VISUAL HIERARCHY SYSTEM

## Objective
Membuat UI tetap informatif seperti superapp tanpa terasa penuh.

## Visual Levels

### Level 1 — Primary
Elemen yang boleh dominan:
- total pembayaran
- tombol checkout/konfirmasi
- transaksi aktif
- overdue penting
- stok kritis

Style:
- warna brand jelas
- shadow medium
- font semibold/bold
- ukuran sedikit lebih besar

### Level 2 — Operational
Elemen operasional utama:
- daftar produk
- daftar pelanggan
- daftar transaksi
- filter aktif

Style:
- flat card
- border subtle
- font medium
- spacing compact

### Level 3 — Supporting
Elemen pendukung:
- tips
- insight
- statistik tambahan
- recent activity

Style:
- subtle
- collapsible bila perlu
- tidak memakai gradient berat

## Anti-Patterns
Hindari:
- semua card memakai gradient
- semua section memakai shadow besar
- semua icon terlalu besar
- semua label uppercase
- semua tombol terlihat primary

## Implementation Rule
Saat refactor sebuah halaman:
1. Tandai 1–2 elemen sebagai Level 1.
2. Turunkan visual weight semua section lain.
3. Jadikan informasi sekunder collapsible jika halaman terlalu panjang.

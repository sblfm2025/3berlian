# UI FOUNDATION

## Objective
Membangun dasar UI/UX global agar aplikasi terasa seperti superapp operational: padat, modern, tetap elegan.

## Current Problems
- Mobile terasa sesak.
- Banyak card terlalu besar.
- Font terlalu dominan.
- Shadow/gradient berlebihan.
- Semua section terasa sama penting.
- Spacing vertikal terlalu boros.

## UX Direction
Target:
- compact elegant
- high-density
- premium
- calm visual hierarchy
- operational, bukan landing page

## Technical Rules

### Typography
Gunakan mobile-first:

```txt
Page title:      text-lg sm:text-xl md:text-2xl
Section title:   text-base sm:text-lg
Card title:      text-sm sm:text-base
Body:            text-xs sm:text-sm
Label:           text-[10px] sm:text-[11px]
```

Replace:
```txt
text-2xl -> text-lg sm:text-2xl
text-xl  -> text-base sm:text-xl
text-lg  -> text-sm sm:text-lg
font-black -> font-bold / font-semibold
tracking-[0.2em] -> tracking-[0.12em] sm:tracking-[0.18em]
```

### Spacing
Replace:
```txt
p-6 -> p-3 sm:p-6
p-5 -> p-3 sm:p-5
p-4 -> p-3 sm:p-4
gap-6 -> gap-3 sm:gap-6
gap-5 -> gap-3 sm:gap-5
space-y-6 -> space-y-3 sm:space-y-6
```

### Card Style
Replace:
```txt
rounded-[28px] -> rounded-[18px] sm:rounded-[28px]
rounded-3xl -> rounded-2xl
shadow-xl -> shadow-sm / shadow-md
```

### Visual Emphasis
Hanya gunakan visual kuat untuk:
- total pembayaran
- checkout
- overdue
- stok kritis
- error penting

Untuk informasi biasa:
- surface flat
- border subtle
- shadow minimal

## Safe Boundaries
DO NOT:
- mengubah logic transaksi
- mengubah Firebase query
- mengubah perhitungan laporan
- mengubah struktur data

## Expected Result
- Lebih banyak konten tampil per layar.
- Tidak terlihat sempit.
- Tetap premium.
- Visual lebih tenang.

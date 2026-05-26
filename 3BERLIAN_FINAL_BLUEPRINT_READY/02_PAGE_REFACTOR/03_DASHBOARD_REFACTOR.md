# DASHBOARD REFACTOR

## Objective
Mengubah dashboard dari showcase-style menjadi operational dashboard.

## Current Problems
- KPI terlalu besar.
- Terlalu banyak hero card.
- Semua section terlihat sama penting.
- Informasi operasional utama tenggelam.
- Mobile density rendah.

## Scope
ONLY MODIFY:
- `src/pages/DashboardPage.jsx`
- dashboard UI components jika ada

## Files To Avoid
DO NOT MODIFY:
- Firebase services
- metric calculation logic
- authentication
- transaction logic

## Dashboard Priority

### Primary
- transaksi aktif
- pengembalian terlambat
- stok kritis
- pembayaran tertunda

### Secondary
- aktivitas terbaru
- ringkasan pendapatan
- tren sederhana

### Tertiary
- tips
- insight
- pengumuman

## Technical Rules

### KPI Cards
Replace giant KPI with compact metric cards.

Mobile:
```txt
p-3
text-xl for number
text-[11px] for label
rounded-2xl
```

Desktop:
```txt
sm:p-5
sm:text-3xl for main number
```

### Layout
Mobile:
- stacked compact cards
- quick action row
- no giant hero block unless necessary

Desktop:
- 2/3-column grid
- priority panel at top

### Visual Weight
Only overdue/critical stock may use strong color.

Normal metrics:
- calm background
- subtle border
- minimal shadow

## Expected Result
- Dashboard lebih cepat dipindai.
- Lebih banyak informasi terlihat.
- Tidak terasa seperti template landing page.
- Tetap premium.

## QA Checklist
- Semua metrik masih benar.
- Tidak ada data yang hilang.
- Mobile tidak overflow.
- Dashboard load tetap ringan.

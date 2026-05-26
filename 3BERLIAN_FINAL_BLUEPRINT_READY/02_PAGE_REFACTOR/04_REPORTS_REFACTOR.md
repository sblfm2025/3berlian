# REPORTS REFACTOR

## Objective
Membuat halaman laporan lebih mobile-friendly, compact, dan scalable.

## Current Problems
- Reports terlalu desktop-oriented.
- Filter terlalu besar.
- Tabel berat di mobile.
- Card transaksi terlalu panjang.
- Export action kurang ringkas.

## Scope
ONLY MODIFY:
- `src/pages/ReportsPage.jsx`
- report UI components jika ada

## Files To Avoid
DO NOT MODIFY:
- financial calculation logic
- export logic
- transaction mutation logic
- Firebase services

## Technical Rules

### Filter Area
Mobile:
- sticky compact filter bar
- horizontal chips
- advanced filter collapsible

Replace:
```txt
p-5 gap-5 -> p-3 gap-3
text-sm filter labels -> text-xs
```

### Summary Metrics
Use compact summary cards:
```txt
grid-cols-2 mobile
p-3
text-xl number
text-[11px] label
```

### Transaction List
For mobile, avoid heavy table.

Use transaction card:
```txt
invoice/customer
date/status
total/payment method
expand button
```

Details should be expandable:
- items
- payment details
- notes
- edit actions

### Desktop Table
Desktop may keep table but should:
- use compact rows
- avoid oversized cells
- keep actions aligned

## Scalability Note
UI refactor should prepare for future query optimization:
- date range pagination
- monthly filter
- status filter
- lazy detail loading

## Expected Result
- Laporan nyaman di HP.
- Filter tidak memakan ruang.
- Data mudah dipindai.
- Desktop tetap rapi.

## QA Checklist
- Export tetap bekerja.
- Perhitungan laporan tidak berubah.
- Edit/delete transaction tidak rusak.
- Mobile list tidak overflow.

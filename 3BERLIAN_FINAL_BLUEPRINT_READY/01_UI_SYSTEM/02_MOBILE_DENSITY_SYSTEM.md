# MOBILE DENSITY SYSTEM

## Objective
Mengurangi kesan sesak pada mobile tanpa mengorbankan estetika.

## Principle
Jangan mengecilkan semuanya secara brutal. Yang dilakukan adalah:
- atur prioritas visual
- kecilkan elemen sekunder
- pertahankan aksi utama tetap jelas
- ubah giant cards menjadi compact tiles

## Viewport Rules

### Mobile `<640px`
Target:
- compact layout
- lebih banyak data per layar
- touch tetap nyaman
- minimal scrolling

### Tablet `640px–1024px`
Target:
- 2-column jika memungkinkan
- spacing sedang
- tidak terlalu kosong

### Desktop `>1024px`
Target:
- split layout
- sidebar stabil
- dashboard grid matang

## Exact Replace Rules

### Typography
```txt
text-2xl -> text-lg sm:text-2xl
text-xl -> text-base sm:text-xl
text-lg -> text-sm sm:text-lg
```

### Buttons
```txt
py-4 -> py-2.5 sm:py-4
px-5 -> px-3 sm:px-5
text-lg -> text-sm sm:text-base
```

### Chips/Filters
```txt
px-4 py-2 text-sm -> px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
```

### KPI Cards
```txt
p-5 text-3xl -> p-3 sm:p-5 text-xl sm:text-3xl
```

### Product Tile
Target:
- image 56x56
- card height 72–88px
- product name max 2 lines
- metadata compact
- add button compact but tappable

## Density Targets
- RentPage: minimal 4 produk terlihat per layar mobile.
- Dashboard: minimal 3–4 KPI ringkas terlihat tanpa scroll panjang.
- ReturnPage: minimal 3 nota aktif terlihat.
- ReportsPage: filter tidak boleh memakan setengah layar.

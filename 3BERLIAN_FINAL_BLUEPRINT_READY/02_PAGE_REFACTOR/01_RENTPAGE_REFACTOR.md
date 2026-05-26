# RENTPAGE REFACTOR — COMPACT PREMIUM POS

## Objective
Mengubah RentPage menjadi halaman POS operasional yang ringkas, cepat, dan tetap premium.

## Current Problems
- Product cards terlalu besar.
- Semua informasi tampil bersamaan.
- Cart/checkout belum cukup dominan.
- Mobile scroll terlalu panjang.
- Font dan padding terlalu besar.
- Secondary sections terlalu mengganggu.

## Scope
ONLY MODIFY:
- `src/pages/RentPage.jsx`

Jika sudah ada komponen terpisah, boleh modify:
- komponen product card terkait
- komponen cart terkait
- komponen filter terkait

## Files To Avoid
DO NOT MODIFY:
- `src/services/firestoreData.js`
- Firebase config
- stock calculation logic
- checkout business logic
- collection names
- login/account logic

## Priority UX Order
1. Cart active transaction
2. Product search
3. Product list
4. Checkout action
5. Customer selection
6. Secondary info

## Step-by-Step Implementation

### Step 1 — Typography Cleanup
Replace:
```txt
text-2xl -> text-lg sm:text-2xl
text-xl -> text-base sm:text-xl
text-lg -> text-sm sm:text-lg
font-black -> font-semibold / font-bold
```

Target:
- title tetap jelas
- label dan subtitle lebih kecil
- tombol tidak terasa berteriak

### Step 2 — Product Tile Conversion
Convert vertical product card into compact horizontal tile.

Tile structure:
```txt
[56x56 image] [name/category/stock/price] [add button]
```

Rules:
```txt
image: w-14 h-14
card: p-3 rounded-2xl border shadow-sm
title: text-sm font-semibold line-clamp-2
meta: text-[11px] text-muted
button: h-9 w-9 or compact text button
```

Target:
- 4–5 produk terlihat di mobile.
- Product list lebih cepat dipindai.

### Step 3 — Product Filter Compaction
Replace:
```txt
px-4 py-2 text-sm -> px-3 py-1.5 text-xs sm:text-sm
gap-3 -> gap-2 sm:gap-3
```

Filter harus horizontal scroll bila kategori banyak.

### Step 4 — Cart Prioritization
Cart harus menjadi area utama.

Rules:
- total selalu mudah ditemukan
- checkout CTA paling jelas
- item cart compact
- cart summary sticky bila memungkinkan

Mobile recommendation:
- gunakan sticky bottom summary untuk total dan checkout
- detail cart bisa expandable

Desktop recommendation:
- cart sidebar sticky di kanan

### Step 5 — Secondary Sections
Ubah menjadi collapsible:
- low stock
- tips
- quick stats
- recent transactions

Default mobile:
- collapsed

Default desktop:
- boleh expanded jika tidak mengganggu

### Step 6 — Checkout CTA
Primary button:
```txt
py-3 sm:py-4
text-sm sm:text-base
font-semibold
rounded-2xl
```

Jangan memakai:
- text-lg di mobile
- py-5 di mobile
- terlalu banyak icon besar

## Constraints
- Jangan mengubah validasi checkout.
- Jangan mengubah struktur data transaksi.
- Jangan mengubah cara stok dikurangi.
- Jangan mengubah perhitungan total, diskon, deposit, denda.

## Expected Result
- RentPage terasa seperti POS mobile modern.
- Lebih sedikit scroll.
- Cart lebih jelas.
- Product browsing lebih cepat.
- Estetika tetap premium.

## QA Checklist
- Checkout masih berhasil.
- Tambah/hapus item cart masih benar.
- Stok tidak berubah karena UI refactor.
- Tidak ada horizontal overflow.
- Minimal 4 produk terlihat di layar mobile umum.
- Desktop tetap rapi.

# UI/UX Mobile dan Design System

## 1. Arah Visual

Aplikasi harus terasa:
- modern
- premium
- budaya Nusantara
- mudah dipakai
- tidak generik

## 2. Masalah UI Yang Harus Dihindari

- terlalu banyak card tanpa hierarki
- teks terlalu kecil di mobile
- tombol utama sulit dijangkau
- modal terlalu sempit
- tabel tidak nyaman di HP
- warna terlalu ramai
- dashboard hanya cantik tapi tidak membantu kerja

## 3. Mobile First Rules

Wajib:
- tombol minimal 44px
- bottom action bar
- sticky total checkout
- modal fullscreen untuk form panjang
- hindari horizontal scroll
- gunakan stepper untuk alur panjang
- gunakan bottom sheet untuk checkout

## 4. POS Mobile Ideal

Alur:
1. Pilih produk
2. Keranjang
3. Pelanggan
4. Pembayaran
5. Invoice

Gunakan:
- search besar
- filter cepat
- card produk gambar besar
- tombol tambah cepat
- sticky cart summary

## 5. Design System Tokens

Buat file:

```txt
src/styles/tokens.css
src/styles/theme.css
```

Token:
- color
- spacing
- radius
- shadow
- typography
- z-index
- transition

## 6. Typography

Gunakan hierarki:
- page title
- section title
- card title
- body
- caption
- helper text

Jangan semua teks sama besar.

## 7. Component Wajib

```txt
Button
Input
Select
Textarea
Modal
BottomSheet
Toast
Badge
StatusPill
DataTable
EmptyState
LoadingSkeleton
ConfirmDialog
PageHeader
SectionCard
MetricCard
ProductCard
CustomerCard
InvoicePreview
```

## 8. Empty State

Jangan hanya tulis “Data kosong”.

Contoh:
- “Belum ada produk. Tambahkan kostum pertama untuk mulai transaksi.”
- CTA: “Tambah Produk”
- ilustrasi ringan

## 9. Loading State

Gunakan:
- skeleton card
- loading button
- page loader hanya jika perlu
- pesan “Mengambil data terbaru…”

## 10. Brand Direction

Tema:
- hijau elegan
- emas/kuning aksen
- motif kain adat halus
- card putih bersih
- ikon profesional
- foto produk dominan

## 11. Checklist Developer

- [ ] Design token dibuat.
- [ ] Komponen UI reusable dibuat.
- [ ] Mobile checkout dibuat step-based.
- [ ] Bottom action bar tersedia.
- [ ] Empty state diperbaiki.
- [ ] Loading skeleton dibuat.
- [ ] Product card visual diperbaiki.
- [ ] Dashboard punya hierarchy jelas.
- [ ] Tidak ada alert browser standar.

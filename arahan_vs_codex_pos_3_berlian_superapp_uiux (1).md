# ARAHAN FINAL VS/CODEX
# REDESIGN & PENYEMPURNAAN POS PENYEWAAN SANGGAR SENI 3 BERLIAN

# TUJUAN DOKUMEN
Dokumen ini adalah blueprint implementasi untuk developer VS/Codex dalam melakukan redesign dan penyempurnaan aplikasi POS Penyewaan Sanggar Seni 3 Berlian.

Fokus utama:
- redesign UI/UX profesional
- mempertahankan alur data existing
- tidak merusak logika transaksi yang sudah berjalan
- mengubah aplikasi menjadi POS rental profesional modern
- meningkatkan pengalaman penggunaan mobile/tablet/desktop
- membuat aplikasi terasa seperti aplikasi native modern
- mempertahankan identitas budaya lokal

Dokumen ini BUKAN arahan umum desain.
Dokumen ini adalah arahan implementasi berbasis kondisi project existing.

---

# KONDISI PROJECT SAAT INI

## KONDISI EXISTING
Project saat ini masih sangat terpusat di:

src/App.jsx

Semua logic masih berada dalam satu file besar:
- login
- dashboard
- transaksi
- pengembalian
- produk
- pelanggan
- laporan
- firebase
- realtime listener
- state global sederhana
- modal
- navigation

Kondisi ini masih berjalan dengan baik untuk prototype.

JANGAN langsung membongkar total aplikasi.

---

# HAL YANG WAJIB DIPERTAHANKAN

## DATA FLOW
Pertahankan:
- products
- customers
- transactions
- users

Jangan mengganti struktur Firestore secara drastis.

---

# TUJUAN REFACTOR

Tujuan refactor:
- memecah UI menjadi komponen
- memperjelas struktur project
- mempermudah maintenance
- meningkatkan UX
- meningkatkan scalability

BUKAN:
- rewrite total
- mengganti logic utama
- mengubah alur transaksi existing

---

# KONSEP APLIKASI YANG DITUJU

Aplikasi harus terasa seperti:
- POS tablet profesional
- aplikasi Android modern
- aplikasi kasir rental enterprise
- sistem rental kostum modern

Gabungkan:
- modern POS
- clean UI
- budaya lokal
- sistem inventory profesional

---

# KESALAHAN YANG JANGAN DILAKUKAN

Jangan:
- membuat UI terlalu ramai
- terlalu banyak gradient
- shadow keras
- font terlalu besar
- card terlalu padat
- warna terlalu banyak
- animasi berlebihan
- terlalu menyerupai ecommerce

Aplikasi ini adalah:
POS RENTAL
bukan marketplace.

---

# ARAH VISUAL UTAMA

## REFERENSI
Gunakan referensi:
- POS tablet modern
- aplikasi restoran modern
- inventory management modern
- aplikasi rental modern

Layout utama:
- katalog produk
- keranjang sticky
- quick checkout
- dashboard analitik
- mobile bottom navigation

---

# IDENTITAS VISUAL

## BRANDING
Karakter visual:
- elegan
- modern
- profesional
- budaya lokal
- clean
- ringan

---

# WARNA

## PRIMARY
#0D47A1

## PRIMARY HOVER
#1565C0

## BACKGROUND
#F5F7FA

## CARD
#FFFFFF

## BORDER
#E5E7EB

## SUCCESS
#16A34A

## WARNING
#F59E0B

## DANGER
#DC2626

---

# TIPOGRAFI

Gunakan:
- Inter
- Poppins

Jangan gunakan font terlalu besar.

---

# STRATEGI IMPLEMENTASI

## SANGAT PENTING

Jangan redesign sekaligus.

Lakukan bertahap:

1. pecah komponen UI
2. redesign layout
3. upgrade UX
4. optimasi mobile
5. baru refactor logic

---

# TAHAP 1
# REFACTOR STRUKTUR TANPA MENGUBAH LOGIC

## TUJUAN
Memecah App.jsx menjadi komponen.

Jangan ubah logic Firestore dulu.

---

# STRUKTUR BARU

src/
  components/
    layout/
    dashboard/
    rental/
    returns/
    products/
    reports/
    customers/
    ui/
  pages/
  services/
  hooks/
  utils/
  constants/

---

# KOMPONEN YANG WAJIB DIBUAT

## LAYOUT

- Sidebar.jsx
- Topbar.jsx
- MobileBottomNav.jsx
- AppShell.jsx

---

## DASHBOARD

- DashboardPage.jsx
- KpiCard.jsx
- RevenueChart.jsx
- RecentTransactionTable.jsx
- LateReturnCard.jsx
- PopularProducts.jsx

---

## RENTAL

- RentalPage.jsx
- ProductCatalog.jsx
- ProductCard.jsx
- ProductFilters.jsx
- RentalCart.jsx
- CartItem.jsx
- CustomerSelector.jsx
- CheckoutPanel.jsx
- PaymentSummary.jsx
- MobileCartDrawer.jsx

---

## RETURNS

- ReturnPage.jsx
- ReturnSearch.jsx
- ReturnTransactionCard.jsx
- ReturnItemCard.jsx
- ReturnPenaltySummary.jsx

---

## PRODUCTS

- ProductPage.jsx
- ProductTable.jsx
- ProductForm.jsx
- ProductDetailDrawer.jsx

---

## REPORTS

- ReportPage.jsx
- ReportFilterBar.jsx
- RevenueAnalytics.jsx
- ProductAnalytics.jsx
- PaymentAnalytics.jsx

---

# ACCEPTANCE CRITERIA TAHAP 1

Berhasil jika:
- semua fitur existing tetap berjalan
- transaksi tetap bisa dibuat
- pengembalian tetap berjalan
- Firestore listener tetap realtime
- tidak ada perubahan struktur database
- App.jsx menjadi lebih kecil

---

# TAHAP 2
# REDESIGN HALAMAN SEWA

# HALAMAN PALING PENTING

Halaman Sewa adalah pusat aplikasi.

---

# TARGET UX

Harus terasa seperti:
- POS tablet modern
- transaksi cepat
- mudah dipahami kasir
- nyaman di layar sentuh

---

# LAYOUT DESKTOP

## KIRI
70%

Isi:
- search produk
- kategori
- filter
- katalog produk

## KANAN
30%

Isi:
- keranjang
- pelanggan
- subtotal
- pembayaran
- checkout

---

# SEARCH PRODUK

Wajib:
- realtime
- debounce
- cepat
- support keyboard
- sticky top

Search support:
- nama produk
- kode produk
- kategori

---

# FILTER PRODUK

Tambahkan:
- Semua
- Baju Adat
- Kebaya
- Aksesoris
- Anak
- Dewasa
- Pria
- Wanita

Mobile:
- horizontal scroll

---

# KATALOG PRODUK

## DESAIN

Grid:
- desktop 4-5 kolom
- tablet 3 kolom
- mobile 2 kolom

---

# PRODUCT CARD

Wajib menampilkan:
- foto
- nama
- ukuran
- harga sewa
- stok tersedia
- status
- tombol tambah

---

# STATUS PRODUK

Badge:
- tersedia
- hampir habis
- habis
- disewa
- laundry
- maintenance

---

# HOVER DESKTOP

Saat hover:
- shadow naik
- scale 1.02
- tombol tambah muncul

---

# MOBILE UX

Jangan terlalu padat.

Gunakan:
- spacing lega
- touch area besar
- tombol mudah ditekan

---

# KERANJANG

## HARUS STICKY

Keranjang selalu terlihat.

---

# ISI KERANJANG

- item
- qty
- subtotal
- hapus item
- edit qty

---

# PAYMENT PANEL

Tampilkan:
- subtotal
- diskon
- biaya tambahan
- total
- uang diterima
- kembalian

---

# CHECKOUT BUTTON

Harus:
- besar
- biru solid
- sticky bawah
- sangat jelas

Text:
BAYAR & CETAK NOTA

---

# CUSTOMER SELECTOR

Tambahkan:
- autocomplete
- pelanggan lama
- tambah pelanggan cepat
- nomor HP
- alamat
- catatan

---

# MOBILE CHECKOUT

## SANGAT PENTING

Jangan tampilkan keranjang penuh di layar kecil.

Gunakan:
- bottom sheet
- drawer
- floating cart button

---

# ACCEPTANCE CRITERIA HALAMAN SEWA

Berhasil jika:
- transaksi lebih cepat
- UI terasa modern
- nyaman dipakai tablet
- mobile tidak sempit
- checkout tidak tertutup navbar
- keranjang mudah diakses
- search cepat

---

# TAHAP 3
# REDESIGN DASHBOARD

# MASALAH EXISTING

Dashboard sekarang masih terlalu sederhana.
Kurang insight.
Kurang prioritas kerja.

---

# TUJUAN DASHBOARD BARU

Dashboard harus menjadi:
- pusat kontrol bisnis
- pusat aktivitas kasir
- pusat monitoring rental

---

# HEADER DASHBOARD

Tambahkan:
- greeting user
- tanggal realtime
- avatar
- quick action
- notif terlambat

---

# KPI CARD

Minimal:

1. Total Transaksi Hari Ini
2. Omzet Hari Ini
3. Barang Sedang Disewa
4. Pengembalian Terlambat
5. Pendapatan Bulanan
6. Produk Terlaris
7. Total Pelanggan
8. Total Denda

---

# DESAIN KPI CARD

Gunakan:
- rounded 18px
- soft shadow
- icon besar
- angka besar
- trend naik/turun
- hover ringan

---

# CHART

Tambahkan:
- omzet mingguan
- transaksi bulanan
- metode pembayaran
- kategori terlaris

Gunakan:
- recharts

---

# PRIORITAS KERJA

Tambahkan section:
- pengembalian hari ini
- pengembalian terlambat
- stok menipis
- transaksi terbaru

---

# ACCEPTANCE CRITERIA DASHBOARD

Berhasil jika:
- dashboard terasa hidup
- kasir langsung tahu prioritas kerja
- omzet mudah dipantau
- data mudah dibaca
- mobile tetap nyaman

---

# TAHAP 4
# REDESIGN PENGEMBALIAN

# MASALAH EXISTING

Pengembalian masih terlalu sederhana.

Belum terasa seperti workflow rental profesional.

---

# TARGET UX

Workflow:

Cari Nota
↓
Pilih Transaksi
↓
Cek Barang
↓
Pilih Kondisi
↓
Hitung Denda
↓
Selesaikan

---

# DETAIL TRANSAKSI

Tampilkan:
- foto produk
- nama produk
- tanggal sewa
- tanggal kembali
- keterlambatan
- status
- denda

---

# KONDISI BARANG

Tambahkan:
- baik
- kotor
- rusak ringan
- rusak berat
- hilang

---

# BIAYA TAMBAHAN

Tambahkan:
- denda keterlambatan
- laundry
- kerusakan
- kehilangan

---

# SUMMARY PANEL

Tampilkan:
- subtotal
- total denda
- biaya tambahan
- total bayar

---

# ACCEPTANCE CRITERIA PENGEMBALIAN

Berhasil jika:
- workflow lebih jelas
- pengembalian lebih profesional
- kondisi barang bisa dicatat
- denda lebih fleksibel
- mobile tetap nyaman

---

# TAHAP 5
# INVENTORY MODERN

# FIELD PRODUK

Tambahkan:
- kode produk
- kategori
- ukuran
- warna
- gender
- usia
- harga sewa
- denda harian
- stok total
- stok tersedia
- status
- foto
- deskripsi

---

# STATUS INVENTORY

Badge:
- tersedia
- disewa
- laundry
- rusak
- maintenance

---

# FOTO PRODUK

Gunakan:
- rasio konsisten
- lazy loading
- crop center
- placeholder

---

# TABEL PRODUK

Desktop:
- sticky header
- pagination
- sorting
- filter
- search

Mobile:
- card list

---

# ACCEPTANCE CRITERIA INVENTORY

Berhasil jika:
- data produk lebih rapi
- stok mudah dipantau
- mobile tetap ringan
- inventory terasa profesional

---

# TAHAP 6
# LAPORAN BISNIS

# TARGET

Laporan harus menjadi pusat analitik.

---

# FILTER

Tambahkan:
- hari ini
- minggu ini
- bulan ini
- custom range

---

# ANALITIK

Tambahkan:
- omzet
- transaksi
- denda
- produk terlaris
- pelanggan aktif
- metode pembayaran

---

# EXPORT

Tambahkan:
- PDF
- Excel
- Print

---

# ACCEPTANCE CRITERIA LAPORAN

Berhasil jika:
- laporan mudah dibaca
- bisa difilter
- export berjalan
- mobile tetap usable

---

# MOBILE EXPERIENCE

# PRIORITAS TINGGI

Aplikasi harus terasa seperti native app.

---

# BOTTOM NAVIGATION

Gunakan:
- Beranda
- Sewa
- Kembali
- Produk
- Laporan

Gunakan:
- lucide-react

---

# SAFE AREA

Perhatikan:
- iPhone notch
- Android gesture
- navbar bawah

Tambahkan:
- padding bawah aman

---

# DRAWER

Gunakan:
- drawer
- bottom sheet
- slide panel

Hindari:
- modal fullscreen terus-menerus

---

# LOADING

Gunakan:
- skeleton
- shimmer

Hindari:
- spinner terus-menerus

---

# EMPTY STATE

Tambahkan ilustrasi:
- belum ada transaksi
- belum ada produk
- belum ada laporan

---

# NOTA

# DESAIN NOTA

Buat profesional.

Isi:
- logo
- nama usaha
- alamat
- nomor nota
- pelanggan
- item
- subtotal
- total
- pembayaran
- tanggal kembali

---

# MODE PRINT

Tambahkan:
- thermal
- A4

---

# PERFORMANCE

# TARGET

Aplikasi harus:
- ringan
- cepat
- smooth

---

# OPTIMASI

Gunakan:
- memo
- lazy load
- code splitting
- image optimization

---

# LIBRARY REKOMENDASI

## UI
- shadcn/ui
- tailwindcss
- lucide-react

## CHART
- recharts

## TABLE
- tanstack table

## FORM
- react-hook-form
- zod

## DATE
- dayjs

## ANIMATION
- framer-motion

---

# ARAH VISUAL ILUSTRASI

Gunakan ilustrasi:
- toko kostum adat modern
- rak kostum
- budaya bugis/mandar
- clean digital illustration
- semi flat
- profesional

Gunakan hanya:
- dashboard hero
- login
- empty state
- onboarding

Jangan memenuhi seluruh aplikasi dengan ilustrasi.

---

# TARGET AKHIR

Aplikasi harus terasa seperti:
- POS profesional
- aplikasi Android native
- aplikasi tablet modern
- sistem rental enterprise ringan
- modern namun tetap membawa identitas budaya lokal

---

# FINAL GOAL

Ketika selesai:
- kasir nyaman menggunakan aplikasi
- mobile nyaman
- tablet sangat optimal
- dashboard informatif
- transaksi cepat
- inventory rapi
- pengembalian profesional
- laporan modern
- aplikasi terlihat premium
- aplikasi layak digunakan bisnis rental profesional


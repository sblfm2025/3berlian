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
- premium

---

# LOGO APLIKASI

## WAJIB

Gunakan logo awal/project existing sebagai:
- logo utama aplikasi
- favicon
- splash branding
- sidebar logo
- login logo
- nota transaksi

Jangan mengganti identitas utama aplikasi.

---

# PENEMPATAN LOGO

## DESKTOP SIDEBAR

Gunakan:
- versi horizontal logo
- ukuran proporsional
- padding lega
- tidak terlalu kecil

---

## MOBILE TOPBAR

Gunakan:
- versi icon/logo compact
- tetap jelas terbaca
- tidak terlalu tinggi

---

# TEMA VISUAL APLIKASI

Tema harus mengikuti:
- logo existing
- warna existing
- identitas rental kostum adat
- nuansa budaya lokal modern

Aplikasi jangan terasa generic.

Harus terasa:
- khas
- profesional
- modern
- premium

---

# KOREKSI TEKS DEMO

## HAPUS / RAPIAKAN

Semua teks seperti:
- Lorem Ipsum
- Demo Text
- Example Data
- Placeholder tidak relevan
- Dummy title generik

Harus diganti dengan konteks nyata aplikasi.

---

# CONTOH TEKS YANG BENAR

Gunakan contoh seperti:
- Penyewaan Kostum Adat
- Sanggar Seni 3 Berlian
- Transaksi Hari Ini
- Pengembalian Terlambat
- Kostum Terlaris
- Data Penyewaan
- Pelanggan Aktif

Jangan gunakan istilah generic template.

---

# EMPTY STATE TEXT

Gunakan text yang natural.

Contoh:

## TRANSAKSI
"Belum ada transaksi hari ini"

## PRODUK
"Belum ada kostum ditambahkan"

## LAPORAN
"Belum ada data laporan pada periode ini"

---

# HERO / HEADER TEXT

Gunakan wording profesional.

Contoh:
- Dashboard Rental Kostum
- Sistem Manajemen Penyewaan
- Monitoring Transaksi Rental
- Kelola Penyewaan dengan Cepat dan Modern

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

---

# ANALISA KHUSUS PROJECT EXISTING

# MASALAH UX YANG TERLIHAT DARI STRUKTUR APP.JSX

Berdasarkan struktur project saat ini, aplikasi masih menggunakan pola:
- banyak conditional rendering
- banyak modal
- banyak state campur
- layout belum konsisten
- spacing belum stabil
- visual hierarchy belum kuat

Akibatnya:
- aplikasi terasa seperti dashboard admin biasa
- belum terasa seperti POS profesional
- mobile berpotensi terasa sempit
- workflow kasir belum optimal

---

# MASALAH TERBESAR EXISTING

## HALAMAN SEWA BELUM MENJADI “MESIN TRANSAKSI”

Saat ini alur transaksi masih terasa seperti:
form admin + list produk.

Padahal POS profesional harus terasa seperti:
- cepat
- intuitif
- minim klik
- fokus transaksi

Kasir idealnya:
1. cari produk
2. klik tambah
3. pilih pelanggan
4. bayar
5. cetak

Kurang dari 30 detik.

---

# ARAH UX BARU

# SEMUA HALAMAN HARUS PUNYA HIERARCHY JELAS

Setiap halaman harus memiliki:

1. Header
2. Action utama
3. Konten utama
4. Summary
5. Action sekunder

Jangan semua elemen terlihat sama penting.

---

# HIERARCHY VISUAL

## CONTOH HALAMAN SEWA

PALING MENONJOL:
- search produk
- grid produk
- total pembayaran
- tombol checkout

YANG TIDAK BOLEH DOMINAN:
- border berlebihan
- teks kecil tidak penting
- info sekunder

---

# SPACING SYSTEM

Gunakan spacing konsisten:

4px
8px
12px
16px
20px
24px
32px

Jangan random.

---

# BORDER RADIUS

Gunakan konsisten:

- card besar: 20px
- input: 14px
- button: 14px
- modal: 24px

---

# SHADOW SYSTEM

Gunakan soft shadow.

Jangan shadow hitam keras.

Gunakan:
- ringan
- blur besar
- opacity rendah

---

# RESPONSIVE STRATEGY

# MOBILE FIRST

Buat mobile dulu.

Kemudian:
- tablet
- desktop

Jangan desktop dipaksa ke mobile.

---

# TABLET EXPERIENCE

## TARGET UTAMA

Karena POS rental sangat cocok di tablet.

Optimalkan:
- landscape tablet
- touch interaction
- large touch area
- sticky cart

---

# TOUCH TARGET

Minimum:
44x44 px

Jangan tombol terlalu kecil.

---

# INTERAKSI PRODUK

# PRODUCT CARD HARUS SANGAT CEPAT DIGUNAKAN

Saat diklik:
- langsung masuk keranjang
- muncul animasi ringan
- subtotal update realtime

Jangan membuka modal setiap klik produk.

---

# QUICK ADD UX

Tambahkan:
- tombol + besar
- qty quick adjust
- feedback visual

---

# ANIMASI YANG DIREKOMENDASIKAN

Gunakan:
- fade ringan
- scale ringan
- slide drawer
- skeleton shimmer

Hindari:
- bounce berlebihan
- motion terlalu besar
- animation delay panjang

---

# CART UX

# KERANJANG HARUS MENJADI FOKUS KEDUA

Setelah produk.

Keranjang harus:
- sticky
- realtime
- mudah dibaca
- tidak terlalu tinggi
- summary jelas

---

# ITEM KERANJANG

Setiap item:
- thumbnail kecil
- nama
- ukuran
- qty
- subtotal
- remove

---

# CUSTOMER EXPERIENCE

# CUSTOMER FORM JANGAN TERLALU PANJANG

Gunakan:
- nama
- nomor HP
- alamat singkat

Field tambahan:
collapse/expand.

---

# QUICK CUSTOMER CREATION

Kasir harus bisa:
- membuat pelanggan baru tanpa keluar halaman
- langsung lanjut checkout

Gunakan:
- drawer kecil
- mini modal

---

# CHECKOUT UX

# HALAMAN CHECKOUT HARUS SANGAT JELAS

Area paling besar:
TOTAL PEMBAYARAN

---

# PAYMENT METHOD

Gunakan button selection:
- Tunai
- Transfer
- QRIS

Bukan dropdown biasa.

---

# MONEY INPUT

Input uang:
- font besar
- numeric only
- realtime change calculation

---

# SUCCESS SCREEN

Setelah checkout:

Tampilkan:
- sukses
- nomor nota
- total
- tombol print
- tombol transaksi baru

Jangan langsung close.

---

# PENGEMBALIAN UX

# PENGEMBALIAN HARUS TERASA SEPERTI INSPEKSI BARANG

Bukan sekadar klik selesai.

---

# RETURN ITEM CARD

Tampilkan:
- foto besar
- nama barang
- status
- keterlambatan
- kondisi

---

# KONDISI BARANG UX

Gunakan:
- segmented button
- warna status
- icon

Contoh:
- hijau = baik
- kuning = kotor
- merah = rusak

---

# PENALTY UX

Denda harus transparan.

Tampilkan:
- denda telat
- denda laundry
- kerusakan
- kehilangan

Semua realtime.

---

# DASHBOARD UX DETAIL

# DASHBOARD TIDAK BOLEH TERASA SEPERTI EXCEL

Dashboard harus:
- visual
- cepat dipahami
- prioritas jelas

---

# SECTION DASHBOARD

Urutan:

1. KPI utama
2. Grafik omzet
3. Pengembalian hari ini
4. Transaksi terbaru
5. Produk populer
6. Stok bermasalah

---

# TRANSAKSI TERBARU

Gunakan:
- avatar customer
- waktu
- status badge
- total

---

# STATUS BADGE SYSTEM

Gunakan badge konsisten.

Status:
- aktif
- selesai
- terlambat
- dibayar
- pending
- rusak
- laundry

---

# TABEL MODERN

# JANGAN GUNAKAN TABEL KAKU

Gunakan:
- zebra ringan
- hover
- rounded container
- sticky header
- action compact

---

# MOBILE TABLE STRATEGY

Jangan paksa tabel desktop ke mobile.

Mobile:
- card list
- expandable item

---

# DRAWER STRATEGY

Gunakan drawer untuk:
- detail produk
- checkout
- tambah pelanggan
- detail transaksi
- laporan filter

Lebih baik daripada modal fullscreen.

---

# EMPTY STATE DETAIL

Gunakan ilustrasi khusus:

- belum ada transaksi
- belum ada produk
- belum ada laporan
- pencarian kosong

Gunakan ilustrasi clean.

---

# ILUSTRASI BUDAYA

# PENGGUNAAN ILUSTRASI HARUS TERBATAS

Jangan memenuhi semua halaman.

Gunakan hanya:
- login
- dashboard hero
- onboarding
- empty state

---

# KONSEP ILUSTRASI

Visual:
- toko kostum adat modern
- rak kostum
- budaya bugis/mandar
- clean vector
- semi flat
- professional

---

# NOTA UX

# NOTA HARUS TERLIHAT PREMIUM

Tambahkan:
- logo
- QR kecil
- nomor transaksi
- customer
- tanggal kembali
- item jelas

---

# PRINT UX

Setelah print:
- tetap ada success state
- jangan reload kasar

---

# PERFORMA

# TARGET EXPERIENCE

Aplikasi harus:
- cepat dibuka
- cepat pindah halaman
- tidak lag
- scroll smooth
- realtime terasa ringan

---

# HALAMAN YANG HARUS LAZY LOAD

- laporan
- analytics
- chart
- export

---

# IMAGE OPTIMIZATION

Gunakan:
- lazy image
- compressed image
- thumbnail
- placeholder blur

---

# REFACTOR STRATEGY LANJUTAN

# JANGAN LANGSUNG PINDAHKAN SEMUA LOGIC

Urutan aman:

1. ekstrak visual
2. ekstrak reusable component
3. ekstrak helper
4. ekstrak service firebase
5. ekstrak state management

---

# STATE MANAGEMENT

Jika aplikasi mulai besar:

Gunakan:
- Zustand
atau
- Context modular

Hindari prop drilling berlebihan.

---

# FINAL EXPERIENCE TARGET

Saat aplikasi selesai:

Kasir harus merasa:
- aplikasi cepat
- mudah dipahami
- nyaman disentuh
- profesional
- modern
- seperti aplikasi native

Owner harus merasa:
- laporan jelas
- dashboard hidup
- transaksi mudah dipantau
- bisnis terlihat profesional

Customer harus merasa:
- proses cepat
- nota rapi
- pelayanan modern

---

# ANALISA MENDALAM PROJECT EXISTING

# ANALISA STRUKTUR PROJECT

Saat ini project masih memiliki pola prototype cepat.

Ciri-ciri:
- App.jsx terlalu besar
- logic UI dan logic data bercampur
- state lokal sangat banyak
- reusable component belum terbentuk
- visual belum memiliki design system
- layout masih bersifat admin dashboard biasa

Akibatnya:
- scaling akan sulit
- perubahan kecil berisiko merusak area lain
- mobile consistency sulit dijaga
- developer berikutnya akan kesulitan memahami struktur

---

# ANALISA POLA UI EXISTING

## MASALAH UTAMA

UI saat ini masih terasa seperti:
- panel admin
- CRUD dashboard
- aplikasi internal sederhana

Belum terasa seperti:
- POS modern
- aplikasi transaksi profesional
- aplikasi tablet kasir

---

# MASALAH VISUAL HIERARCHY

Saat ini kemungkinan semua section memiliki bobot visual hampir sama.

Akibat:
- mata user bingung
- tidak ada fokus utama
- checkout kurang dominan
- total pembayaran kurang terasa penting

Padahal dalam POS:

Fokus utama harus:
1. produk
2. total
3. checkout

---

# MASALAH SPACING

Biasanya pada project seperti ini ditemukan:
- padding tidak konsisten
- card terlalu rapat
- teks terlalu dekat
- jarak section tidak stabil

Akibat:
- terasa sempit
- tidak premium
- cepat melelahkan di mobile

---

# MASALAH MODAL

Kemungkinan saat ini terlalu banyak modal popup.

Masalah:
- menumpuk
- mobile terasa sesak
- keyboard mobile bentrok
- UX terasa lama

Solusi:
- gunakan drawer
- gunakan sheet
- gunakan inline expansion

---

# ANALISA KHUSUS HALAMAN SEWA

# INI AREA PALING KRITIS

Saat ini halaman sewa kemungkinan masih:
- list produk
- form customer
- summary sederhana

Belum terasa seperti:
- mesin transaksi cepat
- POS touch screen
- sistem kasir modern

---

# TARGET POS YANG BENAR

Kasir ideal:

1. buka aplikasi
2. cari kostum
3. tambah ke cart
4. pilih customer
5. pilih tanggal kembali
6. bayar
7. print

Semua harus sangat cepat.

---

# ANALISA KHUSUS PRODUK

Kemungkinan produk saat ini belum memiliki:
- hierarchy inventory
- visual stock indicator
- kategori visual
- quick action
- image optimization

Padahal inventory rental harus sangat visual.

---

# MASALAH INVENTORY RENTAL

Rental berbeda dengan toko biasa.

Produk rental memiliki:
- ukuran
- kondisi
- status
- keterlambatan
- histori penyewaan
- maintenance
- laundry

Artinya UI inventory harus lebih kaya.

---

# ANALISA KHUSUS PENGEMBALIAN

Saat ini kemungkinan pengembalian masih terlalu sederhana.

Padahal pengembalian rental adalah:
- inspeksi barang
- pengecekan kondisi
- verifikasi keterlambatan
- verifikasi denda

Maka UX harus lebih detail.

---

# ANALISA KHUSUS DASHBOARD

Dashboard saat ini kemungkinan hanya menampilkan:
- angka
- statistik sederhana

Belum memberikan:
- insight bisnis
- prioritas kerja
- warning system
- aktivitas realtime

Padahal dashboard POS modern harus:
- hidup
- realtime
- actionable

---

# ANALISA KHUSUS MOBILE

# MOBILE ADALAH PRIORITAS

Karena aplikasi kemungkinan besar:
- dipakai HP
- dipakai tablet
- dipakai sambil berdiri
- dipakai touch screen

Masalah umum:
- navbar bertabrakan
- modal terlalu besar
- tombol kecil
- scroll panjang
- keyboard menutupi input

---

# ANALISA KHUSUS TABLET

# TABLET HARUS MENJADI TARGET TERBAIK

Karena POS paling nyaman digunakan di tablet landscape.

Target UX:
- seperti aplikasi kasir restoran modern
- split screen
- touch friendly
- sticky summary

---

# STRATEGI REDESIGN YANG BENAR

# JANGAN MULAI DARI WARNA

Mulai dari:

1. hierarchy
2. workflow
3. layout
4. spacing
5. interaction
6. baru visual

---

# STRATEGI UX

# MINIMALKAN CLICK

Kasir jangan dipaksa:
- buka modal berkali-kali
- pindah halaman terus
- scroll panjang

Target:
semua transaksi utama selesai di 1 halaman.

---

# STRATEGI LAYOUT

# SEMUA HALAMAN HARUS PUNYA STRUKTUR KONSISTEN

Struktur:

1. Header
2. Toolbar/action
3. Content
4. Summary
5. Footer action

---

# STRATEGI VISUAL

# GUNAKAN WHITE SPACE

Jangan takut ruang kosong.

White space membuat:
- premium
- modern
- nyaman
- fokus lebih jelas

---

# STRATEGI WARNA

Gunakan warna untuk:
- prioritas
- status
- action utama

Bukan dekorasi.

---

# STRATEGI ICON

Gunakan:
- lucide-react

Jangan:
- icon campur style
- icon terlalu kecil

---

# STRATEGI BUTTON

# PRIMARY BUTTON HARUS SANGAT JELAS

Contoh:
- Checkout
- Selesaikan Pengembalian
- Simpan Produk

Harus:
- paling dominan
- ukuran besar
- warna solid

---

# STRATEGI FORM

# FORM JANGAN TERLALU PANJANG

Gunakan:
- grouping
- accordion
- section
- step

---

# STRATEGI DRAWER

Gunakan drawer untuk:
- detail produk
- tambah customer
- checkout mobile
- detail transaksi
- filter laporan

Drawer lebih natural dibanding modal.

---

# STRATEGI DATA TABLE

Desktop:
- tabel modern
- sticky header
- sorting
- hover
- pagination

Mobile:
- card layout
- expandable

---

# STRATEGI EMPTY STATE

Jangan biarkan area kosong polos.

Tambahkan:
- ilustrasi
- text guidance
- CTA action

---

# STRATEGI LOADING

Gunakan:
- skeleton
- shimmer

Hindari:
- spinner besar lama

---

# STRATEGI NOTIFIKASI

Gunakan toast modern:

- sukses
- error
- warning
- info

Posisi:
- kanan atas desktop
- atas mobile

---

# STRATEGI SEARCH

Search harus:
- realtime
- cepat
- tidak lag
- ada empty result
- keyboard friendly

---

# STRATEGI IMAGE

Produk rental sangat visual.

Gunakan:
- thumbnail konsisten
- crop center
- rasio seragam
- lazy load

---

# STRATEGI RESPONSIVE

# MOBILE BUKAN VERSI KECIL DESKTOP

Mobile harus:
- layout berbeda
- interaction berbeda
- spacing berbeda

---

# STRATEGI BOTTOM NAVIGATION

Bottom nav:
- fixed
- safe area aware
- blur background
- icon jelas
- active state kuat

---

# STRATEGI PERFORMANCE

Target:
- first load cepat
- perpindahan smooth
- scroll halus
- realtime ringan

---

# STRATEGI FIRESTORE UI

Saat loading realtime:
- jangan flicker
- jangan kosong mendadak
- gunakan optimistic UI

---

# STRATEGI KOMPONEN

Komponen harus:
- reusable
- kecil
- fokus 1 fungsi
- mudah dipahami

---

# STRATEGI STATE

Pisahkan:
- UI state
- form state
- firestore state
- session state

---

# STRATEGI DESIGN SYSTEM

WAJIB MEMILIKI:

## BUTTON SYSTEM
- primary
- secondary
- danger
- ghost

## BADGE SYSTEM
- success
- warning
- danger
- info

## CARD SYSTEM
- stat card
- product card
- transaction card
- summary card

## INPUT SYSTEM
- search input
- currency input
- textarea
- select

---

# STRATEGI RENTAL CARD

# PRODUCT CARD HARUS MENJUAL VISUAL

Gunakan:
- image besar
- stock badge
- kategori kecil
- harga jelas
- CTA tambah

---

# STRATEGI CART SUMMARY

Summary harus:
- sticky
- jelas
- realtime
- selalu terlihat

---

# STRATEGI CHECKOUT FLOW

Checkout:
1. customer
2. tanggal kembali
3. pembayaran
4. konfirmasi
5. success

Jangan semua sekaligus dalam form panjang.

---

# STRATEGI SUCCESS SCREEN

Setelah transaksi:
- animasi sukses ringan
- nomor nota besar
- tombol print
- tombol transaksi baru
- tombol lihat transaksi

---

# STRATEGI PENGEMBALIAN

Pengembalian harus terasa seperti:
- quality control
- pengecekan barang
- inspeksi rental

---

# STRATEGI RETURN STATUS

Gunakan warna:
- hijau baik
- kuning kotor
- orange rusak ringan
- merah rusak berat

---

# STRATEGI ANALYTICS

Dashboard harus menjawab:
- berapa omzet?
- apa yang paling laris?
- siapa yang belum kembali?
- produk apa bermasalah?
- metode bayar terbanyak?

---

# STRATEGI OWNER VIEW

Owner harus cepat melihat:
- performa bisnis
- transaksi aktif
- keterlambatan
- pendapatan

---

# STRATEGI KASIR VIEW

Kasir harus cepat:
- mencari produk
- menambah produk
- checkout
- pengembalian

---

# STRATEGI FUTURE SCALING

Aplikasi nantinya harus mudah dikembangkan untuk:
- barcode
- QR
- multi cabang
- printer bluetooth
- WA notification
- online booking
- membership

Maka struktur sekarang harus mulai dirapikan.

---

# FINAL TARGET EXPERIENCE

Ketika aplikasi selesai:

User harus merasa:
- aplikasi mahal
- profesional
- cepat
- modern
- stabil
- nyaman di tablet
- nyaman di HP
- seperti aplikasi native Android/iPad

Dan tetap:
- ringan
- sederhana digunakan
- cocok untuk rental kostum adat profesional

---

# ARAHAN LANJUTAN MENYELURUH UNTUK APLIKASI 3 BERLIAN

Dokumen lanjutan ini menjadi arahan implementasi berikutnya setelah update besar project. Fokusnya bukan lagi sekadar membuat tampilan cantik, tetapi menyempurnakan aplikasi menjadi sistem POS rental kostum yang stabil, cepat, mudah dirawat, dan terasa profesional.

---

# PRIORITAS UTAMA SAAT INI

Urutan kerja yang disarankan:

1. Perbaiki load Firebase/login agar halaman login cepat kembali.
2. Pecah `RentPage.jsx` karena sudah mulai terlalu besar.
3. Rapikan Dashboard, Return, Reports dengan pola modular yang sama.
4. Finalisasi branding logo dan tema 3 Berlian.
5. Optimasi mobile/tablet.
6. Optimasi performa dan loading data.
7. Baru tambahkan fitur lanjutan seperti export, barcode, WA notification, dan printer.

Jangan menambah terlalu banyak fitur baru sebelum struktur halaman utama stabil.

---

# 1. OPTIMASI LOAD FIREBASE DAN LOGIN

## MASALAH

Halaman login terasa lebih lambat karena aplikasi kemungkinan memuat terlalu banyak data sebelum user login.

Login seharusnya tidak menunggu:
- products
- customers
- transactions
- reports
- analytics

Login hanya perlu:
- Firebase siap
- data users siap

---

## ARAHAN IMPLEMENTASI

Pisahkan loading menjadi 2 tahap:

### Tahap A — Login Stage
Sebelum login, hanya load:
- auth/firebase init
- users

### Tahap B — App Stage
Setelah login, baru load:
- products
- customers
- transactions terbaru
- dashboard summary

---

## TARGET UX LOGIN

Target:
- 0-1 detik: logo dan form login tampil
- 1-3 detik: data user siap
- setelah login: AppShell tampil dengan skeleton
- data aplikasi dimuat bertahap

---

## ACCEPTANCE CRITERIA

Berhasil jika:
- halaman login tampil cepat
- tidak ada loading panjang sebelum form
- produk/transaksi tidak dimuat sebelum login
- setelah login, dashboard boleh skeleton sementara
- tidak ada listener Firestore dobel

---

# 2. PECAH RENTPAGE MENJADI FEATURE MODULE

## MASALAH

`RentPage.jsx` sekarang sudah kaya fitur, tetapi berisiko menjadi file besar yang sulit dirawat.

Masalah jika dibiarkan:
- bug checkout sulit dilacak
- mobile drawer sulit dirapikan
- kalkulasi total bercampur dengan UI
- filter produk bercampur dengan cart
- validasi transaksi bercampur dengan tampilan

---

## TARGET STRUKTUR

Buat folder:

```txt
src/features/rental/
  components/
    RentalHeader.jsx
    RentalStats.jsx
    ProductSearchBar.jsx
    ProductCategoryTabs.jsx
    ProductFilterPanel.jsx
    ProductGrid.jsx
    ProductCard.jsx
    ProductPagination.jsx
    RentalCartPanel.jsx
    CartItemRow.jsx
    CustomerSelector.jsx
    CustomerQuickForm.jsx
    RentalDatePanel.jsx
    PaymentMethodSelector.jsx
    PaymentSummary.jsx
    CheckoutChecklist.jsx
    CheckoutSuccessPanel.jsx
    MobileCartButton.jsx
    MobileCheckoutDrawer.jsx
  hooks/
    useRentalCart.js
    useProductFiltering.js
    useCustomerSelection.js
    useRentalCheckout.js
    usePaymentCalculation.js
  utils/
    rentalCalculations.js
    rentalValidation.js
    invoiceGenerator.js
```

---

## PEMBAGIAN TANGGUNG JAWAB

### `useRentalCart.js`
Mengelola:
- tambah item
- hapus item
- tambah qty
- kurang qty
- reset cart
- cek stok item

### `useProductFiltering.js`
Mengelola:
- search
- filter kategori
- filter ukuran
- filter status
- pagination
- sort produk

### `usePaymentCalculation.js`
Mengelola:
- subtotal
- diskon
- deposit
- total
- uang diterima
- kembalian

### `useRentalCheckout.js`
Mengelola:
- validasi checkout
- generate invoice
- panggil service checkout
- success state
- error handling

---

## TARGET UX HALAMAN SEWA

Desktop/tablet landscape:
- kiri 65-70% katalog produk
- kanan 30-35% keranjang sticky
- search sticky di atas katalog
- cart summary selalu terlihat
- checkout button besar dan jelas

Mobile:
- katalog 2 kolom
- filter horizontal
- floating cart button
- checkout menggunakan bottom sheet
- bottom nav tidak menutupi tombol checkout

---

## ACCEPTANCE CRITERIA RENTPAGE

Berhasil jika:
- fungsi transaksi tetap sama
- kode lebih kecil dan mudah dibaca
- mobile checkout lebih rapi
- cart tidak hilang saat scroll
- total selalu realtime
- validasi stok tetap berjalan
- tidak ada perubahan struktur database besar

---

# 3. RAPKAN DASHBOARD MENJADI PUSAT KONTROL BISNIS

## MASALAH

Dashboard jangan hanya menjadi halaman statistik. Dashboard harus memberi jawaban cepat:
- hari ini ada berapa transaksi?
- berapa pemasukan?
- barang apa yang harus kembali?
- siapa yang terlambat?
- produk mana yang laris?
- stok apa yang bermasalah?

---

## TARGET STRUKTUR

```txt
src/features/dashboard/
  components/
    DashboardHeader.jsx
    DashboardKpiGrid.jsx
    KpiCard.jsx
    RevenueChart.jsx
    TodayReturnList.jsx
    LateReturnList.jsx
    RecentTransactionList.jsx
    PopularProductList.jsx
    StockWarningList.jsx
  hooks/
    useDashboardStats.js
    useDashboardAlerts.js
  utils/
    dashboardCalculations.js
```

---

## KPI UTAMA

Minimal tampilkan:
- Omzet hari ini
- Transaksi hari ini
- Barang sedang disewa
- Pengembalian hari ini
- Terlambat
- Stok menipis
- Produk terlaris
- Pendapatan bulan ini

---

## DASHBOARD ACTIONABLE

Tambahkan section prioritas:

### Pengembalian Hari Ini
Tampilkan transaksi yang jatuh tempo hari ini.

### Terlambat
Tampilkan transaksi terlambat dengan badge merah.

### Stok Bermasalah
Tampilkan produk stok rendah, laundry, rusak, maintenance.

### Transaksi Terbaru
Tampilkan transaksi terbaru dengan status.

---

## ACCEPTANCE CRITERIA DASHBOARD

Berhasil jika:
- owner bisa membaca kondisi bisnis dalam 10 detik
- kasir tahu pekerjaan yang harus dilakukan hari ini
- data tidak terasa seperti tabel Excel
- dashboard tetap ringan
- chart tidak memperlambat login

---

# 4. RAPKAN RETURNPAGE MENJADI WORKFLOW INSPEKSI BARANG

## MASALAH

Pengembalian rental bukan hanya klik selesai. Pengembalian adalah proses pemeriksaan barang.

Harus ada:
- cek barang
- cek kondisi
- cek keterlambatan
- cek denda
- cek biaya tambahan

---

## TARGET STRUKTUR

```txt
src/features/returns/
  components/
    ReturnHeader.jsx
    ReturnSearchBar.jsx
    ActiveRentalList.jsx
    ReturnTransactionCard.jsx
    ReturnItemInspection.jsx
    ReturnConditionSelector.jsx
    ReturnPenaltyEditor.jsx
    ReturnSummaryPanel.jsx
    ReturnCompleteDialog.jsx
  hooks/
    useReturnSearch.js
    useReturnPenalty.js
    useReturnCompletion.js
  utils/
    returnCalculations.js
    returnValidation.js
```

---

## FLOW PENGEMBALIAN

1. Cari nota / nama pelanggan / nomor HP
2. Pilih transaksi aktif
3. Tampilkan semua item sewaan
4. Per item pilih kondisi:
   - baik
   - kotor
   - rusak ringan
   - rusak berat
   - hilang
5. Hitung otomatis:
   - denda telat
   - biaya laundry
   - biaya rusak
   - biaya hilang
6. Tampilkan summary
7. Selesaikan pengembalian
8. Cetak / simpan bukti pengembalian

---

## ACCEPTANCE CRITERIA RETURNPAGE

Berhasil jika:
- pengembalian lebih jelas
- item dicek satu per satu
- kondisi barang tercatat
- denda transparan
- proses mobile tidak sempit
- stok kembali bertambah hanya setelah pengembalian selesai

---

# 5. RAPKAN REPORTSPAGE MENJADI ANALITIK BISNIS

## MASALAH

Laporan tidak boleh memuat semua transaksi besar dari awal. Ini akan membuat aplikasi lambat.

---

## TARGET STRUKTUR

```txt
src/features/reports/
  components/
    ReportHeader.jsx
    ReportFilterBar.jsx
    ReportSummaryCards.jsx
    RevenueReport.jsx
    TransactionReport.jsx
    ProductPerformanceReport.jsx
    CustomerReport.jsx
    PaymentMethodReport.jsx
    ExportReportActions.jsx
  hooks/
    useReportFilters.js
    useReportData.js
    useReportExport.js
  utils/
    reportCalculations.js
    reportFormatters.js
```

---

## FILTER WAJIB

- Hari ini
- Minggu ini
- Bulan ini
- Tahun ini
- Custom range

---

## LAPORAN WAJIB

- Omzet per periode
- Jumlah transaksi
- Transaksi selesai
- Transaksi aktif
- Transaksi terlambat
- Denda
- Produk terlaris
- Pelanggan paling aktif
- Metode pembayaran

---

## STRATEGI DATA

Jangan ambil semua transaksi sekaligus.

Gunakan query berdasarkan periode:
- tanggal mulai
- tanggal selesai
- limit
- orderBy

---

## ACCEPTANCE CRITERIA REPORTS

Berhasil jika:
- laporan tidak memperlambat login
- laporan bisa difilter
- owner mudah membaca data
- export tidak memblok UI
- mobile tetap nyaman

---

# 6. FINALISASI BRANDING LOGO DAN TEMA 3 BERLIAN

## PRINSIP

Aplikasi tidak boleh terasa seperti template POS umum.

Aplikasi harus terasa sebagai:
Sistem POS Rental Kostum Sanggar Seni 3 Berlian.

---

## LOGO

Gunakan logo awal/existing sebagai:
- logo login
- sidebar logo
- mobile topbar logo
- favicon
- PWA icon
- splash screen
- nota transaksi
- empty state branding

---

## TEKS DEMO

Hapus semua teks generic seperti:
- demo
- lorem ipsum
- sample
- example
- placeholder yang tidak relevan

Ganti dengan wording bisnis nyata.

---

## WORDING APLIKASI

Gunakan istilah:
- Penyewaan
- Pengembalian
- Kostum
- Pelanggan
- Nota
- Deposit
- Denda
- Stok
- Laundry
- Rusak
- Maintenance

Hindari istilah generic template.

---

## TEMA WARNA

Tema harus mengikuti logo dan nuansa aplikasi:
- profesional
- elegan
- biru/gold/hijau jika sesuai logo
- white space dominan
- warna status konsisten

---

## ACCEPTANCE CRITERIA BRANDING

Berhasil jika:
- aplikasi terlihat milik 3 Berlian
- bukan template POS umum
- logo konsisten di semua tempat
- nota terlihat profesional
- PWA icon sesuai logo

---

# 7. OPTIMASI MOBILE DAN TABLET

## TARGET DEVICE

Prioritas:
1. Tablet landscape
2. HP Android
3. Desktop/laptop

---

## MOBILE RULES

- Jangan paksa tabel desktop ke mobile
- Gunakan card list
- Gunakan bottom sheet
- Gunakan floating cart
- Tambahkan safe-area padding
- Tombol minimal 44px
- Jangan ada tombol tertutup bottom nav

---

## TABLET RULES

Tablet landscape harus menjadi pengalaman terbaik.

Gunakan:
- katalog + cart split layout
- tombol besar
- spacing lega
- interaction touch friendly

---

## ACCEPTANCE CRITERIA RESPONSIVE

Berhasil jika:
- transaksi nyaman di HP
- tablet terasa seperti POS profesional
- tidak ada elemen tertutup navbar
- form tidak rusak saat keyboard muncul

---

# 8. OPTIMASI PERFORMANCE

## TARGET

Aplikasi harus cepat walau data bertambah.

---

## WAJIB DILAKUKAN

- Pisahkan login data dan app data
- Lazy load halaman berat
- Lazy load chart
- Batasi transaksi awal
- Gunakan skeleton
- Gunakan memo untuk kalkulasi berat
- Gunakan pagination
- Optimasi gambar produk

---

## HALAMAN YANG WAJIB LAZY LOAD

- ReportsPage
- ProductsPage
- CustomersPage
- UsersPage
- chart components
- export PDF/Excel

---

## DATA YANG JANGAN DIMUAT AWAL

- seluruh transaksi lama
- seluruh laporan
- export library
- chart berat

---

## ACCEPTANCE CRITERIA PERFORMANCE

Berhasil jika:
- login cepat
- dashboard tidak blocking lama
- halaman sewa cepat digunakan
- laporan tidak memperlambat aplikasi
- bundle build tidak membengkak berlebihan

---

# 9. STANDAR UX GLOBAL

## BUTTON

Buat sistem button:
- Primary
- Secondary
- Ghost
- Danger
- Success

Primary hanya untuk aksi utama.

---

## BADGE

Status badge wajib konsisten:
- Aktif
- Selesai
- Terlambat
- Tersedia
- Habis
- Laundry
- Rusak
- Maintenance

---

## TOAST

Gunakan toast untuk:
- transaksi berhasil
- produk berhasil disimpan
- error validasi
- koneksi lambat

---

## EMPTY STATE

Setiap halaman wajib punya empty state:
- icon/ilustrasi
- pesan jelas
- CTA bila perlu

Contoh:
"Belum ada transaksi hari ini. Mulai penyewaan baru sekarang."

---

# 10. STANDAR KODE

## KOMPONEN

Komponen harus:
- kecil
- fokus satu fungsi
- nama jelas
- props tidak terlalu banyak

---

## HOOKS

Gunakan hooks untuk logic:
- filtering
- cart
- checkout
- report
- dashboard stats

---

## UTILS

Gunakan utils untuk:
- format rupiah
- format tanggal
- hitung denda
- hitung total
- generate invoice

---

## SERVICE

Service hanya untuk komunikasi data:
- Firebase read
- Firebase write
- transaction update
- report query

Jangan campur service dengan UI.

---

# 11. TESTING MANUAL WAJIB

Setelah implementasi, lakukan test:

## LOGIN
- login tampil cepat
- login admin berhasil
- login kasir berhasil
- logout bersih

## SEWA
- tambah produk
- hapus produk
- qty berubah
- stok habis tidak bisa disewa
- customer dipilih
- diskon berjalan
- pembayaran tunai berjalan
- checkout berhasil
- nota tampil

## PENGEMBALIAN
- cari nota
- pilih transaksi
- hitung telat
- pilih kondisi barang
- selesaikan pengembalian
- stok kembali

## LAPORAN
- filter hari ini
- filter bulan ini
- lihat omzet
- lihat produk terlaris
- export jika tersedia

## MOBILE
- bottom nav aman
- checkout drawer aman
- keyboard tidak menutup input utama
- tombol tidak terlalu kecil

---

# 12. ROADMAP FITUR LANJUTAN

Setelah struktur stabil, baru tambahkan:

1. Barcode / QR produk
2. Printer thermal bluetooth
3. WhatsApp reminder pengembalian
4. Booking online
5. Deposit/jaminan lebih detail
6. Multi cabang
7. Membership pelanggan
8. Riwayat maintenance kostum
9. Upload foto kondisi sebelum/sesudah
10. Backup/export data

Jangan implementasikan roadmap ini sebelum halaman utama stabil.

---

# KESIMPULAN ARAHAN

Fokus developer sekarang bukan menambah fitur sebanyak-banyaknya, tetapi membuat aplikasi:
- lebih cepat
- lebih modular
- lebih stabil
- lebih mudah dipakai kasir
- lebih nyaman di tablet/HP
- lebih kuat sebagai POS rental profesional
- lebih konsisten dengan branding 3 Berlian

Prioritas tertinggi:
1. login cepat
2. RentPage modular
3. Dashboard actionable
4. ReturnPage sebagai inspeksi barang
5. ReportsPage ringan dan berbasis filter
6. Branding final sesuai logo 3 Berlian


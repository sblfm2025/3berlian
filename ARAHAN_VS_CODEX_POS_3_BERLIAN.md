# ARAHAN TEKNIS VS/CODEX — PENYEMPURNAAN POS PENYEWAAN KOSTUM SANGGAR 3 BERLIAN

> Fokus dokumen ini: **penyempurnaan fitur dan UI/UX agar menyerupai POS profesional terbaik**, dengan mengabaikan dulu aspek keamanan login.  
> Project: `https://github.com/sblfm2025/3berlian`  
> Stack yang terdeteksi: React + Vite + Firebase/Firestore + Tailwind + lucide-react + PWA.

---

## 1. Tujuan Utama

Ubah aplikasi menjadi **POS penyewaan kostum profesional** yang terasa seperti aplikasi kasir modern di tablet, desktop, dan mobile.

Target akhir:

1. Tampilan menyerupai POS modern: katalog produk di kanan/kiri, keranjang transaksi sticky, checkout cepat, panel ringkasan kasir.
2. Dashboard menjadi pusat kontrol bisnis, bukan sekadar halaman statistik sederhana.
3. Produk/inventaris lebih cocok untuk bisnis penyewaan kostum adat: kategori, ukuran, warna, stok, status laundry/rusak/maintenance, foto, kode SKU.
4. Pengembalian barang menjadi workflow profesional: kondisi barang, denda telat, denda rusak, biaya laundry, catatan.
5. Laporan menjadi lebih kuat: filter tanggal, omzet, produk terlaris, pelanggan aktif, metode pembayaran, transaksi terlambat, export.
6. UI responsive kuat untuk desktop, tablet kasir, dan HP.
7. Tidak merusak alur data lama. Semua perubahan dilakukan bertahap dan kompatibel dengan data yang sudah ada.

---

## 2. Prinsip Desain Baru

Gunakan referensi visual:

- **Gambar 1:** ilustrasi toko penyewaan baju adat Bugis/tradisional. Cocok dijadikan identitas visual, splash screen, login hero, empty state, dan banner dashboard.
- **Gambar 2:** layout POS modern multi-device. Cocok dijadikan acuan halaman transaksi/sewa: katalog produk + keranjang + checkout.

Aplikasi harus terasa seperti:

- POS retail modern.
- Sistem rental kostum adat.
- Aplikasi kasir tablet.
- Dashboard bisnis profesional.

Jangan terlalu ramai. Prioritaskan kecepatan transaksi.

---

## 3. Identitas Visual dan Branding

### 3.1 Nama aplikasi

Gunakan branding utama:

```txt
3 BERLIAN
Sanggar Seni
POS Penyewaan Kostum
```

### 3.2 Warna utama

Gunakan palet profesional:

```txt
Primary Blue       : #0D47A1
Primary Blue 2     : #1976D2
Accent Amber       : #FFC107
Accent Orange      : #FF6D00
Success Green      : #22C55E
Danger Red         : #EF4444
Background Soft    : #F5F7FA
Panel White        : #FFFFFF
Text Dark          : #1F2937
Muted Text         : #6B7280
Border Soft        : #E5E7EB
```

### 3.3 Tipografi

Gunakan font modern seperti `Inter`.

Aturan ukuran:

```txt
Desktop title       : 22–28px
Desktop body        : 13–15px
Mobile title        : 18–22px
Mobile body         : 12–14px
Table text          : 12–13px
Button text         : 13–14px
```

### 3.4 Visual ilustrasi

Tambahkan visual seperti gambar referensi toko penyewaan:

- Di halaman login sebagai hero kanan/kiri.
- Di dashboard sebagai banner atas.
- Di empty state ketika belum ada produk/transaksi.
- Di halaman landing PWA bila diperlukan.

Simpan file visual di:

```txt
public/assets/branding/3berlian-pos-hero.png
public/assets/branding/3berlian-storefront.png
public/assets/branding/empty-costume.png
```

Jika gambar dibuat manual/AI, gunakan prompt berikut:

```txt
Ilustrasi profesional toko penyewaan kostum adat Bugis/Sulawesi Selatan bernama “3 Berlian Sanggar Seni”, bangunan tradisional elegan dengan ornamen kayu, etalase penuh baju adat Bugis warna merah, emas, biru, hijau, katalog kostum rapi, suasana bisnis modern, clean, premium, cocok untuk hero aplikasi POS penyewaan kostum, tanpa teks kecil yang berantakan, warna biru dan emas, high detail, 16:9.
```

---

## 4. Struktur Refactor Bertahap

Saat ini aplikasi masih sangat besar di `src/App.jsx`. Jangan langsung ubah semuanya sekaligus. Lakukan bertahap.

Target struktur:

```txt
src/
  App.jsx
  main.jsx
  styles/
    globals.css
  config/
    appConfig.js
    navigation.js
  services/
    firebase.js
    productService.js
    transactionService.js
    customerService.js
    reportService.js
  hooks/
    useProducts.js
    useTransactions.js
    useCustomers.js
    useResponsive.js
  components/
    layout/
      AppShell.jsx
      Sidebar.jsx
      MobileBottomNav.jsx
      Topbar.jsx
      PageHeader.jsx
    ui/
      Button.jsx
      Card.jsx
      Badge.jsx
      Modal.jsx
      Drawer.jsx
      Input.jsx
      Select.jsx
      EmptyState.jsx
      StatCard.jsx
      ConfirmDialog.jsx
    pos/
      ProductGrid.jsx
      ProductCard.jsx
      CategoryTabs.jsx
      CartPanel.jsx
      CheckoutPanel.jsx
      CustomerPicker.jsx
      PaymentBox.jsx
      ReceiptPreview.jsx
    dashboard/
      DashboardStats.jsx
      RevenueChart.jsx
      PaymentMethodChart.jsx
      RecentTransactions.jsx
      LateReturns.jsx
    inventory/
      ProductForm.jsx
      ProductTable.jsx
      ProductStatusBadge.jsx
    returns/
      ReturnSearchPanel.jsx
      ReturnDetailPanel.jsx
      ReturnFeeSummary.jsx
    reports/
      ReportFilters.jsx
      ReportSummaryCards.jsx
      ReportTable.jsx
      ExportButtons.jsx
  pages/
    DashboardPage.jsx
    RentPage.jsx
    ReturnPage.jsx
    ProductsPage.jsx
    CustomersPage.jsx
    UsersPage.jsx
    ReportsPage.jsx
    SettingsPage.jsx
  utils/
    currency.js
    date.js
    receipt.js
    stock.js
    validators.js
```

### Aturan refactor

1. Jangan ubah nama koleksi Firestore dulu jika belum perlu.
2. Jangan ubah bentuk data lama secara drastis.
3. Tambahkan field baru dengan fallback default.
4. Setiap ekstraksi komponen harus diuji setelah dipindah.
5. Pertahankan fitur lama sampai fitur baru terbukti berjalan.

---

## 5. Layout Global Baru

### 5.1 Desktop

Gunakan layout:

```txt
┌────────────────────────────────────────────────────────────┐
│ Topbar: title halaman, tanggal, search global, user kasir   │
├───────────────┬────────────────────────────────────────────┤
│ Sidebar       │ Content Area                               │
│ - Beranda     │                                            │
│ - Sewa        │                                            │
│ - Kembali     │                                            │
│ - Produk      │                                            │
│ - Pelanggan   │                                            │
│ - Laporan     │                                            │
│ - Pengaturan  │                                            │
└───────────────┴────────────────────────────────────────────┘
```

Sidebar width:

```css
width: 240px;
```

Content:

```css
background: #F5F7FA;
padding: 20px;
```

### 5.2 Tablet POS

Tablet adalah prioritas utama untuk halaman sewa.

```txt
┌──────────────────────────────┬────────────────────┐
│ Katalog Produk               │ Keranjang          │
│ Search + kategori + grid     │ Customer + total   │
│                              │ Bayar + nota       │
└──────────────────────────────┴────────────────────┘
```

Rasio:

```txt
Katalog   : 65–70%
Keranjang : 30–35%
```

### 5.3 Mobile

Mobile jangan memaksa dua kolom.

```txt
Topbar
Search produk
Kategori horizontal
Grid produk 2 kolom
Floating cart button
Bottom sheet checkout
Bottom nav
```

Keranjang harus berupa drawer/bottom sheet, bukan panel permanen.

---

## 6. Dashboard Profesional

### 6.1 Komponen dashboard

Tambahkan:

1. Hero banner visual 3 Berlian.
2. Ringkasan hari ini.
3. Omzet 7/30 hari.
4. Barang sedang disewa.
5. Pengembalian jatuh tempo hari ini.
6. Pengembalian terlambat.
7. Produk stok menipis.
8. Produk paling sering disewa.
9. Transaksi terakhir.
10. Komposisi metode pembayaran.

### 6.2 Layout desktop dashboard

```txt
[Hero Banner 3 Berlian POS]

[Total Omzet] [Transaksi Hari Ini] [Barang Disewa] [Terlambat]

[Grafik Omzet 7 Hari]       [Metode Pembayaran]

[Transaksi Terakhir]         [Pengembalian Terlambat]

[Produk Terlaris]            [Stok Menipis]
```

### 6.3 KPI card

Buat `StatCard.jsx`:

Props:

```js
{
  title,
  value,
  subtitle,
  icon,
  tone: 'blue' | 'green' | 'amber' | 'red'
}
```

Contoh kartu:

```txt
Total Omzet
Rp 8.750.000
+15% dari kemarin
```

### 6.4 Dashboard mobile

Mobile gunakan 1 kolom:

```txt
Hero compact
KPI cards vertical
Transaksi terakhir
Terlambat
Produk terlaris
```

---

## 7. Halaman Sewa / POS Checkout

Ini halaman paling penting. Redesign total agar menyerupai gambar POS modern.

### 7.1 Layout desktop/tablet

```txt
┌──────────────────────────────────────────────┬──────────────────────┐
│ Header: Sewa                                 │ Keranjang (sticky)    │
│ Search produk                                │ Pelanggan             │
│ Category tabs                                │ Item sewa             │
│ Product grid                                 │ Diskon                │
│                                              │ Metode bayar          │
│                                              │ Uang diterima         │
│                                              │ Total                 │
│                                              │ Bayar & Cetak Nota    │
└──────────────────────────────────────────────┴──────────────────────┘
```

### 7.2 Product grid

Produk tampil sebagai card.

Isi card:

```txt
Foto produk
Nama produk
Kategori / ukuran
Harga sewa
Stok tersedia
Badge status
Tombol tambah
```

Ukuran card desktop:

```css
min-width: 160px;
border-radius: 16px;
```

Grid:

```css
grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
gap: 12px;
```

### 7.3 Kategori cepat

Tambahkan tab:

```txt
Semua | Baju Adat | Kebaya | Jas | Aksesoris | Anak | Dewasa | Lainnya
```

Bisa juga filter lanjutan:

```txt
Ukuran: S / M / L / XL / Anak
Status: Tersedia / Disewa / Laundry / Rusak
Harga: Rendah-Tinggi / Tinggi-Rendah
```

### 7.4 Keranjang

Panel keranjang harus sticky.

Isi:

```txt
Pelanggan
Tanggal sewa
Tanggal kembali
Daftar item
Subtotal
Diskon
Denda/deposit jika ada
Total
Metode pembayaran
Uang diterima
Kembalian
Tombol Bayar & Cetak Nota
```

Item keranjang:

```txt
[foto kecil] Nama Produk
Qty x Harga
Durasi sewa
Subtotal
[-] [qty] [+] [hapus]
```

### 7.5 Customer picker

Tambahkan input pelanggan seperti POS profesional:

- Cari pelanggan lama.
- Tambah pelanggan baru cepat.
- Nomor HP.
- Alamat/catatan.
- Identitas/jaminan opsional.

Field:

```js
customerName
customerPhone
customerAddress
customerNote
customerIdentityType // KTP/SIM/Kartu Pelajar/Lainnya
customerIdentityNumber
```

### 7.6 Deposit / jaminan

Tambahkan opsi deposit:

```txt
Deposit/Jaminan
Rp 0
```

Jangan wajibkan, cukup opsional.

### 7.7 Checkout rules

Saat checkout:

1. Validasi pelanggan tidak kosong.
2. Validasi minimal 1 item.
3. Validasi stok cukup.
4. Validasi tanggal kembali >= tanggal sewa.
5. Hitung total.
6. Simpan transaksi.
7. Kurangi stok tersedia.
8. Tampilkan nota.

### 7.8 Mobile checkout

Mobile:

- Product grid 2 kolom.
- Tombol floating bawah: `Keranjang (3) - Rp 310.000`.
- Saat diklik tampil bottom sheet checkout.
- Bottom nav tidak boleh menutup tombol checkout.

---

## 8. Halaman Pengembalian

### 8.1 Tujuan

Buat pengembalian seperti sistem rental profesional, bukan hanya tombol selesai.

### 8.2 Layout desktop/tablet

```txt
┌───────────────────────┬───────────────────────────┬──────────────────┐
│ Daftar transaksi aktif│ Detail barang dikembalikan │ Ringkasan biaya  │
│ Search nota/pelanggan │ Kondisi tiap item          │ Denda telat      │
│ Filter terlambat      │ Catatan                    │ Denda rusak      │
│                       │ Upload foto opsional       │ Laundry          │
│                       │                           │ Total tambahan  │
└───────────────────────┴───────────────────────────┴──────────────────┘
```

### 8.3 Status pengembalian

Tambahkan status:

```txt
Aktif
Jatuh Tempo Hari Ini
Terlambat
Selesai
Sebagian Kembali
```

### 8.4 Kondisi barang saat kembali

Per item:

```txt
Baik
Kotor/Laundry
Rusak Ringan
Rusak Berat
Hilang
```

Efek biaya:

```txt
Baik           : Rp 0
Kotor/Laundry  : biaya laundry
Rusak Ringan   : denda ringan
Rusak Berat    : denda berat
Hilang         : biaya ganti rugi
```

### 8.5 Field tambahan transaksi pengembalian

Tambahkan ke transaksi:

```js
returnInfo: {
  returnedAt,
  returnedBy,
  lateDays,
  lateFee,
  damageFee,
  laundryFee,
  replacementFee,
  additionalPayment,
  paymentMethodForFees,
  notes,
  itemConditions: [
    {
      productId,
      productName,
      condition,
      fee,
      note
    }
  ]
}
```

### 8.6 Partial return

Jika belum sempat, minimal siapkan UI/field untuk masa depan:

```txt
Checklist item yang sudah kembali.
Item yang belum kembali tetap status aktif.
```

Untuk tahap pertama, boleh tetap full return.

---

## 9. Halaman Produk / Inventaris

### 9.1 Data produk ideal

Tambahkan field:

```js
{
  name: string,
  sku: string,
  category: string,
  subCategory: string,
  size: string,
  color: string,
  gender: 'Pria' | 'Wanita' | 'Unisex' | 'Anak',
  dailyRentPrice: number,
  lateFeePerDay: number,
  stockTotal: number,
  stockAvailable: number,
  stockRented: number,
  stockLaundry: number,
  stockDamaged: number,
  status: 'active' | 'inactive',
  imageUrl: string,
  description: string,
  notes: string,
  createdAt,
  updatedAt
}
```

### 9.2 Tampilan produk

Sediakan 2 mode:

1. Grid mode untuk kasir.
2. Table mode untuk admin.

Table columns:

```txt
Foto | SKU | Nama | Kategori | Ukuran | Harga | Total | Tersedia | Disewa | Laundry | Rusak | Status | Aksi
```

### 9.3 Quick action

Tambahkan aksi cepat:

```txt
Edit
Duplikat
Tambah stok
Kurangi stok
Set laundry
Set rusak
Nonaktifkan
```

### 9.4 Stok menipis

Aturan:

```js
stockAvailable <= 2
```

Tampilkan badge `Stok Menipis`.

---

## 10. Halaman Pelanggan

Jika belum ada menu pelanggan khusus, tambahkan.

### 10.1 Data pelanggan

```js
{
  name,
  phone,
  address,
  identityType,
  identityNumber,
  totalTransactions,
  totalSpent,
  lastRentAt,
  notes,
  createdAt,
  updatedAt
}
```

### 10.2 Tampilan pelanggan

Columns:

```txt
Nama | HP | Alamat | Total Sewa | Total Belanja | Terakhir Sewa | Status | Aksi
```

### 10.3 Detail pelanggan

Saat klik pelanggan, tampilkan:

- Profil pelanggan.
- Riwayat transaksi.
- Transaksi aktif.
- Total omzet dari pelanggan.
- Catatan khusus.

---

## 11. Halaman Laporan Profesional

### 11.1 Tab laporan

```txt
Ringkasan | Transaksi | Produk | Pelanggan | Metode Pembayaran | Keterlambatan
```

### 11.2 Filter

```txt
Dari tanggal
Sampai tanggal
Status transaksi
Metode pembayaran
Kasir
Kategori produk
```

### 11.3 Summary cards

```txt
Total Omzet
Total Transaksi
Rata-rata Transaksi
Barang Disewa
Denda Terkumpul
Diskon Diberikan
Transaksi Terlambat
```

### 11.4 Grafik

Gunakan chart sederhana:

- Omzet harian.
- Transaksi per hari.
- Produk terlaris.
- Metode pembayaran.

Jika belum ada library chart, install:

```bash
npm install recharts
```

### 11.5 Export

Tambahkan export CSV dulu. PDF bisa tahap berikutnya.

File util:

```txt
src/utils/exportCsv.js
```

Fungsi:

```js
exportToCsv(filename, rows)
```

Tombol:

```txt
Export CSV
Print Laporan
```

---

## 12. Nota / Receipt Profesional

### 12.1 Format nota

Nota harus ringkas dan siap cetak.

```txt
3 BERLIAN SANGGAR SENI
POS Penyewaan Kostum
Alamat / Nomor HP

No Nota: INV-20250520-001
Tanggal: 20/05/2025 10:24
Kasir: Admin
Pelanggan: Andi Saputra
HP: 08xxxx

Item:
1. Baju Adat Bugis
   1 x Rp100.000 = Rp100.000
2. Songket Bugis
   1 x Rp120.000 = Rp120.000

Tanggal Sewa   : 20/05/2025
Tanggal Kembali: 22/05/2025
Durasi         : 2 hari

Subtotal       : Rp220.000
Diskon         : Rp10.000
Deposit        : Rp0
Total          : Rp210.000
Bayar          : Tunai
Diterima       : Rp250.000
Kembalian      : Rp40.000

Terima kasih.
Barang terlambat dikembalikan dikenakan denda sesuai ketentuan.
```

### 12.2 Ukuran cetak

Sediakan 2 mode:

```txt
Nota thermal 58/80mm
Nota A4/desktop
```

Untuk tahap pertama, buat modal preview + tombol print.

---

## 13. Navigasi dan UX Detail

### 13.1 Sidebar desktop

Menu:

```txt
Beranda
Sewa
Pengembalian
Produk
Pelanggan
Laporan
Pengguna
Pengaturan
```

Role kasir:

```txt
Beranda
Sewa
Pengembalian
Pelanggan
```

Role admin:

Semua menu.

### 13.2 Bottom nav mobile

Maksimal 5 menu:

```txt
Beranda | Sewa | Kembali | Produk | Laporan
```

Jika role kasir:

```txt
Beranda | Sewa | Kembali | Pelanggan | Akun
```

### 13.3 Topbar

Isi:

- Nama halaman.
- Search global opsional.
- Tanggal hari ini.
- Notifikasi jatuh tempo/terlambat.
- Avatar user/kasir.

### 13.4 Empty states

Contoh:

```txt
Belum ada transaksi hari ini
Mulai transaksi penyewaan pertama dengan tombol “Sewa Baru”.
```

Tambahkan ilustrasi kecil.

---

## 14. Responsive Rules

### 14.1 Breakpoints

```js
mobile: < 640px
tablet: 640px - 1024px
desktop: > 1024px
```

### 14.2 Mobile rules

- Hindari tabel lebar.
- Ubah tabel menjadi card list.
- Form panjang gunakan section accordion.
- Keranjang menjadi bottom sheet.
- Tombol utama sticky di bawah.
- Hindari font di atas 22px.

### 14.3 Tablet rules

- Halaman sewa harus optimal di tablet landscape.
- Gunakan 2 panel: katalog + keranjang.
- Tombol checkout besar dan jelas.

### 14.4 Desktop rules

- Gunakan sidebar.
- Gunakan tabel dan grafik.
- Kartu dashboard maksimal 4 kolom.

---

## 15. Komponen UI yang Harus Dibuat

### 15.1 Button

Variant:

```txt
primary
secondary
success
danger
ghost
outline
```

Size:

```txt
sm
md
lg
```

### 15.2 Badge

Variant:

```txt
success: Selesai, Tersedia
warning: Jatuh Tempo, Laundry
error: Terlambat, Rusak
info: Aktif, Disewa
neutral: Draft, Nonaktif
```

### 15.3 Modal / Drawer

Gunakan modal untuk desktop, drawer/bottom sheet untuk mobile.

### 15.4 Search input

Search harus punya ikon, clear button, dan debounce 200–300 ms.

---

## 16. Data dan Kompatibilitas

Jangan hapus field lama.

Saat membaca data produk, lakukan normalisasi:

```js
function normalizeProduct(product) {
  return {
    ...product,
    sku: product.sku || product.id?.slice(0, 8)?.toUpperCase() || '-',
    category: product.category || 'Lainnya',
    size: product.size || '-',
    dailyRentPrice: product.dailyRentPrice || product.price || 0,
    lateFeePerDay: product.lateFeePerDay || product.lateFee || 0,
    stockTotal: product.stockTotal || product.stock || 0,
    stockAvailable: product.stockAvailable ?? product.stock ?? 0,
    stockRented: product.stockRented || 0,
    stockLaundry: product.stockLaundry || 0,
    stockDamaged: product.stockDamaged || 0,
    status: product.status || 'active'
  };
}
```

Transaksi:

```js
function normalizeTransaction(tx) {
  return {
    ...tx,
    invoiceNumber: tx.invoiceNumber || tx.id,
    status: tx.status || 'active',
    paymentMethod: tx.paymentMethod || 'Tunai',
    discount: tx.discount || 0,
    deposit: tx.deposit || 0,
    lateFee: tx.lateFee || 0,
    damageFee: tx.damageFee || 0,
    laundryFee: tx.laundryFee || 0
  };
}
```

---

## 17. Nomor Nota

Buat format:

```txt
INV-YYYYMMDD-XXX
```

Contoh:

```txt
INV-20250520-001
```

Untuk tahap awal boleh gunakan:

```js
const invoiceNumber = `INV-${formatDateYYYYMMDD(new Date())}-${Date.now().toString().slice(-4)}`;
```

Tahap lanjutan gunakan counter harian di Firestore.

---

## 18. Validasi dan Error Handling

Tambahkan toast notification:

```bash
npm install react-hot-toast
```

Gunakan untuk:

```txt
Produk berhasil ditambahkan
Transaksi berhasil disimpan
Stok tidak cukup
Data pelanggan wajib diisi
Pengembalian berhasil diproses
Gagal menyimpan data
```

Validasi checkout:

```js
if (!customerName) throw new Error('Nama pelanggan wajib diisi');
if (cart.length === 0) throw new Error('Keranjang masih kosong');
if (!returnDate) throw new Error('Tanggal kembali wajib diisi');
if (receivedAmount < total) throw new Error('Uang diterima kurang dari total');
```

---

## 19. PWA dan Tampilan Installable

Karena project sudah mengarah ke PWA, rapikan:

```txt
public/manifest.webmanifest
public/icons/icon-192.png
public/icons/icon-512.png
```

Manifest:

```json
{
  "name": "3 Berlian POS Penyewaan Kostum",
  "short_name": "3B POS",
  "theme_color": "#0D47A1",
  "background_color": "#F5F7FA",
  "display": "standalone",
  "orientation": "any"
}
```

Tambahkan tombol:

```txt
Install Aplikasi
```

Munculkan hanya saat browser mendukung `beforeinstallprompt`.

---

## 20. Tahapan Eksekusi untuk VS/Codex

### Phase 1 — Foundation UI

Tujuan: rapikan tampilan tanpa ubah logika besar.

Checklist:

- [ ] Buat palet warna dan CSS variable.
- [ ] Buat komponen `Card`, `Button`, `Badge`, `StatCard`.
- [ ] Rapikan AppShell, Sidebar, Topbar, BottomNav.
- [ ] Tambahkan hero visual/banner.
- [ ] Pastikan desktop/tablet/mobile tidak pecah.

### Phase 2 — Dashboard Baru

Checklist:

- [ ] Buat KPI cards.
- [ ] Tambahkan transaksi terakhir.
- [ ] Tambahkan pengembalian terlambat.
- [ ] Tambahkan produk terlaris.
- [ ] Tambahkan metode pembayaran.
- [ ] Tambahkan grafik omzet jika menggunakan `recharts`.

### Phase 3 — Redesign Halaman Sewa

Checklist:

- [ ] Pisahkan katalog produk dan keranjang.
- [ ] Tambahkan category tabs.
- [ ] Tambahkan filter produk.
- [ ] Buat ProductCard.
- [ ] Buat CartPanel sticky.
- [ ] Buat checkout bottom sheet untuk mobile.
- [ ] Tambahkan preview nota setelah checkout.

### Phase 4 — Inventaris Produk

Checklist:

- [ ] Tambahkan field SKU, kategori, ukuran, warna.
- [ ] Tambahkan status laundry/rusak.
- [ ] Buat mode table admin.
- [ ] Tambahkan badge stok.
- [ ] Tambahkan quick action stok.

### Phase 5 — Pengembalian Profesional

Checklist:

- [ ] Buat daftar transaksi aktif.
- [ ] Tampilkan detail item.
- [ ] Tambahkan kondisi barang.
- [ ] Hitung denda telat/rusak/laundry.
- [ ] Simpan returnInfo.
- [ ] Tambahkan print bukti pengembalian.

### Phase 6 — Laporan Profesional

Checklist:

- [ ] Buat tab laporan.
- [ ] Tambahkan filter tanggal.
- [ ] Tambahkan ringkasan omzet.
- [ ] Tambahkan laporan produk terlaris.
- [ ] Tambahkan laporan pelanggan aktif.
- [ ] Tambahkan export CSV.
- [ ] Tambahkan print laporan.

### Phase 7 — Refactor Kode

Checklist:

- [ ] Pindahkan service Firebase.
- [ ] Pindahkan hooks data.
- [ ] Pindahkan page components.
- [ ] Bersihkan App.jsx.
- [ ] Pastikan tidak ada fitur lama hilang.

---

## 21. Prompt Kerja untuk Codex

Gunakan instruksi berikut langsung di VS/Codex.

```txt
Anda adalah developer senior React/Vite. Saya ingin menyempurnakan project POS penyewaan kostum 3 Berlian agar tampak seperti POS profesional modern untuk desktop, tablet, dan mobile.

Fokus utama: fitur dan UI/UX. Abaikan dulu keamanan login. Jangan merusak alur data dan logika lama. Jangan menghapus field lama. Tambahkan field baru dengan fallback agar data lama tetap terbaca.

Prioritas:
1. Rapikan layout global: AppShell, Sidebar desktop, Topbar, BottomNav mobile.
2. Redesign Dashboard menjadi pusat kontrol bisnis dengan KPI cards, transaksi terakhir, pengembalian terlambat, produk terlaris, metode pembayaran, dan grafik omzet.
3. Redesign halaman Sewa seperti POS modern: katalog produk + kategori + search + product grid + keranjang sticky + checkout cepat + nota.
4. Redesign halaman Pengembalian: search transaksi aktif, detail item, kondisi barang, denda telat, denda rusak, laundry fee, total tambahan, selesaikan pengembalian.
5. Upgrade Produk/Inventaris: SKU, kategori, ukuran, warna, stok total, stok tersedia, stok disewa, laundry, rusak, status, badge stok.
6. Upgrade Laporan: filter tanggal, ringkasan omzet, transaksi, produk terlaris, pelanggan aktif, metode pembayaran, export CSV/print.
7. Tambahkan visual branding 3 Berlian dengan nuansa toko penyewaan baju adat Bugis/tradisional dan warna biru-emas.

Gunakan komponen reusable: Button, Card, Badge, Modal, Drawer, StatCard, ProductCard, CartPanel, ReceiptPreview.

Gunakan responsive design:
- Desktop: sidebar + content grid.
- Tablet: POS split layout katalog dan keranjang.
- Mobile: product grid 2 kolom, cart bottom sheet, bottom navigation.

Jaga agar setiap perubahan bisa dijalankan dengan `npm run dev` dan tidak menimbulkan error lint/build.
```

---

## 22. Command yang Disarankan

Install dependency tambahan:

```bash
npm install recharts react-hot-toast clsx
```

Jalankan development:

```bash
npm install
npm run dev
```

Build test:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

---

## 23. Acceptance Criteria

Aplikasi dianggap berhasil naik kelas jika:

- [ ] Tampilan halaman sewa sudah terasa seperti POS modern.
- [ ] Kasir bisa transaksi cepat maksimal 3 langkah: pilih produk → pilih pelanggan → bayar/cetak.
- [ ] Dashboard langsung memberi gambaran kondisi bisnis.
- [ ] Pengembalian bisa mencatat kondisi barang dan denda.
- [ ] Produk memiliki data inventaris yang layak untuk rental kostum.
- [ ] Laporan bisa difilter dan diexport.
- [ ] Mobile tidak terpotong bottom nav.
- [ ] Tablet landscape nyaman digunakan sebagai mesin kasir.
- [ ] Desktop terlihat profesional untuk admin.
- [ ] Tidak ada fitur lama yang hilang.

---

## 24. Catatan Penting

Jangan mengejar tampilan terlalu dekoratif. Aplikasi POS harus cepat, bersih, dan jelas. Visual tradisional Bugis/3 Berlian digunakan sebagai identitas, bukan membuat area transaksi menjadi penuh ornamen.

Prioritas visual:

```txt
Clean > Cepat > Konsisten > Profesional > Dekoratif
```


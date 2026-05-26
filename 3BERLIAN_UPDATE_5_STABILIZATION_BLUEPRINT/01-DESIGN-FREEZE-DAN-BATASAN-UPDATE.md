# 01 — Design Freeze dan Batasan Update

## Tujuan

Menghentikan pola update maju-mundur pada UI. Setelah dokumen ini digunakan, developer tidak boleh mengganti konsep besar tanpa alasan teknis jelas.

## Design freeze sementara

Selama update ini:

- Warna utama aplikasi tetap.
- Layout umum aplikasi tetap.
- Navbar/sidebar tetap.
- Dashboard tidak didesain ulang.
- Login tidak disentuh.
- Laporan tidak didesain ulang.
- Produk dan pelanggan tidak didesain ulang.
- Fokus hanya workflow POS kasir.

## Komponen UI yang boleh dipoles

Boleh dipoles:

- ProductCatalog
- ProductCard
- RentalCart
- CartItem
- CheckoutPanel
- PaymentPanel
- CustomerPanel
- RentalMobileBar
- Receipt/Nota print template
- Scanner nota pada ReturnPage

## Komponen UI yang tidak boleh dibongkar

Jangan bongkar:

- AppShell global
- Dashboard layout
- Auth/login screen
- Reports layout besar
- Customer page besar
- Inventory page besar

## Prinsip tampilan profesional

Gunakan aturan ini untuk semua komponen POS:

### Spacing

- Card: `p-4` desktop, `p-3` mobile.
- Gap antar card: `gap-3` atau `gap-4`.
- Jangan terlalu rapat.
- Jangan membuat panel penuh teks kecil.

### Button

- Tinggi minimum tombol mobile: 44px.
- Tombol utama hanya satu per panel.
- Tombol sekunder harus lebih ringan secara visual.
- Jangan pakai terlalu banyak warna tombol.

### Typography

- Judul panel: semibold/bold, ukuran sedang.
- Angka total pembayaran harus paling dominan.
- Label field kecil tapi jelas.
- Hindari teks instruksi panjang di area kasir.

### Card

- Gunakan radius konsisten.
- Border halus.
- Shadow ringan.
- Jangan campur terlalu banyak gradient.

### Status

Gunakan badge, bukan paragraf panjang:

- Lengkap
- Belum lengkap
- Stok habis
- Terlambat
- Sudah dibayar
- Belum dibayar

## Larangan desain

Jangan:

- menambah efek visual besar
- mengganti semua warna
- mengganti semua layout
- membuat wizard fullscreen
- membuat banyak panel statistik di halaman kasir
- membuat kasir harus membaca instruksi panjang
- memunculkan terlalu banyak alert/modal

## Definisi UI sukses

UI dianggap sukses jika:

- kasir bisa memahami layar tanpa pelatihan panjang
- produk, cart, dan total terlihat jelas
- ukuran/qty/pembayaran tidak tersembunyi
- checkout gagal hanya jika data wajib belum lengkap
- flow di HP tetap nyaman
- tidak ada perubahan visual yang terasa seperti aplikasi berbeda

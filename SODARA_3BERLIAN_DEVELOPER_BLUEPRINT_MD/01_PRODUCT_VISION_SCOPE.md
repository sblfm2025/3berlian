# Product Vision, Scope, dan Batasan Pengembangan

## 1. Visi Produk

SODARA / 3 Berlian diarahkan menjadi sistem operasional khusus untuk:
- sanggar seni
- rental pakaian adat
- rental perlengkapan budaya
- event budaya lokal
- pengelolaan inventaris budaya

Aplikasi harus terasa:
- profesional
- elegan
- cepat digunakan kasir
- aman untuk data transaksi
- kuat untuk stok fisik
- memiliki identitas budaya/adat

## 2. Scope Utama Tahap Sekarang

Fokus utama:
- katalog produk rental
- transaksi sewa
- invoice
- data pelanggan
- pengembalian
- stok tersedia
- stok fisik
- laporan dasar
- dashboard operasional
- audit log
- soft delete
- performa Firebase
- UX mobile kasir

## 3. Scope Tahap Menengah

Setelah core stabil:
- booking kalender
- deteksi bentrok tanggal
- partial return
- laundry
- maintenance
- paket kostum
- QR/barcode
- stock opname
- laporan owner
- dashboard gudang
- template WhatsApp

## 4. Scope Jangka Panjang

Setelah aplikasi matang:
- multi cabang
- customer self booking
- AI rekomendasi ukuran
- AI rekomendasi kostum
- payment gateway
- mobile wrapper Android/iOS
- marketplace budaya
- sistem performer/sanggar/event

## 5. Yang Tidak Boleh Dikerjakan Dulu

Tunda:
- marketplace publik
- social feed
- fitur komunitas
- AI kompleks
- payment gateway penuh
- multi branch penuh
- native app penuh

Alasan:
core rental, stok, dan transaksi harus benar terlebih dahulu.

## 6. Persona Pengguna

### Owner
Butuh:
- omzet
- laporan
- stok bermasalah
- transaksi bermasalah
- deposit tertahan
- produk paling laku

### Kasir
Butuh:
- sewa cepat
- cari produk cepat
- checkout mudah
- return mudah
- cetak nota
- lihat overdue

### Petugas Gudang
Butuh:
- siapkan item
- cek stok
- cek laundry
- cek maintenance
- scan QR
- stock opname

### Admin
Butuh:
- kelola produk
- kelola pelanggan
- validasi laporan
- koreksi transaksi
- audit aktivitas

## 7. Prinsip Produk

Aplikasi harus:
- kompleks di dalam, sederhana di luar
- cepat pada kondisi ramai
- tidak membuat kasir berpikir terlalu lama
- tidak membuat owner ragu pada data
- aman dari double submit
- jelas saat error
- jelas saat data belum sinkron

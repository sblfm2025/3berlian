# 01 — Audit Visual Mobile dan Desktop Berdasarkan Screenshot

## Tujuan
Dokumen ini menjabarkan temuan visual dari screenshot mobile dan desktop agar developer memahami masalah nyata yang terlihat, bukan hanya memperbaiki berdasarkan asumsi kode.

## A. Beranda Mobile
### Yang sudah baik
- Identitas brand terlihat jelas melalui header biru, logo, dan nama 3 Berlian.
- Bottom navigation sudah menyerupai aplikasi mobile native.
- Tombol tengah `Sewa` sudah tepat dibuat dominan karena POS adalah fungsi utama.
- Kartu ringkasan toko cukup informatif.

### Masalah
1. Area `Selamat bekerja, Super Admin` terlalu besar untuk mobile.
2. Statistik seperti omzet, barang disewa, perlu dikembalikan, dan rata-rata transaksi tampil vertikal satu per satu sehingga layar habis untuk ringkasan.
3. Tab `Kasir POS / Analitik Owner / Operasional Gudang` bagus, tetapi masih menyita ruang besar.
4. Shortcut POS belum cukup dominan dibanding kartu greeting dan statistik.

### Arahan
- Di mobile, jadikan greeting sebagai card compact 1 baris atau maksimal 2 baris.
- Statistik dibuat grid 2 kolom dengan tinggi lebih pendek.
- `Sewa Kostum Adat` harus menjadi shortcut paling menonjol.
- Ringkasan detail untuk owner dipindah ke tab analitik, bukan default kasir.

## B. Booking Mobile
### Yang sudah baik
- Kalender rapi dan bersih.
- Tombol `Buat Booking Baru` sangat jelas.
- Tanggal aktif terlihat.

### Masalah
1. Kalender terlalu tinggi untuk layar HP.
2. Bentuk tanggal berupa kapsul vertikal besar menyebabkan ruang kosong berlebih.
3. Tanggal yang memiliki booking belum terlihat secara kuat.
4. Tidak ada filter cepat seperti Hari Ini, Besok, Minggu Ini.

### Arahan
- Gunakan cell kalender lebih compact, minimal 40–44px.
- Tambahkan dot/badge pada tanggal yang memiliki booking.
- Tambahkan quick filter: `Hari ini`, `Besok`, `Minggu ini`.
- Agenda harian bisa dibuat card sticky di bawah kalender atau collapse.

## C. Sewa/POS Mobile
### Yang sudah baik
- Ada stepper transaksi.
- Produk memiliki foto, nama, status, harga, dan tombol plus.
- QR/barcode diarahkan sebagai fitur utama.
- Pagination jelas.

### Masalah kritis
1. Halaman terlalu panjang untuk fungsi kasir.
2. Filter kategori terlalu banyak.
3. Card produk terlalu tinggi jika data mencapai ratusan item.
4. Total keranjang berjalan belum cukup dominan.
5. Setelah memilih item, user masih melihat daftar panjang produk tanpa ringkasan transaksi yang kuat.
6. Search global di header dan search POS bisa terasa dobel.

### Arahan
- Buat `Quick POS Mode` untuk mobile.
- Search/scan harus berada tepat di bawah header halaman.
- Card QR/barcode instruksi bisa collapse setelah user mulai scan atau setelah item pertama dipilih.
- Kategori utama maksimal 6 chip: `Semua`, `Bugis`, `Jilbab`, `Aksesoris`, `Anak`, `Lainnya`.
- Kategori panjang masuk `Filter Drawer`.
- Sticky cart wajib muncul di bawah, di atas bottom nav: `3 item · Rp 25.000 · Lanjut`.
- Card produk compact: gambar 56–64px, tombol plus 40–44px, harga jelas.

## D. Pengembalian Mobile
### Yang sudah baik
- Ada scan nota/QR unit.
- Daftar prioritas terlambat jelas.
- Detail pengembalian lengkap: pelanggan, tanggal, kondisi, denda, metode bayar, catatan.

### Masalah kritis
1. Detail terlalu panjang.
2. Fitur advanced seperti override denda terlihat terlalu depan.
3. Biaya tambahan Rp160.000 tidak menampilkan breakdown yang cukup jelas.
4. Tombol aksi utama baru terlihat setelah scroll jauh.

### Arahan
- Pisahkan `Fast Return` dan `Detail Return`.
- Default mobile harus menampilkan ringkasan nota dan item dulu.
- Tampilkan tombol cepat: `Semua Baik`, `Ada Laundry`, `Ada Rusak`, `Ada Hilang`.
- `Override Denda` masuk accordion `Pengaturan Denda Manual`.
- Ringkasan biaya sticky sebelum tombol konfirmasi.
- Tampilkan breakdown denda: `32 hari x Rp5.000 = Rp160.000`.

## E. Pelanggan Mobile
### Yang sudah baik
- Card pelanggan cukup lengkap.
- Status perhatian terlihat.
- Riwayat dan fitting sudah tersedia.

### Masalah
1. Ringkasan pelanggan terlalu besar untuk halaman mobile.
2. Jika pelanggan banyak, card terlalu tinggi.
3. Search pelanggan belum menjadi elemen paling dominan.
4. Data analitik bercampur dengan kebutuhan kasir mencari pelanggan.

### Arahan
- Mobile default: search + list compact.
- Ringkasan pelanggan dibuat collapse.
- Card pelanggan compact: nama, HP, status, total sewa, tombol detail.
- Detail fitting/riwayat dibuka di bottom sheet/modal.

## F. Desktop Sewa
### Yang sudah baik
- Sidebar profesional.
- Layout katalog kiri dan ringkasan tagihan kanan sudah tepat.
- Checklist transaksi sangat berguna.

### Masalah
1. Chip kategori membanjiri layar.
2. Panel kanan belum maksimal saat kosong.
3. Banyak ruang kosong bawah.
4. Konten terasa terlalu lebar di monitor besar.

### Arahan
- Kategori masuk filter panel dengan search kategori.
- Panel kanan tetap sticky.
- Saat cart kosong, tampilkan instruksi scan/tambah produk.
- Gunakan max-width konten agar tidak terlalu melebar.

## G. Desktop Pengembalian
### Yang sudah baik
- Dua kolom sudah tepat.
- Daftar nota aktif dan panel detail kanan sudah benar.

### Masalah
1. Banner status antrean terlalu besar.
2. Kolom kanan kosong terlalu besar saat belum memilih nota.
3. Scan harus dibuat lebih dominan.

### Arahan
- Banner antrean dibuat compact horizontal.
- Panel kanan kosong berisi langkah kerja dan shortcut scan.
- Prioritas nota tetap tampil, tetapi tidak mengalahkan scan.

## H. Desktop Pelanggan
### Yang sudah baik
- Tampilan rapi dan profesional.
- Masking KTP sudah tepat.
- Pelanggan loyal dan keamanan data ditempatkan di kanan.

### Masalah
1. Ringkasan terlalu dominan.
2. Halaman pelanggan terasa seperti analitik, bukan database operasional.
3. Tombol `Ubah Profil & Fitting` terlalu dominan dibanding detail.

### Arahan
- Default desktop: database pelanggan kiri, analitik kanan.
- Ringkasan bisa compact 4 kartu kecil.
- Search dibuat fokus utama.
- Detail pelanggan dibuka di drawer kanan.

# 11 - QA Regression Results

Tanggal eksekusi: 2026-05-27

## Ringkasan

Update 5 sudah melewati QA otomatis dasar untuk scope POS kasir, checkout, QR nota, dan scan nota. Pengujian klik end-to-end kasir tetap perlu dicek manual di browser karena melibatkan interaksi UI, data Firebase, printer, kamera/scanner, dan transaksi nyata/demo.

## Hasil Otomatis

- [x] `npm install --legacy-peer-deps` sukses dan tidak mengubah package yang sudah ada.
- [x] `npm run lint` sukses.
- [x] `npm run qa:rental` sukses untuk kalkulasi payment, validasi Mixed, QR payload, dan parser scan nota.
- [x] `npm run qa:blueprint` sukses untuk coverage syarat utama POS/Update 5.
- [x] `npm run build` sukses.
- [x] `git diff --check` sukses.
- [x] Preview build bisa dibuka di `http://127.0.0.1:4173` dengan HTTP 200.
- [x] Smoke screenshot login desktop berhasil dibuat.
- [x] Smoke screenshot login mobile berhasil dibuat dengan viewport 390x844.
- [x] Smoke screenshot dashboard admin berhasil dibuat dengan storage session lokal.
- [x] Tidak ada teks `Langkah berikutnya` di scope POS/return/receipt.
- [x] Tidak ada `alert()` browser di scope POS/return/receipt.
- [x] QR fallback transaksi menghasilkan format `3BTRX:{transactionId}`.
- [x] QR generator menghasilkan `data:image/png;base64`.
- [x] Parser scan nota membaca `3BTRX:{transactionId}` sebagai `transactionId`.
- [x] Parser scan nota membaca invoice manual sebagai `invoiceNumber`.
- [x] Mapper status lama membaca `disewa`, `completed`, dan `CANCELLED`.
- [x] Kalkulasi payment memasukkan deposit ke total.
- [x] Diskon mengurangi total.
- [x] Cash menghitung kembalian.
- [x] Status payment otomatis menjadi `paid` saat pembayaran cukup.
- [x] Variant picker POS ditambahkan sebelum produk multi-varian masuk cart.
- [x] Qty awal dari variant picker masuk cart sesuai jumlah dipilih.
- [x] Tombol plus/minus cart menjaga varian yang sama untuk item multi-varian.
- [x] Metode `Mixed` memakai validasi total pembayaran gabungan dan tidak lagi jatuh ke jalur non-tunai penuh.
- [x] Preview nota menampilkan QR pengembalian di modal sebelum cetak.

## Manual QA Yang Masih Perlu Diklik

Checklist ini perlu dilakukan di browser dengan data demo/operasional aman:

- [ ] Produk tampil di RentPage.
- [ ] Search produk berfungsi.
- [ ] Klik produk masuk cart.
- [ ] Produk multi-varian membuka pilihan ukuran sebelum masuk cart.
- [ ] Produk berukuran bisa dipilih/diubah ukurannya di cart.
- [ ] Cart item bisa ubah qty.
- [ ] Cart item bisa hapus item.
- [ ] Total realtime berubah saat qty/deposit/diskon berubah.
- [ ] Metode Mixed bisa checkout jika total pembayaran gabungan cukup.
- [ ] Payment panel bisa dibuka walau pelanggan belum lengkap.
- [ ] Customer panel bisa diisi kapan saja.
- [ ] Checkout gagal dengan error list jika data wajib kosong.
- [ ] Checkout sukses jika data lengkap dan stok cukup.
- [ ] Preview dan nota cetak menampilkan invoice dan QR.
- [ ] QR pada nota terbaca kamera/scanner.
- [ ] Scan QR membuka transaksi return yang benar.
- [ ] Scan transaksi returned menampilkan status sudah selesai.
- [ ] Scan transaksi void menampilkan status dibatalkan.
- [ ] Scan tidak langsung memproses return otomatis.
- [ ] Mobile tab Produk, Cart, Pelanggan, dan Bayar bisa dibuka bebas.
- [ ] Sticky mobile bar tidak menutup tombol penting.

## Catatan Risiko

- `npm audit` masih melaporkan 8 vulnerability dari dependency tree. Ini belum diperbaiki dalam Update 5 karena berpotensi mengubah dependency besar di luar scope stabilisasi POS.
- Dependency `qrcode` ditambahkan untuk QR nota. Install menggunakan `--legacy-peer-deps` karena peer dependency `vite-plugin-pwa` belum mencantumkan dukungan Vite 8, walaupun build saat ini sukses.
- Pengujian kamera/scanner dan print thermal tetap harus dilakukan pada perangkat fisik.
- Automasi klik POS penuh belum ditambahkan karena repo belum memiliki dependency `@playwright/test`. Smoke visual dilakukan memakai Playwright CLI tanpa menambah dependency repo.

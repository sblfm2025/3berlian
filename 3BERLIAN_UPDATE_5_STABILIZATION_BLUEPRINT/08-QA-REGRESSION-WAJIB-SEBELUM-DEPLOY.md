# 08 — QA Regression Wajib Sebelum Deploy

## Tujuan

Mencegah update kelima menimbulkan masalah baru.

Jangan deploy sebelum checklist ini selesai.

## A. Kasir POS — Desktop

- [ ] Produk tampil.
- [ ] Search produk berfungsi.
- [ ] Klik produk masuk cart atau membuka variant picker.
- [ ] Produk dengan ukuran bisa dipilih ukurannya.
- [ ] Cart item bisa ubah qty.
- [ ] Cart item bisa hapus item.
- [ ] Total realtime berubah saat qty berubah.
- [ ] Payment panel bisa dibuka walau pelanggan belum lengkap.
- [ ] Customer panel bisa diisi kapan saja.
- [ ] Checkout gagal jika data wajib kosong.
- [ ] Checkout menampilkan error list, bukan alert.
- [ ] Checkout sukses jika semua data lengkap.

## B. Kasir POS — Mobile

- [ ] Tab Produk bisa dibuka.
- [ ] Tab Cart bisa dibuka kapan saja.
- [ ] Tab Pelanggan bisa dibuka kapan saja.
- [ ] Tab Bayar bisa dibuka kapan saja.
- [ ] Sticky cart bar tampil saat cart berisi item.
- [ ] Cart drawer tidak menutupi tombol penting.
- [ ] Tombol minimal 44px.
- [ ] Tidak ada tabel melebar.
- [ ] Total pembayaran mudah terlihat.

## C. Payment

- [ ] Cash menghitung kembalian.
- [ ] Transfer bisa dipilih.
- [ ] QRIS bisa dipilih.
- [ ] Mixed payment jika tersedia tidak error.
- [ ] Deposit masuk total.
- [ ] Diskon mengurangi total.
- [ ] Paid/partial/unpaid sesuai nominal.

## D. Nota dan QR

- [ ] Checkout menghasilkan transaksi dengan invoiceNumber.
- [ ] Checkout menghasilkan transaksi dengan qrPayload.
- [ ] Print nota menampilkan invoiceNumber.
- [ ] Print nota menampilkan QR code.
- [ ] QR code terbaca kamera.
- [ ] QR code berisi format `3BTRX:{transactionId}`.
- [ ] Print preview tidak blank.
- [ ] QR tidak terlalu kecil.

## E. Scan Nota

- [ ] Scan QR membuka transaksi benar.
- [ ] Scan invoiceNumber manual membuka transaksi benar.
- [ ] Scan transaksi rented membuka flow return.
- [ ] Scan transaksi returned menampilkan status sudah selesai.
- [ ] Scan transaksi void menampilkan status dibatalkan.
- [ ] Scan tidak langsung memproses return otomatis.

## F. Data Lama

- [ ] Transaksi lama tetap tampil.
- [ ] Produk lama tetap bisa dipilih.
- [ ] Status lama `disewa` tetap terbaca sebagai aktif.
- [ ] Nota lama tetap bisa dicetak dengan fallback QR `3BTRX:{id}`.
- [ ] Tidak ada crash karena field size/qrPayload kosong.

## G. Build

- [ ] `npm install` sukses.
- [ ] `npm run lint` tidak error fatal.
- [ ] `npm run build` sukses.
- [ ] Preview build bisa dibuka.
- [ ] Tidak ada error console kritis pada RentPage.

## H. Batasan

- [ ] Login tidak berubah.
- [ ] Dashboard tidak berubah besar.
- [ ] Laporan tidak berubah besar.
- [ ] Tema global tidak berubah.
- [ ] Tidak ada redesign liar.

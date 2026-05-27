# 07 — Data, QA, dan Release Checklist

## Tujuan
Menjamin update UI/UX tidak merusak data, transaksi, stok, laporan, booking, dan pengembalian. Dokumen ini wajib dipakai sebelum deploy.

## Area yang tidak boleh rusak
- Produk/kostum.
- Stok tersedia.
- Keranjang sewa.
- Checkout.
- Nota.
- Pembayaran.
- Deposit.
- Pengembalian.
- Denda.
- Pelanggan.
- Booking.
- Laporan.
- Export/print jika sudah ada.

## Checklist sebelum coding
- [ ] Buat branch baru, misalnya `pos-core-cleanup`.
- [ ] Catat file yang akan diubah.
- [ ] Jangan refactor besar bersamaan dengan perubahan UI besar.
- [ ] Backup/cek struktur data Firestore.
- [ ] Pastikan mode demo tetap berjalan.

## Checklist build
Jalankan:

```bash
npm install
npm run lint
npm run build
npm run preview
```

Jika ada script audit UI, jalankan juga:

```bash
npm run ui:audit
```

Jika script belum ada, jangan paksa. Dokumentasikan manual test.

## Test perangkat/resolusi
Mobile:
- [ ] 360x800.
- [ ] 375x812.
- [ ] 390x844.
- [ ] 414x896.
- [ ] Android Chrome.
- [ ] iPhone Safari jika memungkinkan.

Tablet:
- [ ] 768x1024.
- [ ] 834x1194.

Desktop:
- [ ] 1280x720.
- [ ] 1366x768.
- [ ] 1440x900.
- [ ] 1920x1080.

## Test POS sewa
- [ ] Buka halaman Sewa.
- [ ] Search produk.
- [ ] Filter kategori.
- [ ] Tambah 1 produk.
- [ ] Sticky cart muncul di mobile.
- [ ] Tambah 3 produk.
- [ ] Kurangi quantity.
- [ ] Hapus item.
- [ ] Pilih/isi pelanggan.
- [ ] Pilih tanggal kembali.
- [ ] Pilih metode pembayaran.
- [ ] Simpan transaksi.
- [ ] Nota terbentuk.
- [ ] Stok berkurang.
- [ ] Cart kosong setelah berhasil.

## Test QR/barcode
- [ ] Input kode produk valid.
- [ ] Input kode produk tidak valid.
- [ ] Scan QR unit jika tersedia.
- [ ] Scan nota untuk return jika tersedia.
- [ ] Tidak ada crash saat input kosong.

## Test pengembalian
- [ ] Pilih nota aktif.
- [ ] Return semua item baik.
- [ ] Return terlambat.
- [ ] Denda muncul dengan breakdown.
- [ ] Return laundry.
- [ ] Return rusak ringan.
- [ ] Return hilang.
- [ ] Partial return.
- [ ] Konfirmasi return.
- [ ] Stok bertambah sesuai item kembali.
- [ ] Biaya tambahan tercatat.

## Test booking
- [ ] Kalender tampil benar.
- [ ] Ganti bulan.
- [ ] Pilih tanggal.
- [ ] Tanggal dengan booking punya indikator.
- [ ] Buat booking baru.
- [ ] Cek bentrok stok.
- [ ] Search booking/pelanggan.

## Test pelanggan
- [ ] Search nama.
- [ ] Search nomor HP.
- [ ] Buka detail.
- [ ] Edit fitting.
- [ ] Lihat riwayat.
- [ ] Pastikan data identitas masking.
- [ ] Pelanggan dengan status terlambat tampil benar.

## Test laporan
- [ ] Transaksi baru masuk laporan.
- [ ] Return dengan denda masuk laporan.
- [ ] Filter hari ini.
- [ ] Filter bulan ini.
- [ ] Export/print tidak error.

## Test offline/loading
- [ ] Simulasi jaringan lambat.
- [ ] Loading tidak blank terlalu lama.
- [ ] Jika Firebase lambat, UI memberi status.
- [ ] Mode demo tetap bisa dipakai untuk cek UI.

## Acceptance criteria rilis
Rilis boleh dilakukan jika:
- [ ] Build sukses.
- [ ] Tidak ada error console fatal.
- [ ] POS mobile 360px bisa dipakai tanpa elemen tertutup.
- [ ] Pengembalian normal selesai cepat.
- [ ] Desktop tidak horizontal scroll.
- [ ] Data transaksi benar.
- [ ] Stok benar.
- [ ] Laporan tetap membaca transaksi.

## Catatan rilis
Setiap rilis harus memiliki catatan:
```txt
Versi:
Tanggal:
Fokus update:
File utama yang diubah:
Risiko:
Cara rollback:
Hasil test:
```

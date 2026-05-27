# 10 - QA Visual dan Release Notes

Tanggal: 2026-05-27

## Fokus Update

POS core cleanup menindaklanjuti blueprint `3BERLIAN_POS_UPDATE_BLUEPRINT_MD` dengan fokus UI-first:

- POS mobile lebih compact.
- Filter kategori tidak membanjiri layar.
- Sticky cart berada di atas bottom navigation.
- Pengembalian punya fast mode dan breakdown denda.
- Booking mobile punya indikator tanggal.
- Pelanggan mobile lebih ringkas.

## File Utama yang Diubah

- `src/pages/RentPage.jsx`
- `src/pages/ReturnPage.jsx`
- `src/pages/BookingPage.jsx`
- `src/pages/CustomersPage.jsx`
- `src/features/rental/components/ProductCard.jsx`
- `src/features/rental/components/ProductCatalog.jsx`
- `src/features/rental/components/ProductFilterDrawer.jsx`
- `src/features/rental/components/RentalMobileBar.jsx`
- `src/features/returns/components/ReturnItemChecklist.jsx`
- `src/features/returns/components/ReturnSummary.jsx`

## Hasil Test Otomatis

- [x] `npm run lint` sukses.
- [x] `npm run qa:rental` sukses.
- [x] `npm run qa:blueprint` sukses.
- [x] `npm run build` sukses.
- [x] `git diff --check` sukses.
- [x] `npm run ui:audit` sukses terhadap preview build `http://127.0.0.1:4173`.
- [x] `npm run ui:audit` menyimpan `layoutChecks` untuk deteksi horizontal overflow desktop/mobile.
- [x] `npm run ui:audit` menyimpan `pageChecks` untuk memastikan halaman utama benar-benar terbuka.
- [x] Preview build aktif di `http://127.0.0.1:4173`.
- [x] Screenshot mobile 360x800 dibuat.
- [x] Screenshot mobile 390x844 dibuat.
- [x] Screenshot tablet 768x1024 dibuat.
- [x] Screenshot desktop 1366x768 dibuat.
- [x] Desktop long-wait smoke berhasil menampilkan dashboard setelah data selesai dimuat.

## Screenshot Lokal

Screenshot smoke disimpan lokal dan tidak masuk git karena folder `artifacts/` di-ignore:

- `artifacts/pos-core-after-mobile-360.png`
- `artifacts/pos-core-after-mobile-390.png`
- `artifacts/pos-core-after-tablet-768.png`
- `artifacts/pos-core-after-desktop-1366.png`
- `artifacts/pos-core-after-desktop-1366-longwait.png`

Audit CDP otomatis juga menyimpan screenshot di `.sixth/`:

- `.sixth/ui-audit-login.png`
- `.sixth/ui-audit-after-login.png`
- `.sixth/ui-audit-sewa.png`
- `.sixth/ui-audit-kembali.png`
- `.sixth/ui-audit-produk.png`
- `.sixth/ui-audit-laporan.png`
- `.sixth/ui-audit-mobile.png`

## Catatan QA

- Pada screenshot awal 6 detik, dashboard masih menampilkan skeleton loading karena data Firebase belum selesai dimuat.
- Pada screenshot 22 detik, dashboard tampil normal dengan data.
- `npm run ui:audit` berhasil login, membuka Sewa/Kembali/Produk/Laporan, dan mengambil screenshot mobile lewat Chrome DevTools Protocol.
- Hasil audit CDP sekarang menyertakan `passed`, `layoutChecks`, dan `pageChecks` pada `.sixth/ui-audit-result.json`.
- Jalur listener Firestore operasional sudah diparalelkan; aplikasi tidak lagi menunggu users -> products -> customers -> transactions -> bookings -> financialRecords secara berantai.
- Smoke visual ini memverifikasi app shell, responsive layout, dan loading state, tetapi belum menggantikan QA klik manual untuk transaksi nyata.

## QA Manual Lanjutan

- [ ] Buka halaman Sewa di HP 360px.
- [ ] Tambah produk dan pastikan sticky cart tidak menutup bottom nav.
- [ ] Buka filter kategori drawer dan pilih kategori.
- [ ] Buka Pengembalian, pilih nota aktif, cek tombol `Semua Baik & Selesaikan`.
- [ ] Cek denda terlambat dan breakdown nominal.
- [ ] Buka Booking di mobile dan cek dot indikator.
- [ ] Buka Pelanggan di mobile, expand/collapse ringkasan, search pelanggan.
- [ ] Test scanner QR/barcode fisik.
- [ ] Test print nota thermal.

## Risiko

- Perubahan ini tidak mengubah struktur database, tetapi tetap memengaruhi UI operasional kasir.
- Pengujian transaksi nyata tetap perlu dilakukan di data demo/operasional aman sebelum deploy final.
- Koneksi Firebase lambat dapat membuat screenshot otomatis berhenti di skeleton loading jika timeout terlalu pendek.

## Rollback

Rollback aman dilakukan dengan mengembalikan commit POS core cleanup:

- `2db8ce7 feat(pos): compact mobile pos and return flow`
- `830be55 feat(pos): compact booking and customer mobile views`
- `e255992 docs: add pos core cleanup blueprint results`
- `dc2b38e fix(rental): normalize legacy transaction statuses`

Jika sudah ada commit QA/release notes tambahan, rollback dokumentasi dapat dilakukan terpisah tanpa memengaruhi kode aplikasi.

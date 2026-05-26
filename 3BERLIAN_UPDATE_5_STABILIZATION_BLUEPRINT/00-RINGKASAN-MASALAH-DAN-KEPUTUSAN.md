# 00 — Ringkasan Masalah dan Keputusan Update

## Tujuan dokumen

Dokumen ini menjadi panduan update berikutnya untuk aplikasi 3 Berlian POS agar developer tidak lagi menafsirkan instruksi secara berbeda-beda.

Fokus update ini:

1. Memperbaiki sistem kasir yang menjadi terlalu sulit setelah update terakhir.
2. Menjaga UI tetap modern dan profesional tanpa redesign liar.
3. Menghubungkan fitur scan nota dengan QR code pada nota cetak.
4. Menstabilkan alur checkout, cart, pembayaran, dan pengembalian.
5. Membatasi scope agar update tidak melebar ke area lain.

## Masalah utama yang terjadi

Update sebelumnya terlalu banyak instruksi dan menghasilkan beberapa perubahan yang saling bertabrakan:

- Sistem kasir berubah menjadi terlalu seperti wizard.
- Setelah memilih produk, kasir dipaksa mengikuti langkah berikutnya.
- Kasir kehilangan akses cepat untuk memilih ukuran, jumlah, deposit, jenis pembayaran, dan catatan.
- Ada fitur scan nota, tetapi nota cetak tidak memiliki QR code.
- Arahan UI sebelumnya terlihat maju-mundur: kadang diminta jangan ubah UI, lalu diminta ubah lagi.
- Dokumen instruksi terlalu panjang dan terlalu banyak item, sehingga developer bisa memilih sebagian dan melewatkan konteks utama.

## Keputusan final

Aplikasi tetap diarahkan sebagai:

**POS rental pakaian adat modern, cepat, dan profesional.**

Bukan:

- form booking panjang
- wizard administrasi kaku
- CRUD sederhana
- rollback ke UI lama

## Prinsip teknis final

1. Jangan rollback ke metode lama.
2. Jangan redesign total.
3. Jangan ubah login/auth.
4. Jangan ubah dashboard, laporan, produk, pelanggan, kecuali diperlukan untuk kompatibilitas POS.
5. Fokus utama hanya halaman sewa/kasir, nota, scan nota, dan pengembalian terkait QR.
6. Stepper/checklist boleh tetap ada, tetapi tidak boleh mengunci alur.
7. Validasi tidak boleh memblokir eksplorasi kasir. Validasi hanya memblokir tombol checkout.
8. QR nota wajib ada jika fitur scan nota dipertahankan.
9. Semua perubahan harus diuji dengan QA regression sebelum deploy.

## Scope update ini

Yang boleh diubah:

- `src/pages/RentPage.jsx`
- komponen rental/cart/checkout
- hook rental cart dan checkout
- print receipt / nota
- scanner nota pada return flow
- util invoice/QR
- validasi checkout
- komponen UI kecil yang dipakai POS

Yang jangan disentuh:

- login
- auth
- role user
- dashboard besar
- laporan besar
- halaman produk besar
- halaman pelanggan besar
- tema global besar-besaran
- struktur database besar kecuali field QR payload transaksi

## Target akhir

Kasir harus bisa:

1. Pilih produk.
2. Pilih ukuran/varian.
3. Atur qty, harga, deposit.
4. Isi atau pilih pelanggan.
5. Pilih jenis pembayaran.
6. Lihat total dan kembalian.
7. Checkout.
8. Cetak nota dengan QR.
9. Scan nota untuk pengembalian.

Semua harus terasa cepat, jelas, dan konsisten.

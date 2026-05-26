# 10 — Prompt Tunggal untuk VS/Codex

Gunakan prompt ini setelah seluruh dokumen dibaca.

```txt
Anda adalah senior React/Firebase engineer untuk aplikasi 3 Berlian POS.

Tugas update ini bukan redesign total dan bukan rollback ke UI lama. Tugasnya adalah menstabilkan workflow kasir POS setelah update terakhir membuat halaman sewa terasa seperti wizard administrasi.

Scope:
- Jangan ubah login/auth.
- Jangan ubah dashboard besar.
- Jangan ubah laporan besar.
- Jangan ubah tema global besar-besaran.
- Fokus pada RentPage, cart, payment, receipt print, QR nota, dan scan nota.

Masalah yang harus diperbaiki:
1. Stepper/activeStep tidak boleh mengunci alur kasir.
2. Teks/perilaku "Langkah berikutnya" harus dihapus atau diganti menjadi checklist transaksi.
3. Kasir harus bisa membuka cart, customer, dan payment kapan saja.
4. Validasi hanya boleh memblokir checkout, bukan navigasi panel.
5. Produk dengan ukuran/varian harus bisa dipilih ukurannya sebelum masuk cart atau bisa diedit langsung di cart.
6. Cart item harus editable: ukuran, qty, harga/deposit jika didukung, catatan, hapus.
7. Payment panel harus bisa dibuka setelah cart berisi item, meskipun pelanggan belum lengkap.
8. Checkout harus menampilkan error list/checklist, bukan alert browser.
9. Nota cetak wajib memiliki QR code.
10. QR code nota harus berisi format `3BTRX:{transactionId}`.
11. Scan nota harus membaca QR dan membuka transaksi untuk proses pengembalian, bukan langsung memproses return.
12. Transaksi lama tanpa qrPayload harus tetap bisa dicetak dengan fallback `3BTRX:{id}`.
13. UI POS harus konsisten: produk, cart, total, checkout menjadi elemen utama; insight/statistik dijadikan sekunder/collapsible.

Urutan kerja:
1. Ubah stepper menjadi checklist non-linear.
2. Rapikan cart editable dan varian ukuran.
3. Rapikan payment panel dan validasi checkout.
4. Tambahkan qrPayload transaksi.
5. Tambahkan QR pada nota cetak.
6. Sambungkan scan nota ke lookup transaksi.
7. Lakukan UI consistency pass.
8. Jalankan QA regression.

Jangan membuat perubahan di luar scope. Jangan membuat wizard baru. Jangan rollback UI lama. Jangan menghapus komponen modern yang masih berguna. Pastikan `npm run build` sukses.
```

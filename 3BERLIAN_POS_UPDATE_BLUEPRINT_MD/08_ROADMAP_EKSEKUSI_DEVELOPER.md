# 08 — Roadmap Eksekusi Developer

## Tujuan
Memberikan urutan kerja yang jelas agar developer tidak mengerjakan semua sekaligus. Ikuti roadmap ini untuk menghindari regresi.

## Sprint 0 — Persiapan
Durasi: 0.5–1 hari.

Tugas:
- Buat branch `pos-core-cleanup`.
- Jalankan build awal.
- Screenshot kondisi awal mobile dan desktop.
- Tandai file halaman utama: Sewa, Pengembalian, Booking, Pelanggan, layout, navigation.
- Pastikan login tidak disentuh.

Output:
- Baseline screenshot.
- Catatan file yang akan diubah.
- Build awal berhasil atau daftar error awal.

## Sprint 1 — POS Mobile First
Durasi: 2–4 hari.

Tugas prioritas:
1. Buat `MobileStickyCartBar`.
2. Padatkan `ProductCard` mobile.
3. Batasi chip kategori utama.
4. Buat `FilterDrawer` untuk kategori panjang.
5. Buat scanner card collapsible.
6. Pastikan checkout step tidak rusak.

Jangan lakukan:
- Mengubah struktur data transaksi.
- Menghapus fitur checkout lama.
- Merombak laporan.

Acceptance:
- Di HP 360px, cart terlihat setelah item dipilih.
- Produk lebih padat.
- Filter tidak membanjiri layar.

## Sprint 2 — Pengembalian Fast Mode
Durasi: 2–4 hari.

Tugas:
1. Buat tampilan ringkas nota terpilih.
2. Tambahkan breakdown denda.
3. Sembunyikan override denda dalam accordion advanced.
4. Tambahkan tombol `Semua Baik & Selesaikan`.
5. Rapikan desktop return empty state.

Acceptance:
- Return normal bisa selesai cepat.
- Denda jelas perhitungannya.
- Override tidak tampil terlalu depan.

## Sprint 3 — Booking Compact
Durasi: 1–2 hari.

Tugas:
1. Padatkan kalender mobile.
2. Tambahkan dot/badge booking.
3. Tambahkan quick filter.
4. Rapikan agenda harian.

Acceptance:
- Kalender tidak terlalu tinggi.
- Tanggal berisi booking mudah dikenali.

## Sprint 4 — Pelanggan Compact
Durasi: 1–2 hari.

Tugas:
1. Ringkasan pelanggan collapsible di mobile.
2. Card pelanggan compact.
3. Detail pelanggan di bottom sheet/drawer.
4. Pastikan masking identitas konsisten.

Acceptance:
- Search pelanggan jadi fokus.
- List pelanggan tidak terlalu panjang.

## Sprint 5 — Desktop Cleanup
Durasi: 1–3 hari.

Tugas:
1. Kurangi chip kategori desktop.
2. Buat panel kanan POS lebih berguna saat kosong.
3. Compact banner return.
4. Pastikan sidebar dan content tidak horizontal scroll.

Acceptance:
- Desktop terasa seperti workspace POS.
- Panel kosong memiliki instruksi.

## Sprint 6 — QA dan Hardening
Durasi: 1–2 hari.

Tugas:
- Jalankan checklist dokumen 07.
- Perbaiki bug minor.
- Ambil screenshot after-update.
- Tulis release notes.

Acceptance:
- Semua test utama lolos.
- Tidak ada regresi kritis.

## Urutan commit yang disarankan
```txt
1. chore: create pos core cleanup branch baseline
2. refactor: extract rental mobile components safely
3. feat: add mobile sticky cart bar
4. feat: compact product cards and filter drawer
5. feat: improve return fast mode and fine breakdown
6. feat: compact booking calendar indicators
7. feat: compact customer list and privacy masking
8. fix: desktop workspace layout cleanup
9. test: complete pos return booking customer qa
10. docs: add release notes for pos core cleanup
```

## Risiko dan mitigasi
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Refactor merusak checkout | Transaksi gagal | Jangan ubah hook checkout saat UI dipisah |
| Sticky cart menutupi nav | Mobile tidak nyaman | Gunakan safe-area dan bottom offset |
| Filter baru salah membaca kategori | Produk hilang | Selalu sediakan `Semua` dan reset filter |
| Return partial salah stok | Data stok kacau | Test partial return khusus |
| Denda override disalahgunakan | Kerugian operasional | Accordion advanced + role check |

## Larangan selama update ini
- Jangan mengubah login.
- Jangan mengganti total desain brand secara ekstrem.
- Jangan hapus fitur lama sebelum pengganti selesai.
- Jangan menggabungkan perubahan data besar dengan UI cleanup.
- Jangan menambahkan fitur marketplace/fitur baru di sprint ini.

## Hasil akhir yang diharapkan
Aplikasi 3 Berlian menjadi POS rental kostum yang:
- Lebih cepat dipakai kasir di HP.
- Lebih rapi di desktop.
- Lebih jelas saat pengembalian.
- Lebih aman dalam denda dan data pelanggan.
- Tidak terasa berat karena informasi berlebihan.

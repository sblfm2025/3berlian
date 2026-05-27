# 00 — Ringkasan Eksekutif Prioritas Update 3 Berlian POS

## Tujuan dokumen
Dokumen ini menjadi pintu masuk untuk developer Antigravity IDE / Gemini / VS Code / Codex agar update tidak melebar, tidak tumpang tindih, dan tetap fokus pada fungsi utama aplikasi: POS penyewaan kostum yang cepat, mudah dipakai di HP berbagai ukuran, nyaman di desktop, dan aman secara data.

Bagian login tidak dibahas sesuai arahan pemilik aplikasi.

## Kondisi saat ini dari tangkapan layar
Aplikasi sudah memiliki identitas visual yang kuat: header biru, logo, sidebar desktop, bottom navigation mobile, kartu ringkasan, kalender booking, terminal sewa, pengembalian, dan data pelanggan. Secara visual sudah jauh lebih modern dibanding POS sederhana.

Namun dari sisi operasional POS, tampilan masih terlalu padat. Beberapa halaman terasa seperti gabungan antara dashboard admin, analitik, dan kasir harian. Untuk operasional rental kostum, terutama di smartphone, aplikasi harus lebih sederhana: cari barang, tambah ke nota, isi pelanggan, bayar, cetak/simpan nota, lalu proses pengembalian.

## Prinsip update wajib
1. Jangan mengubah alur data inti tanpa audit dampak.
2. Jangan mengubah koleksi Firestore sembarangan.
3. Jangan menambah fitur besar sebelum POS mobile dan pengembalian cepat rapi.
4. Desktop boleh kaya informasi, mobile harus cepat dan hemat ruang.
5. Setiap perubahan UI harus diuji di 360px, 390px, 414px, 768px, 1024px, dan desktop 1366px ke atas.
6. Fitur admin/advanced jangan muncul terlalu depan pada layar kasir.
7. Semua tombol utama harus mudah disentuh dengan jari, minimal 44px tinggi.

## Skor masalah saat ini
| Area | Kondisi | Risiko | Prioritas |
|---|---|---:|---:|
| POS mobile | Fungsi ada, tetapi terlalu panjang dan padat | Kasir lambat, salah pilih barang | P0 |
| Pengembalian mobile | Lengkap, tetapi terlalu panjang | Salah hitung/kelelahan operator | P0 |
| Filter katalog | Chip kategori terlalu banyak | Makan layar, sulit fokus | P0 |
| Keranjang mobile | Belum cukup dominan sebagai sticky action | Kasir tidak melihat total berjalan | P0 |
| Booking | Kalender bersih, tetapi besar | Scroll berlebih, indikator booking kurang jelas | P1 |
| Pelanggan | Informasi lengkap, tetapi terlalu dashboard | Search pelanggan tidak jadi fokus | P1 |
| Desktop POS | Sudah bagus, tetapi kategori terlalu penuh | Layar terasa ramai | P1 |
| Desktop return | Layout benar, tetapi area kosong besar | Ruang kerja kurang efisien | P1 |
| Konsistensi istilah | Ada campuran sewa, nota, agenda, transaksi | Bingung di operasional | P1 |
| Aksesibilitas | Kontras dan ukuran sebagian bagus, tetapi perlu standar | Sulit di HP murah/layar kecil | P2 |

## Paket update yang harus dikerjakan
### Sprint 1 — POS Mobile Stabilization
Target: halaman Sewa menjadi terminal kasir cepat.

Hasil wajib:
- Header mobile lebih ringkas.
- Search/scan menjadi fokus pertama.
- Chip kategori dibatasi maksimal 6 item, sisanya masuk drawer filter.
- Kartu produk dipadatkan.
- Sticky cart muncul saat item dipilih.
- Tombol lanjut checkout selalu terlihat.

### Sprint 2 — Return Fast Mode
Target: pengembalian menjadi lebih cepat dan aman.

Hasil wajib:
- Mode default: scan/cari nota → pilih nota → cek item → kondisi → konfirmasi.
- Override denda disembunyikan di advanced panel.
- Denda keterlambatan diberi breakdown jelas.
- Tombol `Semua Baik & Selesaikan` dominan untuk kasus normal.

### Sprint 3 — Desktop Workspace Cleanup
Target: desktop terasa seperti meja kerja POS, bukan halaman dashboard panjang.

Hasil wajib:
- Layout POS desktop 2 kolom stabil: katalog kiri, cart kanan sticky.
- Kategori tidak lagi membanjiri area atas.
- Panel kanan saat kosong memberi panduan praktis.
- Sidebar tetap, tetapi konten utama lebih fokus.

### Sprint 4 — Booking dan Pelanggan
Target: booking dan pelanggan lebih operasional, bukan hanya tampilan data.

Hasil wajib:
- Kalender mobile lebih compact.
- Tanggal berisi booking diberi dot/badge.
- Pelanggan default fokus ke search dan list compact.
- Ringkasan pelanggan bisa collapse di mobile.

### Sprint 5 — QA, Data, dan Release
Target: update aman untuk dipakai.

Hasil wajib:
- Checklist end-to-end diselesaikan.
- Tidak ada regresi pada sewa, return, booking, laporan, produk.
- Build dan lint lolos.
- Uji manual di perangkat kecil.

## Definisi selesai umum
Update dianggap selesai jika:
1. Kasir bisa membuat transaksi dari HP 360px tanpa kebingungan.
2. Kasir bisa melihat total item dan tagihan tanpa scroll panjang.
3. Pengembalian normal bisa selesai dalam maksimal 3–5 tap setelah nota dipilih.
4. Desktop tidak penuh kategori/chip berlebihan.
5. Tidak ada elemen penting yang tertutup bottom navigation.
6. Semua fitur advanced tetap ada, tetapi tidak mengganggu alur utama.

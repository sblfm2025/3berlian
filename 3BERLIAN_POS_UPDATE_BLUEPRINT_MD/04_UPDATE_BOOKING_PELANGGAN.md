# 04 — Instruksi Teknis Update Booking dan Pelanggan

## Tujuan
Merapikan halaman Booking dan Pelanggan agar lebih operasional. Booking harus membantu mencegah bentrok jadwal sewa. Pelanggan harus memudahkan pencarian dan riwayat, bukan hanya menampilkan ringkasan besar.

# Bagian A — Booking

## Masalah dari screenshot
- Kalender mobile terlalu tinggi.
- Cell tanggal berbentuk kapsul panjang sehingga banyak ruang kosong.
- Tanggal yang memiliki booking belum ditandai kuat.
- Agenda harian sudah ada, tetapi empty state terlalu dominan.

## Target UX booking
User harus cepat menjawab:
1. Hari ini ada booking apa?
2. Tanggal tertentu sudah ada sewa/booking apa?
3. Apakah kostum tertentu bentrok?
4. Bagaimana membuat booking baru?

## Layout mobile booking final
```txt
[Header compact]
[Search booking/pelanggan]
[Agenda selected compact]
[Button Buat Booking Baru]
[Kalender compact]
[Agenda harian]
```

## Kalender compact
Spesifikasi:
- Cell tanggal mobile 40–48px.
- Hari aktif tetap lingkaran biru.
- Tanggal yang ada booking punya dot kecil.
- Tanggal yang ada sewa aktif punya dot warna berbeda atau badge kecil.
- Hari minggu/libur boleh diberi warna subtle.

## Indikator tanggal
Data indikator minimal:
```js
{
  date: '2026-05-26',
  activeRentals: 0,
  bookings: 0,
  overdue: 0
}
```

Tampilan:
- 1 dot: ada booking.
- 2 dot: booking + sewa aktif.
- Badge merah kecil: ada bentrok/overdue.

## Filter cepat
Tambahkan chips:
- Hari ini
- Besok
- Minggu ini
- Ada booking
- Ada bentrok

## Buat Booking Baru
Tombol sudah bagus. Perbaikan:
- Setelah klik, buka modal/bottom sheet di mobile.
- Field minimal:
  - Nama pelanggan.
  - Tanggal ambil.
  - Tanggal kembali.
  - Produk/kostum.
  - Catatan.
- Sebelum simpan, cek bentrok stok.

## Validasi booking
Wajib:
- Tidak boleh booking produk yang stoknya habis pada rentang tanggal yang sama.
- Jika tetap diizinkan, harus berstatus `menunggu konfirmasi` dan diberi warning.
- Booking yang lewat tanggal ambil harus punya status khusus: `perlu tindak lanjut`.

# Bagian B — Pelanggan

## Masalah dari screenshot
- Ringkasan pelanggan terlalu dominan di mobile.
- Card pelanggan tinggi.
- Halaman terasa seperti dashboard, bukan database cepat.
- Search belum cukup menjadi pusat.

## Target UX pelanggan
User harus cepat:
1. Cari pelanggan berdasarkan nama/HP/alamat.
2. Lihat status risiko.
3. Lihat riwayat sewa.
4. Edit ukuran/fitting.
5. Pilih pelanggan untuk transaksi.

## Layout mobile pelanggan final
```txt
[Header compact]
[Search pelanggan]
[Filter status]
[List pelanggan compact]
[Detail pelanggan via bottom sheet]
```

Ringkasan pelanggan dibuat collapsible:
```txt
Ringkasan pelanggan ▾
Total 2 · Perlu perhatian 2 · Diblokir 0
```

## Card pelanggan compact
Isi card:
- Nama.
- Nomor HP.
- Alamat singkat.
- Badge status: Normal / Perhatian / Diblokir.
- Total sewa / terakhir aktif.
- Tombol `Detail`.

Jangan tampilkan semua metrik deposit dalam card utama jika tidak diperlukan.

## Detail pelanggan
Buka di bottom sheet/mobile drawer:
- Profil.
- Ukuran/fitting.
- Riwayat sewa.
- Deposit.
- Catatan.
- Data identitas dimasking.

## Masking data sensitif
KTP/identitas harus selalu dimasking.

Contoh:
```js
function maskIdentity(value) {
  if (!value) return '-';
  return value.slice(0, 4) + '********' + value.slice(-2);
}
```

Rules:
- Jangan tampilkan nomor KTP penuh di list.
- Detail penuh hanya untuk admin dan harus ada alasan akses jika memungkinkan.

## Desktop pelanggan
Pertahankan dua kolom, tetapi rapikan:
- Kiri: database/search/list.
- Kanan: pelanggan loyal + keamanan data.
- Ringkasan atas dibuat lebih rendah.

## Test case booking
1. Pilih tanggal kosong.
2. Pilih tanggal ada booking.
3. Buat booking baru.
4. Cek bentrok produk.
5. Ubah tanggal booking.
6. Cari booking berdasarkan pelanggan.

## Test case pelanggan
1. Cari berdasarkan nama.
2. Cari berdasarkan nomor HP.
3. Buka detail pelanggan.
4. Edit fitting.
5. Lihat riwayat sewa.
6. Pastikan data identitas tetap dimasking.

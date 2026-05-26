# Reporting, Analytics, dan Dashboard

## 1. Tujuan

Laporan harus menjadi alat keputusan bisnis, bukan hanya daftar transaksi.

## 2. Masalah Yang Harus Dihindari

Jangan membuat laporan hanya dari 100 transaksi terakhir jika owner memilih bulan tertentu.

Laporan harus query berdasarkan periode.

## 3. Jenis Laporan

### Operational Report
- transaksi hari ini
- jatuh tempo hari ini
- overdue
- booking hari ini
- barang belum kembali
- laundry queue
- maintenance queue

### Finance Report
- omzet
- deposit masuk
- deposit tertahan
- deposit refund
- denda
- piutang
- kas harian

### Inventory Report
- stok tersedia
- stok disewa
- stok laundry
- stok maintenance
- stok hilang
- stok opname discrepancy

### Customer Report
- pelanggan aktif
- pelanggan loyal
- pelanggan risiko tinggi
- pelanggan sering telat

### Product Analytics
- produk terlaris
- produk jarang disewa
- produk paling sering rusak
- ROI produk
- kategori paling laris

## 4. Dashboard Kasir

Tampilkan:
- tombol sewa cepat
- return cepat
- overdue
- booking hari ini
- transaksi belum lunas

## 5. Dashboard Owner

Tampilkan:
- omzet hari ini/bulan ini
- profit estimasi
- deposit tertahan
- produk terlaris
- stok bermasalah
- tren sewa

## 6. Dashboard Gudang

Tampilkan:
- perlu disiapkan
- perlu laundry
- perlu maintenance
- stok kritis
- stock opname

## 7. Query Strategy

Gunakan:
- date range query
- pagination
- export async jika data besar
- filter server-side jika memungkinkan

## 8. Export

Format:
- Excel
- PDF
- print invoice
- print return sheet
- stock report

## 9. Checklist Developer

- [ ] Laporan tidak bergantung pada limit global 100.
- [ ] Query per periode dibuat.
- [ ] Dashboard kasir dibuat.
- [ ] Dashboard owner dibuat.
- [ ] Dashboard gudang dibuat.
- [ ] Export Excel dibuat.
- [ ] Export PDF dibuat.
- [ ] Product analytics dibuat.
- [ ] Deposit report dibuat.

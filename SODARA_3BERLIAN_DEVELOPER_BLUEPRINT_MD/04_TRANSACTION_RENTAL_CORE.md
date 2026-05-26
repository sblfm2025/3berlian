# Transaction dan Rental Core Workflow

## 1. Tujuan

Membuat alur sewa yang:
- aman
- cepat
- tidak double submit
- stok tidak minus
- invoice unik
- data historis tetap akurat
- bisa dikembangkan ke booking dan partial return

## 2. Status Transaksi Wajib

```txt
DRAFT
BOOKED
CONFIRMED
PICKED_UP
ACTIVE_RENTAL
OVERDUE
RETURNED_PARTIAL
RETURNED_COMPLETE
INSPECTED
COMPLETED
CANCELLED
PROBLEM
```

## 3. State Transition Rules

### DRAFT → BOOKED
Syarat:
- pelanggan minimal ada nama dan nomor HP
- item dipilih
- tanggal booking ada
- conflict check lolos

### BOOKED → CONFIRMED
Syarat:
- DP/deposit opsional tercatat
- admin/kasir konfirmasi
- invoice booking dibuat

### CONFIRMED → PICKED_UP
Syarat:
- barang disiapkan
- checklist keluar selesai
- kondisi awal dicatat

### PICKED_UP → ACTIVE_RENTAL
Syarat:
- pelanggan menerima barang
- pembayaran/deposit valid
- stok berkurang

### ACTIVE_RENTAL → OVERDUE
Syarat:
- tanggal wajib kembali lewat
- return belum lengkap

### ACTIVE_RENTAL → RETURNED_PARTIAL
Syarat:
- sebagian item kembali
- masih ada outstanding item

### RETURNED_PARTIAL → RETURNED_COMPLETE
Syarat:
- seluruh item kembali atau selesai secara administratif

### RETURNED_COMPLETE → INSPECTED
Syarat:
- kondisi barang diperiksa
- denda dihitung
- laundry/maintenance ditentukan

### INSPECTED → COMPLETED
Syarat:
- deposit selesai
- denda selesai
- laporan keuangan tercatat

## 4. Checkout Workflow

Langkah teknis:

1. Validasi cart.
2. Validasi customer.
3. Validasi stok.
4. Generate operation token.
5. Generate invoice number.
6. Jalankan Firestore transaction.
7. Simpan transaction snapshot.
8. Update stok.
9. Simpan payment record.
10. Simpan activity log.
11. Tampilkan success state.
12. Tawarkan print invoice.

## 5. Invoice Number

Gunakan format:

```txt
INV-YYYYMMDD-HHMMSS-RANDOM4
```

Contoh:

```txt
INV-20260527-143012-A7K9
```

Jangan hanya memakai timestamp 4 digit belakang.

## 6. Operation Token

Setiap checkout wajib memiliki:

```txt
operationToken = checkout_userId_timestamp_random
```

Sebelum membuat transaksi:
- cek apakah operationToken sudah pernah dipakai
- jika sudah, jangan buat transaksi baru
- tampilkan transaksi yang sudah berhasil

## 7. Duplicate Submit Prevention

UI wajib:
- disable tombol bayar saat submit
- tampilkan loading jelas
- cegah enter key submit berulang
- cegah double click
- simpan operationToken lokal

## 8. Firestore Transaction

Dalam satu atomic transaction:
- baca produk
- validasi stok terbaru
- buat transaksi
- kurangi stok
- tulis inventory log
- tulis activity log

## 9. Draft Transaction

Draft boleh disimpan lokal atau Firestore.

Draft tidak boleh:
- mengurangi stok
- dianggap revenue
- masuk laporan final

## 10. Cancellation

Pembatalan harus:
- punya alasan
- tidak hard delete
- mengembalikan booking hold jika ada
- mencatat audit log
- mengubah status menjadi CANCELLED

## 11. Checklist Developer

- [ ] Status transaksi distandarkan.
- [ ] Transition rules dibuat.
- [ ] Checkout memakai operation token.
- [ ] Invoice format diperbaiki.
- [ ] Firestore transaction atomik.
- [ ] Activity log dibuat.
- [ ] Duplicate submit dicegah.
- [ ] Draft tidak mengurangi stok.
- [ ] Cancel tidak hard delete.
- [ ] Error conflict stok punya pesan jelas.

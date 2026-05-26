# Do Not Break Rules untuk Developer dan AI Coding Assistant

## 1. Jangan Rusak Data Lama

Dilarang:
- menghapus field lama
- rename field tanpa mapper
- mengubah format invoice lama
- menghapus transaksi lama
- migration tanpa backup

## 2. Jangan Hard Delete

Semua delete penting harus soft delete.

Berlaku untuk:
- transaksi
- customer
- produk
- financial record
- booking

## 3. Jangan Query Firestore Dari UI

Component UI tidak boleh langsung:
```js
collection(db, "transactions")
```

Gunakan repository/service.

## 4. Jangan Hitung Uang Di Banyak Tempat

Revenue, deposit, denda, dan refund harus dihitung di finance/reporting service.

## 5. Jangan Hitung Stok Di UI

UI hanya menampilkan hasil dari inventory service.

## 6. Jangan Pakai Alert Browser

Ganti dengan:
- toast
- confirm dialog
- modal
- inline error

## 7. Jangan Menambah Fitur Tanpa Acceptance Criteria

Setiap fitur harus punya:
- tujuan
- data berubah
- edge case
- error state
- test case

## 8. Jangan Abaikan Mobile

Setiap halaman wajib dicek di:
- 360px width
- 390px width
- tablet
- desktop

## 9. Jangan Rusak Mode Demo

Mode demo harus tetap:
- bisa login/masuk demo
- menampilkan data
- tidak membuat error Firebase
- berguna untuk presentasi

## 10. Jangan Membuat Listener Realtime Berlebihan

Realtime hanya untuk:
- active rental
- stock critical
- booking aktif
- notifikasi penting

## 11. Jangan Edit Transaksi Completed Sembarangan

Gunakan:
- adjustment
- revision
- audit log
- approval

## 12. Jangan Menganggap Return Selalu Lengkap

Return harus mendukung:
- sebagian
- rusak
- hilang
- laundry
- maintenance

## 13. Jangan Buat UI Terlalu Ramai

Fokus:
- aksi utama jelas
- hierarchy jelas
- mobile nyaman
- tidak semua informasi tampil sekaligus

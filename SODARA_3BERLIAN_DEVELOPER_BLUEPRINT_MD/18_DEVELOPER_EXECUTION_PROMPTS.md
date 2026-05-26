# Prompt Eksekusi Untuk Antigravity IDE / Gemini

## 1. Prompt Audit Awal Repo

Gunakan:

```txt
Audit repository ini secara menyeluruh tanpa mengubah kode dulu.
Fokus pada:
1. struktur folder
2. App.jsx dan file besar
3. alur transaksi sewa
4. alur return
5. data Firestore
6. risiko stok
7. laporan
8. performa Firebase
9. mobile UX
10. mode demo

Jangan ubah kode. Berikan daftar file yang perlu disentuh, risiko, dan urutan refactor paling aman.
```

## 2. Prompt Refactor App.jsx

```txt
Refactor App.jsx secara incremental.
Tujuan: App.jsx hanya menjadi application shell.
Pindahkan logic Firebase listener, PWA, modal bisnis, dan transaction handler ke hook/service terpisah.
Jangan mengubah UI dan flow user.
Pastikan mode demo tetap berjalan.
Berikan ringkasan file yang diubah dan risiko regresi.
```

## 3. Prompt Repository Layer

```txt
Buat repository layer untuk Firestore.
Jangan biarkan page/component query Firestore langsung.
Buat repository untuk products, customers, transactions, bookings, inventory_logs, activity_logs.
Pastikan semua fungsi memiliki error handling dan return format konsisten.
```

## 4. Prompt Transaction Integrity

```txt
Perkuat checkout rental.
Tambahkan operationToken, duplicate submit prevention, invoice number unik, dan Firestore transaction atomic.
Pastikan stok tidak minus.
Pastikan transaksi gagal tidak menghapus cart.
Pastikan activity log tercatat.
```

## 5. Prompt Inventory Lifecycle

```txt
Ubah sistem stok menjadi multi-status tanpa merusak data lama.
Tambahkan availableStock, rentedStock, laundryStock, maintenanceStock, lostStock, retiredStock.
Buat mapper agar data lama dengan field stock tetap terbaca.
Tambahkan inventory log untuk setiap perubahan stok.
```

## 6. Prompt Partial Return

```txt
Tambahkan return per item dan partial return.
Return harus mendukung GOOD, DIRTY, MINOR_DAMAGE, MAJOR_DAMAGE, LOST.
Stok harus berubah sesuai kondisi.
Deposit dan denda harus dihitung.
Audit log wajib.
Jangan merusak flow return lama.
```

## 7. Prompt Booking Calendar

```txt
Tambahkan booking calendar dan conflict detection.
Booking tidak boleh membuat stok final berkurang, tetapi harus muncul sebagai reserved.
Buat date overlap logic.
Tambahkan convert booking to rental.
Pastikan conflict dengan active rental dan booking confirmed.
```

## 8. Prompt UI/UX Mobile POS

```txt
Redesain RentPage menjadi mobile-first POS tanpa mengubah alur data.
Gunakan stepper:
1. Pilih Produk
2. Keranjang
3. Pelanggan
4. Pembayaran
Tambahkan sticky total dan bottom action.
Desktop tetap nyaman.
Jangan gunakan alert browser.
```

## 9. Prompt Reporting

```txt
Perbaiki laporan agar tidak bergantung pada 100 transaksi terakhir.
Gunakan query by date range.
Tambahkan laporan deposit, denda, overdue, produk terlaris, dan stok bermasalah.
Pastikan export Excel/PDF tetap berjalan.
```

## 10. Prompt Audit Log

```txt
Tambahkan audit log immutable untuk aksi penting:
create transaction, edit transaction, cancel transaction, delete transaction, refund deposit, override denda, stock adjustment.
Gunakan serverTimestamp.
Jangan menghapus log.
```

## 11. Prompt Design System

```txt
Buat design system sederhana:
Button, Input, Modal, BottomSheet, Toast, Badge, StatusPill, EmptyState, LoadingSkeleton, MetricCard, ProductCard.
Gunakan tema hijau elegan, aksen emas, nuansa budaya modern.
Jangan merombak semua halaman sekaligus.
```

## 12. Prompt QA Final

```txt
Lakukan QA manual terhadap:
checkout normal, stok habis, double submit, return normal, partial return, lost item, overdue, deposit refund, laporan periode, export, mobile view, mode demo.
Laporkan bug, risiko, dan rekomendasi patch.
```

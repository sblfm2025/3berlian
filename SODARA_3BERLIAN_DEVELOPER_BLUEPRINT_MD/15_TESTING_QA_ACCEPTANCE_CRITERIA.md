# Testing, QA, dan Acceptance Criteria

## 1. Tujuan

Setiap perubahan harus diuji dengan skenario nyata.

## 2. Testing Minimum

### Checkout
- sewa normal
- sewa stok pas 1
- sewa stok habis
- double click bayar
- refresh saat checkout
- internet putus saat checkout

### Return
- return normal
- return terlambat
- return sebagian
- return rusak
- return hilang
- deposit dipotong
- refund deposit

### Booking
- booking normal
- booking bentrok
- booking expired
- booking batal
- booking convert ke rental

### Inventory
- stok berkurang saat sewa
- stok kembali setelah return baik
- stok masuk laundry
- stok masuk maintenance
- stok hilang tidak kembali
- adjustment stok

### Reporting
- laporan harian
- laporan bulanan
- laporan per metode bayar
- laporan deposit
- export Excel
- export PDF

## 3. Acceptance Criteria Template

Setiap task harus punya:

```txt
Feature:
Tujuan:
Input:
Output:
Data yang berubah:
Data yang tidak boleh berubah:
Error state:
Loading state:
Audit log:
Test case:
```

## 4. Definition of Done

Selesai jika:
- build sukses
- tidak ada console error
- mobile diuji
- desktop diuji
- edge case diuji
- data lama tetap terbaca
- error state ada
- loading state ada
- audit log ada untuk aksi penting
- checklist task tercentang

## 5. Regression Checklist

Setiap update besar, uji:
- login/demo masih masuk
- produk tampil
- customer tampil
- cart berfungsi
- checkout berhasil
- invoice tampil
- return berhasil
- laporan tampil
- export tidak error
- PWA tidak rusak

## 6. Checklist Developer

- [ ] Test scenario ditulis sebelum coding.
- [ ] Acceptance criteria dibuat.
- [ ] Manual QA dilakukan.
- [ ] Regression dilakukan.
- [ ] Mobile QA dilakukan.
- [ ] Edge case diuji.

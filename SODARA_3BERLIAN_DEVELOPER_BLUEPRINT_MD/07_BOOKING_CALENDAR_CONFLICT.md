# Booking Calendar dan Conflict Detection

## 1. Tujuan

Booking diperlukan agar kostum tidak dijanjikan ke dua pelanggan pada tanggal yang sama.

## 2. Booking Status

```txt
DRAFT
PENDING
CONFIRMED
EXPIRED
CANCELLED
CONVERTED_TO_RENTAL
```

## 3. Booking Data

```json
{
  "bookingNumber": "BOOK-20260527-A7K9",
  "customerId": "",
  "customerSnapshot": {},
  "items": [],
  "startDate": "",
  "endDate": "",
  "status": "CONFIRMED",
  "depositPaid": 0,
  "expiresAt": "",
  "createdBy": "",
  "createdAt": "serverTimestamp"
}
```

## 4. Conflict Rule

Produk dianggap tidak tersedia jika pada tanggal yang diminta ada:
- booking confirmed
- active rental
- overdue
- item maintenance
- item laundry jika belum ready sebelum tanggal start

## 5. Date Overlap Logic

Dua rentang tanggal bentrok jika:

```txt
requestedStart <= existingEnd AND requestedEnd >= existingStart
```

## 6. Booking Hold

Jika booking pending:
- bisa punya expiry
- tidak mengurangi stok permanen
- tetapi tampil sebagai reserved sementara

## 7. Calendar UI

Tampilan:
- monthly calendar
- product availability
- booking list
- filter by product/category/customer
- warning bentrok

## 8. Convert Booking To Rental

Saat booking jadi rental:
- validasi ulang stok
- validasi ulang conflict
- buat transaksi
- update booking status
- simpan relasi bookingId

## 9. Cancellation

Booking batal:
- status CANCELLED
- alasan wajib
- audit log wajib
- deposit booking diproses sesuai aturan

## 10. Checklist Developer

- [ ] Booking collection dibuat.
- [ ] Conflict detection dibuat.
- [ ] Calendar UI dibuat.
- [ ] Booking expiry dibuat.
- [ ] Convert booking to rental dibuat.
- [ ] Booking cancellation aman.
- [ ] Booking muncul di dashboard.

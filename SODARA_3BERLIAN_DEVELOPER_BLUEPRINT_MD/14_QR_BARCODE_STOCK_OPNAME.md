# QR/Barcode dan Stock Opname

## 1. Tujuan

QR/barcode mempercepat:
- checkout
- return
- laundry
- maintenance
- stock opname

## 2. QR Item

Setiap item fisik punya:
```json
{
  "itemId": "",
  "itemCode": "BUGIS-L-001",
  "qrCode": "",
  "productId": "",
  "status": "READY"
}
```

## 3. Scan Workflow

### Checkout
- scan item
- validasi status READY
- tambahkan ke cart
- ubah status RENTED saat transaksi final

### Return
- scan item
- validasi item memang bagian transaksi
- pilih kondisi return
- update status

### Laundry
- scan item
- ubah status IN_LAUNDRY
- scan selesai laundry
- ubah READY

### Maintenance
- scan item
- ubah status IN_MAINTENANCE
- scan selesai repair
- ubah READY

## 4. Stock Opname

Workflow:
1. Buat sesi stock opname.
2. Pilih lokasi/rak.
3. Scan semua item fisik.
4. Bandingkan dengan data sistem.
5. Tampilkan selisih.
6. Buat adjustment dengan approval.

## 5. Stock Opname Data

```json
{
  "sessionId": "",
  "location": "",
  "status": "IN_PROGRESS",
  "scannedItems": [],
  "missingItems": [],
  "unexpectedItems": [],
  "adjustments": [],
  "createdBy": "",
  "createdAt": ""
}
```

## 6. Checklist Developer

- [ ] Struktur product_items tersedia.
- [ ] QR code generator tersedia.
- [ ] Scan checkout disiapkan.
- [ ] Scan return disiapkan.
- [ ] Scan laundry disiapkan.
- [ ] Stock opname session dibuat.
- [ ] Discrepancy report dibuat.
- [ ] Adjustment wajib audit log.

# Return, Partial Return, Laundry, dan Maintenance

## 1. Tujuan

Pengembalian harus mencerminkan kondisi nyata:
- kembali lengkap
- kembali sebagian
- terlambat
- rusak
- hilang
- kotor/laundry
- deposit dipotong
- denda dibayar

## 2. Jenis Return

```txt
FULL_RETURN
PARTIAL_RETURN
DAMAGED_RETURN
LOST_RETURN
LATE_RETURN
MIXED_RETURN
```

## 3. Partial Return

Contoh:
Pelanggan sewa 10 item:
- 7 kembali
- 2 belum kembali
- 1 hilang

Sistem harus menyimpan:
```json
{
  "returnedQty": 7,
  "outstandingQty": 2,
  "lostQty": 1
}
```

Status transaksi:
```txt
RETURNED_PARTIAL
```

## 4. Return Item Data

```json
{
  "transactionItemId": "",
  "productId": "",
  "qtyReturned": 1,
  "conditionReturn": "DIRTY",
  "actionAfterReturn": "SEND_TO_LAUNDRY",
  "damageFee": 0,
  "lostFee": 0,
  "notes": "",
  "photos": []
}
```

## 5. Condition Return

```txt
GOOD
DIRTY
MINOR_DAMAGE
MAJOR_DAMAGE
LOST
INCOMPLETE_ACCESSORY
```

## 6. Action After Return

```txt
MAKE_AVAILABLE
SEND_TO_LAUNDRY
SEND_TO_MAINTENANCE
MARK_LOST
NEED_OWNER_REVIEW
```

## 7. Laundry Workflow

```txt
WAITING_LAUNDRY
IN_LAUNDRY
DONE
READY
```

Data:
```json
{
  "productId": "",
  "itemId": "",
  "transactionId": "",
  "status": "WAITING_LAUNDRY",
  "assignedTo": "",
  "startedAt": "",
  "completedAt": "",
  "cost": 0,
  "notes": ""
}
```

## 8. Maintenance Workflow

```txt
WAITING_CHECK
IN_REPAIR
DONE
READY
UNREPAIRABLE
```

Data:
```json
{
  "productId": "",
  "itemId": "",
  "damageType": "",
  "repairCost": 0,
  "status": "IN_REPAIR",
  "notes": "",
  "photos": []
}
```

## 9. Denda

Jenis denda:
- keterlambatan
- rusak
- hilang
- aksesoris tidak lengkap
- laundry khusus

Denda harus:
- dihitung jelas
- bisa override dengan alasan
- tercatat di audit log
- memengaruhi deposit/refund

## 10. Deposit Saat Return

Kemungkinan:
- refund penuh
- refund sebagian
- deposit habis dipotong
- pelanggan masih harus bayar
- deposit ditahan sementara

## 11. Return Acceptance Criteria

Return dianggap selesai jika:
- semua item punya status akhir
- stok berubah benar
- denda dihitung
- deposit diperbarui
- payment/refund tercatat
- audit log dibuat
- invoice return bisa dicetak
- laporan ikut berubah

## 12. Checklist Developer

- [ ] Return per item tersedia.
- [ ] Partial return tersedia.
- [ ] Kondisi item return tersedia.
- [ ] Laundry job otomatis dibuat.
- [ ] Maintenance job otomatis dibuat.
- [ ] Lost item tidak kembali ke stok.
- [ ] Deposit diproses benar.
- [ ] Denda masuk laporan.
- [ ] Audit log tercatat.

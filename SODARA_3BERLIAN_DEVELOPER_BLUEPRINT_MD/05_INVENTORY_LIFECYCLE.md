# Inventory Lifecycle dan Stok Nyata

## 1. Tujuan

Sistem stok harus membedakan:
- stok fisik total
- stok tersedia
- stok sedang disewa
- stok laundry
- stok maintenance
- stok hilang
- stok pensiun

## 2. Masalah Umum Yang Harus Dihindari

Jangan hanya punya satu field `stock`.

Karena rental memiliki kondisi:
- barang tersedia
- barang dipinjam
- barang kembali tapi kotor
- barang rusak
- barang hilang
- barang tidak layak pakai

## 3. Struktur Stok Produk

```json
{
  "totalStock": 10,
  "availableStock": 6,
  "rentedStock": 2,
  "laundryStock": 1,
  "maintenanceStock": 1,
  "lostStock": 0,
  "retiredStock": 0
}
```

Validasi:
```txt
totalStock = available + rented + laundry + maintenance + lost + retired
```

## 4. Lifecycle Status

```txt
PURCHASED
READY
RESERVED
RENTED
RETURNED_WAITING_INSPECTION
WAITING_LAUNDRY
IN_LAUNDRY
WAITING_MAINTENANCE
IN_MAINTENANCE
READY_AGAIN
LOST
RETIRED
```

## 5. Product Item Tracking

Untuk tahap enterprise, setiap item fisik punya ID.

Contoh:
```txt
BUGIS-FEMALE-L-001
BUGIS-FEMALE-L-002
```

Manfaat:
- scan QR
- tahu item mana yang rusak
- tahu item mana yang sering disewa
- tahu item mana yang hilang
- stock opname lebih akurat

## 6. Inventory Log

Setiap perubahan stok wajib tercatat:

```json
{
  "productId": "",
  "itemId": "",
  "movementType": "RENT_OUT",
  "qty": 1,
  "fromStatus": "READY",
  "toStatus": "RENTED",
  "transactionId": "",
  "actorId": "",
  "notes": "",
  "createdAt": "serverTimestamp"
}
```

## 7. Movement Types

```txt
PURCHASE
RENT_OUT
RETURN_IN
SEND_TO_LAUNDRY
LAUNDRY_DONE
SEND_TO_MAINTENANCE
MAINTENANCE_DONE
MARK_LOST
MARK_RETIRED
ADJUSTMENT
STOCK_OPNAME_CORRECTION
```

## 8. Rules

### Saat Checkout
- availableStock berkurang
- rentedStock bertambah

### Saat Return Baik
- rentedStock berkurang
- laundryStock atau availableStock bertambah sesuai workflow

### Saat Return Kotor
- rentedStock berkurang
- laundryStock bertambah

### Saat Return Rusak
- rentedStock berkurang
- maintenanceStock bertambah

### Saat Hilang
- rentedStock berkurang
- lostStock bertambah

## 9. UI Inventory

Halaman produk harus menampilkan:
- total stok
- tersedia
- disewa
- laundry
- maintenance
- hilang
- pensiun

Jangan hanya tampilkan satu angka stok.

## 10. Checklist Developer

- [ ] Struktur stok multi-status dibuat.
- [ ] Inventory log tersedia.
- [ ] Checkout update stok multi-status.
- [ ] Return update stok sesuai kondisi.
- [ ] Produk menampilkan breakdown stok.
- [ ] Validasi total stok dibuat.
- [ ] Adjustment stok wajib alasan.
- [ ] Hilang/rusak tidak otomatis tersedia.

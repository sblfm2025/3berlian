# Firestore Data Model dan Migration Strategy

## 1. Prinsip Firestore

Firestore harus disusun agar:
- transaksi lama tetap valid
- laporan tidak berubah saat produk diedit
- query efisien
- read cost terkendali
- mudah migration
- mendukung audit log

## 2. Koleksi Target

```txt
users
customers
products
product_items
transactions
transaction_items
bookings
returns
payments
financial_records
inventory_logs
activity_logs
laundry_jobs
maintenance_jobs
stock_opnames
notifications
settings
```

## 3. Products

### Document: products/{productId}

```json
{
  "name": "Baju Adat Bugis Premium",
  "category": "Bugis",
  "type": "costume",
  "gender": "female",
  "ageGroup": "adult",
  "color": ["green", "gold"],
  "sizes": ["S", "M", "L"],
  "baseRentalPrice": 150000,
  "depositDefault": 100000,
  "description": "",
  "images": [],
  "thumbnailUrl": "",
  "isPackage": false,
  "relatedProductIds": [],
  "requiredProductIds": [],
  "optionalProductIds": [],
  "totalStock": 10,
  "availableStock": 7,
  "rentedStock": 2,
  "laundryStock": 1,
  "maintenanceStock": 0,
  "lostStock": 0,
  "status": "ACTIVE",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp",
  "deleted": false
}
```

## 4. Product Items

Gunakan jika ingin melacak item fisik satu per satu.

### Document: product_items/{itemId}

```json
{
  "productId": "",
  "itemCode": "BUGIS-L-001",
  "qrCode": "",
  "barcode": "",
  "size": "L",
  "condition": "GOOD",
  "lifecycleStatus": "READY",
  "location": {
    "warehouse": "main",
    "rack": "A",
    "shelf": "2"
  },
  "lastTransactionId": "",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp",
  "deleted": false
}
```

## 5. Transactions

### Document: transactions/{transactionId}

```json
{
  "invoiceNumber": "INV-20260527-143000-A7K9",
  "customerId": "",
  "customerSnapshot": {},
  "status": "ACTIVE_RENTAL",
  "rentDate": "timestamp",
  "dueDate": "timestamp",
  "returnDate": null,
  "items": [],
  "subtotal": 0,
  "discount": 0,
  "deposit": {
    "required": 0,
    "paid": 0,
    "refunded": 0,
    "deducted": 0,
    "status": "HELD"
  },
  "payment": {
    "totalPaid": 0,
    "remaining": 0,
    "method": "cash",
    "status": "PARTIAL"
  },
  "fees": {
    "lateFee": 0,
    "damageFee": 0,
    "lostFee": 0,
    "laundryFee": 0
  },
  "audit": {
    "createdBy": "",
    "updatedBy": "",
    "createdAt": "serverTimestamp",
    "updatedAt": "serverTimestamp"
  },
  "operationToken": "",
  "deleted": false
}
```

## 6. Transaction Item Snapshot

Setiap item transaksi wajib snapshot produk.

```json
{
  "productId": "",
  "productSnapshot": {
    "name": "",
    "category": "",
    "size": "",
    "image": "",
    "price": 0
  },
  "qty": 1,
  "rentalPrice": 0,
  "deposit": 0,
  "conditionOut": "GOOD",
  "conditionReturn": null,
  "returnedQty": 0,
  "damagedQty": 0,
  "lostQty": 0,
  "laundryQty": 0,
  "notes": ""
}
```

## 7. Activity Logs

### Document: activity_logs/{logId}

```json
{
  "entityType": "transaction",
  "entityId": "",
  "action": "CREATE_TRANSACTION",
  "actorId": "",
  "actorName": "",
  "before": {},
  "after": {},
  "metadata": {
    "deviceId": "",
    "ipHint": "",
    "source": "web"
  },
  "createdAt": "serverTimestamp"
}
```

## 8. Migration Strategy

### Jangan Langsung Menghapus Field Lama
Saat menambah schema baru:
- baca field lama
- map ke field baru saat runtime
- tulis field baru pada transaksi baru
- buat migration script terpisah
- backup sebelum migration

## 9. Data Versioning

Tambahkan:
```json
{
  "schemaVersion": 2
}
```

Manfaat:
- transaksi lama tetap bisa dibaca
- migration bisa bertahap
- UI bisa menyesuaikan format data

## 10. Firestore Index Yang Dibutuhkan

Siapkan index untuk:
- transactions by status + dueDate
- transactions by rentDate
- transactions by customerId
- bookings by productId + date range
- products by category + status
- product_items by lifecycleStatus + location
- activity_logs by entityType + entityId

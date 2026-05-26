# Finance, Deposit, Refund, dan Reconciliation

## 1. Tujuan

Keuangan rental harus jelas:
- uang sewa
- deposit
- denda
- refund
- piutang
- kas masuk
- kas keluar

## 2. Payment Status

```txt
UNPAID
PARTIAL
PAID
REFUNDED
OVERPAID
```

## 3. Deposit Status

```txt
NOT_REQUIRED
REQUIRED
HELD
PARTIALLY_REFUNDED
REFUNDED
DEDUCTED
FORFEITED
```

## 4. Financial Record

```json
{
  "type": "RENTAL_PAYMENT",
  "transactionId": "",
  "customerId": "",
  "amount": 0,
  "method": "cash",
  "direction": "IN",
  "category": "rental",
  "notes": "",
  "createdBy": "",
  "createdAt": "serverTimestamp"
}
```

## 5. Financial Types

```txt
RENTAL_PAYMENT
DEPOSIT_IN
DEPOSIT_REFUND
DEPOSIT_DEDUCTION
LATE_FEE
DAMAGE_FEE
LOST_FEE
DISCOUNT
EXPENSE
MANUAL_ADJUSTMENT
```

## 6. Daily Cash Closing

Kasir harus bisa tutup kas harian.

Data:
- total cash
- total transfer
- total QRIS
- deposit masuk
- refund keluar
- denda masuk
- selisih kas
- catatan kasir

## 7. Deposit Flow

### Saat Checkout
- deposit required
- deposit paid
- status HELD

### Saat Return
- hitung denda
- hitung damage/lost fee
- potong deposit jika perlu
- refund sisa
- jika kurang, buat outstanding balance

## 8. Reconciliation

Owner harus bisa melihat:
- uang masuk hari ini
- deposit yang masih tertahan
- refund yang sudah keluar
- transaksi belum lunas
- selisih kas

## 9. Checklist Developer

- [ ] Financial records tersedia.
- [ ] Deposit lifecycle tersedia.
- [ ] Refund tercatat.
- [ ] Denda masuk financial record.
- [ ] Daily cash closing tersedia.
- [ ] Outstanding balance tersedia.
- [ ] Owner finance dashboard tersedia.

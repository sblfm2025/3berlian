# TRANSACTION SAFETY

## Objective
Menjamin checkout, return, dan delete transaction aman serta stok tetap konsisten.

## Current Risks
- Transaksi tersimpan tetapi stok gagal terpotong.
- Sebagian item stok berubah, sebagian gagal.
- Return mengubah status tetapi stok belum kembali.
- Delete transaksi aktif bisa membuat stok tidak konsisten.

## Scope
Business logic safety.

## Files Likely Involved
- `src/services/firestoreData.js`
- transaction service files
- return service files

## Do Not Mix With UI Refactor
Kerjakan di branch terpisah:
```txt
feature/transaction-safety
```

## Required Implementation

### Checkout
Use Firestore transaction/batch:
1. validate product stock
2. create transaction
3. decrement stock for each product
4. write audit log
5. commit atomically

### Return
Use atomic operation:
1. validate active transaction
2. update status to returned/completed
3. restore stock
4. add penalty/payment info
5. write audit log

### Delete Active Transaction
Rules:
1. check transaction status
2. restore stock if active
3. write delete audit log
4. delete/archive transaction

## Audit Log Schema
Suggested:
```json
{
  "entityType": "transaction",
  "entityId": "TRX-001",
  "action": "checkout | return | delete | edit",
  "operatorId": "USER_ID",
  "before": {},
  "after": {},
  "createdAt": "serverTimestamp"
}
```

## Error Handling
If operation fails:
- show user-safe error
- do not partially update UI as success
- keep transaction state unchanged
- log error if possible

## QA Checklist
- Checkout with multiple items.
- Checkout when one item stock is insufficient.
- Return with penalty.
- Delete active transaction.
- Simulate network failure if possible.

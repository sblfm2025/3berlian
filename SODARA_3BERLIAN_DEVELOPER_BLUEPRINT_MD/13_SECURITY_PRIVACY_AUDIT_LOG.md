# Security, Privacy, dan Audit Log Selain Login

## 1. Fokus

Dokumen ini tidak membahas akun/login secara detail, tetapi membahas keamanan data, transaksi, dan akses operasional.

## 2. Data Sensitif

Data berikut harus dilindungi:
- nomor HP pelanggan
- alamat
- identitas
- bukti transfer
- foto dokumen
- deposit
- transaksi
- catatan risiko pelanggan

## 3. Masking

Tampilkan identitas seperti:
```txt
7309********1234
```

Nomor HP bisa ditampilkan sebagian pada laporan umum.

## 4. Soft Delete

Jangan hard delete:
- transaksi
- pelanggan
- produk
- laporan keuangan

Gunakan:
```json
{
  "deleted": true,
  "deletedAt": "",
  "deletedBy": "",
  "deleteReason": ""
}
```

## 5. Audit Log Wajib

Catat:
- create transaction
- edit transaction
- cancel transaction
- delete transaction
- refund deposit
- override denda
- edit harga
- edit stok
- stock adjustment
- customer risk update

## 6. Audit Log Data

```json
{
  "entityType": "",
  "entityId": "",
  "action": "",
  "actorId": "",
  "actorName": "",
  "before": {},
  "after": {},
  "reason": "",
  "createdAt": "serverTimestamp"
}
```

## 7. Permission Concept

Role ideal:
- owner
- admin
- kasir
- gudang
- laundry
- viewer

Walau login diskip, struktur data harus siap role-based access.

## 8. Approval Workflow

Aksi yang sebaiknya butuh approval:
- delete transaksi
- edit transaksi completed
- override denda besar
- refund deposit besar
- adjustment stok besar

## 9. Checklist Developer

- [ ] Soft delete tersedia.
- [ ] Audit log tersedia.
- [ ] Sensitive masking tersedia.
- [ ] Delete wajib reason.
- [ ] Override wajib reason.
- [ ] Data lama tidak hilang.
- [ ] Role concept disiapkan.
- [ ] Approval workflow disiapkan untuk tahap lanjut.

# Customer Profile, Risk Score, dan Measurement

## 1. Tujuan

Pelanggan bukan hanya nama dan nomor HP.

Sistem harus membantu:
- mengenali pelanggan loyal
- mencegah pelanggan bermasalah
- menyimpan ukuran badan
- mempercepat fitting
- mengurangi salah ukuran

## 2. Customer Data

```json
{
  "fullName": "",
  "phone": "",
  "secondaryPhone": "",
  "address": "",
  "identityNumberMasked": "",
  "identityDocumentUrl": "",
  "customerType": "REGULAR",
  "riskLevel": "NORMAL",
  "notes": "",
  "measurement": {},
  "stats": {},
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp",
  "deleted": false
}
```

## 3. Measurement Profile

```json
{
  "heightCm": 0,
  "weightKg": 0,
  "chestCm": 0,
  "waistCm": 0,
  "hipCm": 0,
  "shoulderCm": 0,
  "headCm": 0,
  "shoeSize": "",
  "preferredSize": "",
  "notes": ""
}
```

## 4. Customer Stats

```json
{
  "totalTransactions": 0,
  "totalRevenue": 0,
  "lateReturns": 0,
  "damagedItems": 0,
  "lostItems": 0,
  "cancelledBookings": 0,
  "lastTransactionAt": ""
}
```

## 5. Risk Level

```txt
LOW
NORMAL
ATTENTION
HIGH_RISK
BLOCKED
```

## 6. Risk Rules

Contoh:
- lateReturns > 3 → ATTENTION
- lostItems > 0 → HIGH_RISK
- unpaidBalance > 0 → ATTENTION
- owner manual block → BLOCKED

## 7. Privacy Rules

Data sensitif harus:
- tidak tampil penuh di laporan umum
- identity number dimasking
- upload dokumen dibatasi akses
- delete customer sebaiknya soft delete

## 8. UI Customer

Halaman customer harus punya:
- profil
- riwayat transaksi
- ukuran badan
- catatan risiko
- deposit tertahan
- item belum kembali
- attachment

## 9. Checklist Developer

- [ ] Measurement profile tersedia.
- [ ] Customer stats dihitung.
- [ ] Risk level tersedia.
- [ ] Sensitive data dimasking.
- [ ] Customer history tersedia.
- [ ] Customer soft delete tersedia.
- [ ] Customer notes tersedia.

# 06 — Stabilisasi Data Checkout, Stok, dan Nota

## Tujuan

Merapikan data tanpa membuat update terlalu besar. Fokus hanya pada field yang diperlukan untuk menyelesaikan masalah kasir dan nota.

## Jangan lakukan sekarang

Jangan migrasi besar-besaran.

Jangan mengubah semua struktur database sekaligus.

Jangan rewrite seluruh transaction service jika terlalu berisiko dalam satu update.

## Yang wajib dilakukan sekarang

Tambahkan/rapikan field transaksi:

```js
{
  id,
  invoiceNumber,
  qrPayload,

  customer: {
    id,
    name,
    phone,
    address
  },

  items: [
    {
      productId,
      productName,
      size,
      color,
      qty,
      rentPrice,
      deposit,
      subtotal
    }
  ],

  subtotal,
  deposit,
  discount,
  total,

  paymentMethod,
  paymentStatus,
  paidAmount,
  changeAmount,

  status,
  rentedAt,
  returnDate,

  createdAt,
  updatedAt
}
```

## Status transaksi standar

Gunakan status ini untuk data baru:

```txt
rented
partially_returned
returned
overdue
void
```

## Mapper untuk data lama

Jika data lama memakai:

```txt
disewa
completed
CANCELLED
```

Mapping saat read:

```js
function normalizeTransactionStatus(status) {
  if (status === "disewa") return "rented"
  if (status === "completed") return "returned"
  if (status === "CANCELLED") return "void"
  return status || "rented"
}
```

Jangan langsung migrasi semua data jika belum backup.

## Snapshot item wajib

Item transaksi tidak boleh hanya menyimpan productId.

Harus simpan snapshot:

- nama produk
- ukuran
- warna
- harga saat transaksi
- deposit saat transaksi

Alasan: jika produk diedit, nota lama tetap benar.

## QR payload wajib untuk transaksi baru

Saat membuat transaksi:

```js
const transactionRef = doc(collection(db, "transactions"))
const qrPayload = `3BTRX:${transactionRef.id}`
```

Simpan:

```js
qrPayload
```

## Validasi stok

Untuk update ini, minimal pastikan:

- qty tidak boleh melebihi stok lokal saat cart
- checkout tetap cek ulang stok di proses simpan
- jangan simpan transaksi jika stok tidak cukup

Jika service atomic belum siap, buat task terpisah setelah patch kasir selesai.

## Prioritas keselamatan update

Urutan yang aman:

1. Perbaiki flow UI kasir.
2. Perbaiki cart editable.
3. Perbaiki payment panel.
4. Tambahkan QR pada nota.
5. Sambungkan scan nota ke transaksi.
6. Baru lanjut atomic checkout jika belum selesai.

## Acceptance criteria

- Transaksi baru punya `qrPayload`.
- Nota baru mencetak QR.
- Data transaksi menyimpan snapshot ukuran/harga/deposit.
- Status baru konsisten.
- Data lama tetap bisa dibaca.

# 04 — Fix Payment, Checkout, dan Validasi

## Masalah

Payment panel terasa muncul terlambat atau tersembunyi karena flow stepper. Validasi terlalu dini membuat kasir tidak bisa bekerja bebas.

## Target

Payment panel selalu bisa diakses setelah cart memiliki item. Validasi lengkap hanya terjadi saat klik checkout.

## File target

```txt
src/features/rental/components/CheckoutPanel.jsx
src/features/rental/hooks/useRentalCheckout.js
src/features/rental/hooks/usePaymentCalculation.js
src/features/rental/utils/rentalValidation.js
```

## Payment state final

Gunakan state pembayaran seperti ini:

```js
{
  paymentMethod: "cash", // cash | transfer | qris | mixed
  cashAmount: 0,
  transferAmount: 0,
  qrisAmount: 0,
  discount: 0,
  depositAmount: 0,
  returnDate: "",
  note: ""
}
```

## PaymentPanel harus selalu bisa dibuka

Syarat hanya:

```js
cartItems.length > 0
```

Jangan syaratkan:

- customer lengkap
- returnDate lengkap
- activeStep tertentu

## Field wajib di PaymentPanel

- metode pembayaran
- tanggal kembali
- deposit
- diskon
- uang diterima jika cash
- kembalian
- catatan transaksi

## Perhitungan pembayaran

```js
subtotal = total nilai sewa item
deposit = deposit item/global
discount = diskon transaksi
grandTotal = subtotal + deposit - discount
paidAmount = cashAmount + transferAmount + qrisAmount
change = Math.max(0, paidAmount - grandTotal)
remaining = Math.max(0, grandTotal - paidAmount)
```

## Payment status

```js
paymentStatus =
  remaining === 0 ? "paid" :
  paidAmount > 0 ? "partial" :
  "unpaid"
```

## Validasi checkout

Validasi hanya pada `handleCheckout()`.

Wajib validasi:

- cart tidak kosong
- setiap item punya productId
- setiap item punya qty > 0
- setiap item punya size jika produk membutuhkan ukuran
- customer name wajib
- customer phone wajib
- returnDate wajib
- paymentMethod wajib
- paidAmount cukup jika kebijakan aplikasi mewajibkan lunas
- stok final cukup dari Firestore transaction

## Jangan blokir saat edit

Jangan blokir saat:

- customer belum lengkap
- returnDate kosong
- pembayaran belum dipilih
- uang belum cukup

Tampilkan warning/checklist saja.

## Output validasi

Gunakan error object:

```js
{
  customerName: "Nama pelanggan wajib diisi",
  customerPhone: "Nomor HP pelanggan wajib diisi",
  returnDate: "Tanggal kembali wajib diisi",
  payment: "Pembayaran belum cukup"
}
```

Tampilkan di `CheckoutSummary`.

## CheckoutSummary

Komponen ini menampilkan:

- subtotal
- deposit
- diskon
- total
- dibayar
- kurang/kembalian
- checklist kelengkapan
- tombol checkout

Tombol checkout boleh tetap aktif, tetapi jika diklik dan validasi gagal, tampilkan error list.

## Jangan pakai alert

Hapus:

```js
alert(...)
```

Ganti:

```js
setCheckoutErrors(errors)
onNotify?.({ type: "error", title: "Checkout belum lengkap", message: "Periksa checklist transaksi." })
```

## Acceptance criteria

- Payment panel bisa dibuka meskipun pelanggan kosong.
- Kasir bisa pilih cash/transfer/qris/mixed sebelum isi pelanggan.
- Checkout gagal dengan daftar error, bukan alert.
- Total, deposit, kembalian realtime.
- Checkout sukses hanya jika validasi lengkap.

# 03 — Fix Cart, Varian Ukuran, Qty, Harga, dan Deposit

## Masalah

Setelah update, kasir memilih produk tetapi tidak bisa langsung mengatur ukuran, qty, pembayaran, dan detail item. Untuk rental pakaian adat, ukuran dan varian adalah bagian utama transaksi.

## Target

Cart menjadi pusat kontrol transaksi.

Setiap item cart harus bisa diedit:

- ukuran
- warna/varian jika ada
- qty
- harga sewa
- deposit
- catatan item
- hapus item

## Struktur cart item final

Gunakan struktur ini di state cart:

```js
{
  cartItemId: "local-id",
  productId: "product-id",
  productName: "Baju Adat Bugis",
  sku: "BUGIS-001",

  size: "M",
  color: "Merah",
  variantId: "optional",

  qty: 1,
  rentPrice: 150000,
  deposit: 50000,
  discount: 0,

  subtotal: 150000,
  note: ""
}
```

## Aturan product click

### Produk tanpa varian

Langsung masuk cart.

```js
addItem(product)
```

### Produk dengan varian/ukuran

Jangan langsung masuk cart default.

Tampilkan:

```jsx
<VariantPickerModal />
```

Field minimal:

- ukuran
- qty
- stok tersedia ukuran tersebut
- tombol tambah

## VariantPickerModal

Buat atau rapikan:

```txt
src/features/rental/components/VariantPickerModal.jsx
```

Props:

```js
{
  product,
  open,
  onClose,
  onConfirm
}
```

Output `onConfirm`:

```js
{
  productId,
  size,
  color,
  qty,
  rentPrice,
  deposit
}
```

## Jika data produk belum punya variants

Jika produk saat ini hanya punya field `size`, gunakan fallback:

```js
const variants = product.variants?.length
  ? product.variants
  : [{ size: product.size || "Default", stockAvailable: product.availableStock || product.stock || 0 }]
```

## RentalCart wajib editable

Komponen cart item wajib punya kontrol:

```txt
Nama produk
Ukuran dropdown / badge editable
Qty -/+
Harga sewa input optional
Deposit input optional
Subtotal
Hapus
```

## Qty control

Saat qty dinaikkan:

- cek stok lokal untuk warning UX
- jangan checkout jika stok final tidak cukup
- jangan pakai alert
- tampilkan toast atau inline warning

## Harga dan deposit

Jika kasir boleh edit harga/deposit:

- input harus numeric
- total realtime
- audit saat checkout menyimpan snapshot harga final

Jika kasir tidak boleh edit harga/deposit:

- tampilkan read-only
- deposit global tetap bisa diedit di payment panel

## Total realtime

Setiap perubahan item harus menghitung ulang:

```js
subtotal = items.reduce((sum, item) => sum + item.qty * item.rentPrice - item.discount, 0)
depositTotal = items.reduce((sum, item) => sum + item.qty * item.deposit, 0)
grandTotal = subtotal + depositTotal - transactionDiscount
```

## Jangan gunakan alert

Hapus pola:

```js
alert("stok habis")
```

Ganti:

```js
onNotify?.({ type: "warning", title: "Stok tidak cukup", message: "..." })
```

atau inline:

```txt
Stok tersedia hanya 1.
```

## Acceptance criteria

- Klik produk berukuran membuka pilihan ukuran atau masuk cart dengan ukuran yang bisa diedit.
- Cart item bisa ubah qty.
- Cart item bisa ubah ukuran jika tersedia.
- Total berubah realtime.
- Deposit terlihat dan bisa dihitung.
- Tidak ada alert browser.

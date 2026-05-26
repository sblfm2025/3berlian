# 02 — Fix Flow Kasir: Guided POS, Bukan Wizard

## Masalah

Saat ini flow kasir terasa seperti wizard:

1. Pilih produk.
2. Dipaksa lanjut step berikutnya.
3. Baru bisa lanjut ke pelanggan/pembayaran.
4. Kasir tidak bebas mengatur ukuran, jenis pembayaran, dan detail transaksi.

Ini tidak cocok untuk POS.

## Target

Ubah menjadi **Guided POS**:

- POS tetap cepat dan bebas.
- Checklist tetap memberi arahan.
- Tidak ada step yang mengunci.
- Semua panel utama bisa dibuka kapan saja.
- Checkout tetap divalidasi ketat.

## File target

Prioritas cek dan ubah:

```txt
src/pages/RentPage.jsx
src/features/rental/hooks/useRentalCart.js
src/features/rental/hooks/useRentalCheckout.js
src/features/rental/components/ProductCatalog.jsx
src/features/rental/components/CheckoutPanel.jsx
src/features/rental/components/RentalMobileBar.jsx
```

## Perubahan wajib di RentPage

### 1. Jangan gunakan `activeStep` sebagai pengunci

Jika ada:

```js
const [activeStep, setActiveStep] = useState(1)
```

Boleh tetap dipakai hanya untuk:

- tab aktif mobile
- scroll target
- highlight panel

Tidak boleh dipakai untuk:

- menyembunyikan cart
- menyembunyikan payment
- memblokir customer panel
- memaksa "langkah berikutnya"

### 2. Hapus konsep "Langkah Berikutnya"

Cari teks:

```txt
Langkah berikutnya
```

Ganti dengan:

```txt
Checklist Transaksi
```

### 3. Panel utama harus tersedia

Di desktop, susun:

```txt
ProductCatalog | RentalCart | CustomerPaymentColumn
```

Minimal:

```jsx
<div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_0.9fr]">
  <ProductCatalog />
  <RentalCart />
  <aside className="space-y-4">
    <CustomerPanel />
    <PaymentPanel />
    <CheckoutSummary />
  </aside>
</div>
```

### 4. Mobile memakai tab bebas

Mobile boleh memakai tab:

- Produk
- Cart
- Pelanggan
- Bayar

Tetapi semua tab boleh dibuka kapan saja.

```js
const mobileTabs = ["products", "cart", "customer", "payment"]
```

Jangan validasi sebelum pindah tab.

## Aturan validasi

Validasi hanya saat:

```txt
klik Checkout
```

Bukan saat:

- memilih produk
- membuka cart
- membuka pembayaran
- mengubah metode bayar
- membuka panel pelanggan
- berpindah tab mobile

## Perilaku setelah klik produk

Saat produk diklik:

1. Jika produk punya varian/ukuran, tampilkan variant picker.
2. Jika tidak, langsung masuk cart.
3. Cart/mobile bar diperbarui.
4. Jangan paksa user ke step berikutnya.
5. Boleh buka cart drawer, tetapi tidak wajib.

## Checklist transaksi

Checklist tidak mengunci. Checklist hanya menampilkan status.

Contoh data:

```js
const checklist = [
  { key: "items", label: "Produk", done: cartItems.length > 0 },
  { key: "customer", label: "Pelanggan", done: Boolean(customer.name && customer.phone) },
  { key: "returnDate", label: "Tanggal kembali", done: Boolean(returnDate) },
  { key: "payment", label: "Pembayaran", done: Boolean(paymentMethod) },
]
```

## UI checklist

Tampilkan sederhana:

```txt
✓ Produk
! Pelanggan
! Tanggal kembali
✓ Pembayaran
```

Jangan tampilkan sebagai instruksi wajib berurutan.

## Acceptance criteria

- Kasir bisa membuka PaymentPanel walau pelanggan belum lengkap.
- Kasir bisa membuka CustomerPanel walau cart belum lengkap.
- Kasir bisa mengubah cart tanpa klik next.
- Tidak ada teks "Langkah berikutnya".
- Tidak ada tombol next step wajib.
- Checkout tetap gagal jika data wajib belum lengkap.

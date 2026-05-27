# 02 — Instruksi Teknis Update POS Mobile First

## Tujuan
Merapikan halaman `Sewa / Terminal Penyewaan` agar benar-benar berfungsi sebagai POS cepat, bukan halaman katalog panjang. Fokus utama adalah smartphone berbagai tipe.

## Target UX
Kasir harus bisa menyelesaikan transaksi normal dengan alur:

1. Scan/cari produk.
2. Tambah item.
3. Lihat total berjalan.
4. Isi/pilih pelanggan.
5. Pilih pembayaran.
6. Simpan/cetak nota.

## Struktur komponen yang disarankan
Jika belum ada, pecah halaman sewa menjadi komponen berikut:

```txt
src/features/rental/
  components/
    RentalPageShell.jsx
    PosSearchScanBar.jsx
    PosStepIndicator.jsx
    ProductQuickFilters.jsx
    ProductFilterDrawer.jsx
    ProductCompactCard.jsx
    MobileStickyCartBar.jsx
    DesktopCheckoutPanel.jsx
    CustomerStepPanel.jsx
    PaymentStepPanel.jsx
    RentalReviewPanel.jsx
  hooks/
    useRentalProducts.js
    useRentalCart.js
    useRentalFilters.js
    useRentalCheckout.js
```

Jangan memindahkan logika data besar sekaligus jika berisiko. Bungkus dulu UI lama secara bertahap.

## Layout mobile final
Urutan layar mobile:

```txt
[App Header]
[Page title compact]
[Search / QR scan bar]
[Stepper compact]
[Quick filters horizontal]
[Product list compact]
[Mobile sticky cart bar]
[Bottom navigation]
```

## Perubahan wajib pada header halaman
Saat ini header biru cukup besar. Untuk halaman POS, header harus lebih hemat ruang.

Rekomendasi:
- Logo + nama aplikasi tetap.
- Search global boleh tetap, tetapi di halaman Sewa jangan mendominasi dua kali.
- Title `Terminal penyewaan` cukup compact.
- Subteks maksimal satu baris.

## QR/Barcode card
Card pemindaian QR/Barcode bagus, tetapi terlalu besar untuk mobile.

Implementasi:
- Pada state awal, tampilkan card ringkas.
- Setelah user mulai mengetik/scan atau ada item di cart, ubah menjadi compact bar.
- Tambahkan tombol `Scan` atau `Proses` yang jelas.

State:
```js
const shouldCollapseScanner = cartItems.length > 0 || searchQuery.length > 0;
```

## Filter kategori
Masalah: chip kategori terlalu banyak dan membanjiri layar.

Solusi:
- Tampilkan maksimal 6 filter utama.
- Sisanya masuk drawer.

Contoh:
```js
const primaryFilters = ['Semua', 'Bugis', 'Jilbab', 'Aksesoris', 'Anak', 'Lainnya'];
```

Rules:
- `Semua` selalu pertama.
- Filter yang paling sering dipakai boleh diurutkan berdasarkan transaksi terbanyak jika data tersedia.
- Semua kategori panjang seperti `Beragam macam jenis 17 pasang lengkap 2pcs cacat` tidak boleh langsung tampil sebagai chip utama.

## ProductCompactCard
Card produk mobile harus hemat ruang.

Spesifikasi:
- Tinggi target: 86–110px.
- Gambar: 56–64px, rounded.
- Nama produk: maksimal 2 baris.
- Harga: tebal, warna aksen.
- Status: kecil, `SIAP DISEWA`.
- Tombol plus/minus: 40–44px.
- Jika item sudah dipilih, tampilkan quantity jelas.

Struktur:
```jsx
<article className="product-card compact">
  <img />
  <div className="product-info">
    <div className="chips-mini">Kategori · Size</div>
    <strong>Nama produk</strong>
    <span>SIAP DISEWA</span>
    <b>Rp 10.000</b>
  </div>
  <QuantityControl />
</article>
```

## Mobile Sticky Cart Bar
Ini wajib. Tanpa sticky cart, halaman POS terasa seperti katalog biasa.

Spesifikasi:
- Muncul jika `cartItems.length > 0`.
- Posisi fixed di bawah, di atas bottom nav.
- Isi: jumlah item, total, tombol `Lanjut`.
- Jangan menutupi bottom nav.

Contoh:
```jsx
{cartItems.length > 0 && (
  <div className="fixed left-3 right-3 bottom-[76px] z-40 rounded-2xl bg-slate-950 text-white shadow-xl">
    <div className="flex items-center justify-between gap-3 p-3">
      <div>
        <p className="text-xs opacity-80">Keranjang</p>
        <p className="font-bold">{totalItems} item · {formatCurrency(total)}</p>
      </div>
      <button className="h-11 rounded-xl bg-blue-600 px-4 font-bold">Lanjut</button>
    </div>
  </div>
)}
```

## Stepper transaksi
Stepper 1–4 sudah bagus, tetapi perlu lebih compact di mobile.

Label:
1. Katalog
2. Keranjang
3. Pelanggan
4. Bayar

Rules:
- Stepper tidak boleh lebih tinggi dari 64px.
- Di layar kecil, label boleh disingkat.
- Step aktif harus jelas.

## Desktop POS
Desktop tetap memakai dua kolom:
- Kolom kiri: katalog.
- Kolom kanan: checkout sticky.

Masalah chip kategori desktop juga harus diperbaiki.

Solusi:
- Gunakan `FilterPanel` atau `FilterPopover`.
- Area utama jangan diisi puluhan chip.
- Tambahkan search kategori dalam filter drawer.

## Empty state panel kanan desktop
Saat cart kosong, jangan biarkan panel kanan terasa kosong.

Isi yang disarankan:
```txt
Mulai transaksi
1. Scan QR/barcode kostum, atau
2. Cari produk di katalog, lalu klik tambah.

Shortcut:
[ Fokus ke scan ] [ Lihat produk tersedia ]
```

## Validasi UX POS
Wajib diuji:
- Tambah 1 item.
- Tambah 3 item berbeda.
- Kurangi quantity.
- Hapus item.
- Search produk.
- Filter kategori.
- Lanjut ke pelanggan.
- Kembali ke katalog tanpa kehilangan cart.
- Checkout berhasil.
- Cart kosong setelah transaksi selesai.

## Definisi selesai
- Di HP 360px, kasir tidak perlu scroll jauh untuk memahami status keranjang.
- Item terpilih selalu terlihat melalui sticky cart.
- Filter kategori tidak lagi membanjiri layar.
- Desktop tetap nyaman dan tidak kehilangan fitur.

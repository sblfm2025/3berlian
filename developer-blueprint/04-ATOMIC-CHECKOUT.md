# Atomic Checkout

Checkout wajib memakai Firestore runTransaction.

Alur:
1. Validasi payload.
2. Ambil ulang produk dari Firestore.
3. Cek stok terbaru.
4. Generate invoice di dalam transaction.
5. Simpan transaksi.
6. Update stok.
7. Upsert customer.
8. Simpan audit log.

Larangan:
- jangan generate invoice di UI
- jangan percaya stok dari React state
- jangan simpan transaksi jika stok gagal

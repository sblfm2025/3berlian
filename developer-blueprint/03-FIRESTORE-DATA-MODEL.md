# Firestore Data Model

Koleksi utama:
- products
- transactions
- customers
- auditLogs
- settings
- counters
- reports_cache

Produk wajib memakai struktur stok:
- stockTotal
- stockAvailable
- stockRented
- stockLaundry
- stockDamaged

Transaksi wajib menyimpan snapshot item agar invoice lama tidak rusak jika produk diedit.

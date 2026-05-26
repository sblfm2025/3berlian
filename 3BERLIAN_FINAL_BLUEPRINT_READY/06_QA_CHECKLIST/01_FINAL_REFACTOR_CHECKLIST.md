# FINAL REFACTOR CHECKLIST

## UI Checklist
- Tidak ada giant cards di mobile.
- Tidak ada font mobile yang terlalu besar.
- Spacing mobile lebih compact.
- Radius konsisten.
- Shadow tidak berlebihan.
- Visual hierarchy jelas.
- Primary action tetap menonjol.

## Mobile Checklist
- Tidak ada horizontal overflow.
- Bottom nav stabil.
- Safe area aman.
- Keyboard tidak menutup input penting.
- Minimal 4 produk terlihat di RentPage.
- Filter tidak memakan banyak ruang.

## Business Flow Checklist
- Checkout berhasil.
- Tambah/hapus item cart benar.
- Stok berkurang benar.
- Return berhasil.
- Stok kembali benar.
- Reports tetap menghitung benar.
- Export tetap berjalan.

## Firebase Checklist
- Tidak ada listener global yang tidak perlu.
- Listener unsubscribe.
- Reports siap date range.
- Transaction safety menggunakan atomic operation saat sudah difactor.

## Codex Checklist
- Satu prompt satu scope.
- File target jelas.
- Files to avoid jelas.
- Jangan campur UI dan Firebase refactor.
- Commit per tahap.

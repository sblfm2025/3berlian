# SODARA / 3 BERLIAN — README UTAMA BLUEPRINT DEVELOPER

## Tujuan Dokumen

Blueprint ini disusun untuk developer yang mengerjakan aplikasi **SODARA / 3 Berlian** melalui **Antigravity IDE / Gemini / AI coding assistant**.

Aplikasi diarahkan menjadi:

> Platform Operasional Sanggar Budaya & Rental Adat Nusantara Modern.

Bukan sekadar POS rental generik.

## Prinsip Utama

Developer wajib menjaga:
- stabilitas transaksi
- integritas stok
- riwayat transaksi lama
- keamanan data pelanggan
- performa mobile
- workflow kasir nyata
- backward compatibility
- struktur kode yang mudah dikembangkan

## Urutan Eksekusi Wajib

Jangan langsung mengerjakan UI besar-besaran sebelum core sistem stabil.

Urutan prioritas:

1. Stabilkan arsitektur dan pecah kode besar.
2. Stabilkan transaksi, stok, invoice, dan return.
3. Tambahkan audit log dan soft delete.
4. Perbaiki laporan agar tidak salah data.
5. Tambahkan booking, partial return, laundry, dan maintenance.
6. Tambahkan QR/barcode dan stock opname.
7. Finalisasi UI/UX premium dan branding budaya.

## Aturan Untuk Antigravity IDE / Gemini

AI coding assistant dilarang:
- rewrite total aplikasi tanpa alasan teknis kuat
- mengubah Firestore schema tanpa migration plan
- menghapus field lama
- mengubah invoice lama
- memindahkan logic bisnis ke UI component
- membuat fitur baru tanpa acceptance criteria
- mengorbankan mobile UX

AI coding assistant wajib:
- bekerja incremental
- membuat commit kecil dan terarah
- membuat fallback aman
- menulis komentar pada logic kompleks
- membuat checklist setelah setiap perubahan
- menjaga mode demo tetap berjalan
- melakukan review risiko sebelum patch

## Struktur File Blueprint

Gunakan dokumen berikut secara berurutan:

1. `01_PRODUCT_VISION_SCOPE.md`
2. `02_ARCHITECTURE_REFACTOR_PLAN.md`
3. `03_FIRESTORE_DATA_MODEL.md`
4. `04_TRANSACTION_RENTAL_CORE.md`
5. `05_INVENTORY_LIFECYCLE.md`
6. `06_RETURN_PARTIAL_LAUNDRY_MAINTENANCE.md`
7. `07_BOOKING_CALENDAR_CONFLICT.md`
8. `08_CUSTOMER_PROFILE_RISK_MEASUREMENT.md`
9. `09_FINANCE_DEPOSIT_RECONCILIATION.md`
10. `10_REPORTING_ANALYTICS_DASHBOARD.md`
11. `11_UI_UX_MOBILE_DESIGN_SYSTEM.md`
12. `12_PWA_OFFLINE_RESILIENCE.md`
13. `13_SECURITY_PRIVACY_AUDIT_LOG.md`
14. `14_QR_BARCODE_STOCK_OPNAME.md`
15. `15_TESTING_QA_ACCEPTANCE_CRITERIA.md`
16. `16_ROADMAP_PRIORITY_CHECKLIST.md`
17. `17_DO_NOT_BREAK_RULES.md`
18. `18_DEVELOPER_EXECUTION_PROMPTS.md`

## Definisi Selesai Secara Umum

Satu pekerjaan dianggap selesai jika:
- tidak merusak flow lama
- mobile tetap nyaman
- data lama tetap terbaca
- error state tersedia
- loading state tersedia
- audit log tercatat untuk aksi penting
- ada validasi input
- ada acceptance criteria
- diuji pada skenario normal dan edge-case

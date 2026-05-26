# 3 BERLIAN FINAL BLUEPRINT — READY FOR VS/CODEX

## Tujuan Paket
Paket ini adalah gabungan final dari seluruh diskusi pengembangan aplikasi 3 Berlian, disusun ulang agar:
- tidak tumpang tindih
- siap dipakai developer
- siap dipakai VS/Codex
- modular
- bertahap
- aman untuk refactor
- tidak mencampur UI refactor dengan perubahan business logic

## Arah Produk
3 Berlian tidak hanya diarahkan sebagai aplikasi rental pakaian adat, tetapi sebagai fondasi **Sanggar Management Super App**.

Fase sekarang tetap fokus pada:
1. UI/UX foundation
2. mobile density
3. visual hierarchy
4. stabilitas halaman inti
5. transaction safety
6. Firebase scalability
7. persiapan arsitektur multi-service

## Cara Pakai
Gunakan dokumen secara berurutan:

1. Baca `00_MASTER_DIRECTION`
2. Terapkan `01_UI_SYSTEM`
3. Refactor halaman di `02_PAGE_REFACTOR`
4. Rapikan arsitektur di `03_SYSTEM_ARCHITECTURE`
5. Perbaiki mobile/PWA di `04_PWA_MOBILE`
6. Siapkan multi-service lewat `05_MULTI_SERVICE`
7. Jalankan checklist di `06_QA_CHECKLIST`
8. Ikuti workflow Codex di `07_CODEX_WORKFLOW`

## Aturan Utama
- Jangan jalankan semua dokumen sekaligus.
- Satu dokumen = satu branch atau satu tahap refactor.
- Jangan mencampur UI cleanup dengan perubahan Firebase logic.
- Jangan mengubah login/account dulu.
- Jangan mengubah struktur data produksi tanpa migrasi dan backup.

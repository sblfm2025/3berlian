# Phase 8 Scale Operations

Dokumen ini menutup persiapan scale tanpa mengubah alur data produksi, transaksi, booking, atau modul operasional yang sudah berjalan.

## Monitoring

- Aplikasi memiliki utilitas monitoring lokal di `src/utils/monitoring.js`.
- Runtime error dan unhandled promise rejection ditangkap lewat `src/hooks/useAppMonitoring.js`.
- Event monitoring disimpan terbatas di `localStorage` dengan maksimum 50 event terakhir.
- Tidak ada pengiriman data ke layanan eksternal. Jika nanti memakai Sentry, Logtail, Firebase Crashlytics, atau provider lain, adapter remote dapat ditambahkan dari layer ini.

## Backup / Export

- Jalankan `npm run backup` untuk membuat snapshot proyek di folder `backups/project-backup-<timestamp>`.
- Snapshot mencakup source, konfigurasi Firebase, script, blueprint, dan manifest berisi branch, commit, status git, serta jumlah file.
- Folder `backups/` sengaja tidak masuk git karena berisi hasil export lokal.

## Multi Branch Preparation

- `master`: jalur stabil untuk rilis yang sudah lolos lint dan build.
- `staging`: jalur uji sebelum rilis operasional.
- `feature/<nama-fitur>`: perubahan fitur yang masih sempit ruang lingkupnya.
- `fix/<nama-masalah>`: perbaikan bug spesifik.
- Rilis operasional disarankan memakai tag `release/YYYY-MM-DD` setelah `npm run lint`, `npm run build`, dan backup selesai.

## API Integration Preparation

- Kerangka integrasi tersedia di `src/services/integrationGateway.js`.
- Adapter awal bersifat no-op sehingga tidak melakukan network request.
- Target integrasi yang disiapkan: WhatsApp, printer, payment gateway, dan accounting export.
- Integrasi nyata harus melewati adapter ini agar modul UI dan transaksi tidak bergantung langsung pada vendor eksternal.

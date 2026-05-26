# PWA, Offline Mode, dan Resilience

## 1. Tujuan

Aplikasi harus tetap aman saat:
- internet lambat
- Firebase timeout
- browser refresh
- tab tertutup
- double click
- user offline

## 2. PWA Requirement

- manifest valid
- icon lengkap
- install prompt
- service worker
- offline fallback
- update prompt

## 3. Offline Indicator

UI harus menampilkan:
- online
- offline
- syncing
- last synced time

## 4. Offline Rules

Offline boleh:
- melihat data cache
- membuat draft lokal
- melihat invoice lama

Offline tidak boleh:
- final checkout
- final return
- final stok adjustment

Alasan:
stok harus valid real-time.

## 5. Draft Recovery

Saat user mengisi checkout:
- simpan cart lokal
- simpan customer sementara
- simpan operation token
- pulihkan setelah refresh

## 6. Firebase Timeout Handling

Jika Firebase lambat:
- tampilkan loading spesifik
- jangan freeze UI
- sediakan retry
- jangan langsung anggap data kosong

## 7. Double Submit Protection

Wajib:
- disable tombol submit
- operation token
- server check token
- UI lock

## 8. Failure Recovery UX

Jika checkout gagal:
- jelaskan penyebab
- cart jangan hilang
- sediakan retry
- jangan kurangi stok jika transaksi gagal

## 9. Checklist Developer

- [ ] Offline indicator tersedia.
- [ ] Last synced time tersedia.
- [ ] Draft recovery tersedia.
- [ ] Checkout offline diblokir.
- [ ] Return offline diblokir.
- [ ] Retry UI tersedia.
- [ ] Double submit dicegah.
- [ ] Firebase timeout punya pesan jelas.

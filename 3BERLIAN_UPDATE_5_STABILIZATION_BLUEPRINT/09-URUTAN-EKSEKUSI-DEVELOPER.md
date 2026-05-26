# 09 — Urutan Eksekusi Developer

## Tujuan

Agar update tidak melebar dan tidak menyebabkan regresi baru.

## Branch

Buat branch khusus:

```bash
git checkout -b fix/pos-cashier-stabilization-qr-receipt
```

## Urutan pengerjaan

### Step 1 — Kunci scope

- Jangan sentuh login/auth.
- Jangan sentuh dashboard besar.
- Jangan sentuh laporan besar.
- Fokus RentPage, cart, payment, receipt, scan nota.

### Step 2 — Ubah stepper menjadi checklist

- Hapus perilaku stepper yang mengunci.
- Hapus teks "Langkah berikutnya".
- Semua panel POS bisa diakses bebas.
- Checkout tetap validasi penuh.

Commit:

```bash
git commit -m "fix(pos): make cashier flow non-linear"
```

### Step 3 — Rapikan cart editable

- Tambahkan size/variant selection.
- Pastikan qty editable.
- Pastikan deposit/harga dihitung realtime.
- Hapus alert.

Commit:

```bash
git commit -m "fix(pos): improve editable cart item controls"
```

### Step 4 — Rapikan payment panel

- Payment panel bisa dibuka setelah cart terisi.
- Validasi hanya saat checkout.
- Error tampil sebagai list/checklist.

Commit:

```bash
git commit -m "fix(pos): move validation to checkout submit"
```

### Step 5 — Tambah QR payload transaksi

- Saat transaksi baru dibuat, simpan `qrPayload`.
- Format `3BTRX:{transactionId}`.
- Fallback untuk transaksi lama.

Commit:

```bash
git commit -m "feat(receipt): add qr payload to transactions"
```

### Step 6 — Tambah QR pada nota cetak

- Install `qrcode` jika belum ada.
- Generate QR data URL.
- Sisipkan QR di print template.
- Pastikan print preview aman.

Commit:

```bash
git commit -m "feat(receipt): print qr code on rental receipt"
```

### Step 7 — Sambungkan scan nota

- Parse `3BTRX:{transactionId}`.
- Fallback invoiceNumber.
- Scan hanya membuka transaksi.
- Return tetap butuh konfirmasi.

Commit:

```bash
git commit -m "fix(return): connect receipt qr scan to transaction lookup"
```

### Step 8 — UI consistency pass

- Kurangi panel non-prioritas di RentPage.
- Pastikan cart dan total paling dominan.
- Pastikan mobile sticky bar berfungsi.

Commit:

```bash
git commit -m "style(pos): stabilize cashier ui hierarchy"
```

### Step 9 — QA regression

Jalankan checklist dari dokumen 08.

Commit jika ada fix:

```bash
git commit -m "test(pos): fix cashier regression findings"
```

## Jangan lakukan dalam update ini

- Jangan rewrite transaction service besar jika belum perlu.
- Jangan ubah Firestore rules.
- Jangan tambah role baru.
- Jangan redesain dashboard.
- Jangan tambah fitur baru di luar masalah ini.
- Jangan membuat instruksi baru yang bertentangan dengan dokumen ini.

## Definisi selesai

Update dianggap selesai jika:

- POS tidak lagi terasa seperti wizard.
- Kasir bisa mengatur ukuran, qty, deposit, pembayaran tanpa dipaksa next.
- Nota cetak punya QR.
- QR nota bisa membuka transaksi pengembalian.
- UI POS konsisten dan tidak berubah konsep besar.
- QA regression lulus.

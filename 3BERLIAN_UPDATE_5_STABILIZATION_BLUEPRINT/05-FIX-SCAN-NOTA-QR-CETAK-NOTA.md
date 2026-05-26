# 05 — Fix Scan Nota dan QR Code pada Nota Cetak

## Masalah

Aplikasi memiliki fitur scan nota, tetapi nota cetak tidak memiliki QR code. Ini membuat fitur scan nota tidak lengkap dan membingungkan kasir.

## Target

Alur harus utuh:

```txt
Checkout → transaksi punya qrPayload → nota cetak memiliki QR → QR discan → transaksi terbuka di pengembalian
```

## Keputusan teknis

QR code nota berisi:

```txt
3BTRX:{transactionId}
```

Contoh:

```txt
3BTRX:abc123xyz
```

Gunakan `transactionId` karena lebih stabil dan unik dibanding invoiceNumber.

InvoiceNumber tetap ditampilkan sebagai teks manusia.

## Field transaksi

Saat checkout berhasil, simpan:

```js
{
  invoiceNumber: "INV-20260527-0001",
  qrPayload: "3BTRX:{transactionId}"
}
```

Jika transactionId baru tersedia setelah doc ref dibuat, buat doc ref lebih dulu:

```js
const transactionRef = doc(collection(db, "transactions"))
const qrPayload = `3BTRX:${transactionRef.id}`
```

Lalu simpan `qrPayload` dalam transaction data.

## Library QR

Untuk print HTML, pakai:

```bash
npm install qrcode
```

Alasan: QR bisa dibuat sebagai data URL dan aman masuk ke HTML print.

## File baru

```txt
src/features/receipt/receiptQr.js
src/features/receipt/receiptTemplate.js
src/features/receipt/printReceipt.js
```

## receiptQr.js

```js
import QRCode from "qrcode"

export async function createReceiptQrDataUrl(value) {
  if (!value) return ""
  return QRCode.toDataURL(value, {
    width: 160,
    margin: 1,
    errorCorrectionLevel: "M",
  })
}
```

## receiptTemplate.js

```js
import { createReceiptQrDataUrl } from "./receiptQr"
import { formatCurrency } from "../../utils/format"

export async function buildReceiptHtml(transaction, settings) {
  const qrValue = transaction.qrPayload || `3BTRX:${transaction.id}`
  const qrDataUrl = await createReceiptQrDataUrl(qrValue)

  const itemsHtml = (transaction.items || []).map((item) => `
    <tr>
      <td>${item.productName || "-"}</td>
      <td style="text-align:center">${item.size || "-"}</td>
      <td style="text-align:center">${item.qty || 1}</td>
      <td style="text-align:right">${formatCurrency(item.subtotal || 0)}</td>
    </tr>
  `).join("")

  return `
    <html>
      <head>
        <title>${transaction.invoiceNumber || "Nota"}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 16px; }
          h1 { font-size: 16px; margin: 0 0 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          td, th { padding: 4px; border-bottom: 1px solid #ddd; }
          .right { text-align: right; }
          .center { text-align: center; }
          .qr { margin-top: 16px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${settings?.storeName || "Sanggar Seni 3 Berlian"}</h1>
        <div>${settings?.storeAddress || ""}</div>
        <div>${settings?.storePhone || ""}</div>

        <hr />

        <div><strong>Invoice:</strong> ${transaction.invoiceNumber || "-"}</div>
        <div><strong>Pelanggan:</strong> ${transaction.customer?.name || "-"}</div>
        <div><strong>HP:</strong> ${transaction.customer?.phone || "-"}</div>
        <div><strong>Tanggal Kembali:</strong> ${transaction.returnDate || "-"}</div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Ukuran</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <p class="right"><strong>Subtotal:</strong> ${formatCurrency(transaction.subtotal || 0)}</p>
        <p class="right"><strong>Deposit:</strong> ${formatCurrency(transaction.deposit || transaction.depositAmount || 0)}</p>
        <p class="right"><strong>Total:</strong> ${formatCurrency(transaction.total || 0)}</p>

        <div class="qr">
          <img src="${qrDataUrl}" width="128" height="128" />
          <div style="font-size:11px;margin-top:4px;">Scan untuk proses pengembalian</div>
          <div style="font-size:11px;font-weight:bold;">${transaction.invoiceNumber || ""}</div>
        </div>

        <hr />
        <p class="center">Terima kasih.</p>
      </body>
    </html>
  `
}
```

## printReceipt.js

```js
import { buildReceiptHtml } from "./receiptTemplate"

export async function printReceipt(transaction, settings) {
  const html = await buildReceiptHtml(transaction, settings)
  const win = window.open("", "_blank", "width=420,height=640")

  if (!win) {
    throw new Error("POPUP_BLOCKED")
  }

  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()

  setTimeout(() => {
    win.print()
  }, 300)
}
```

## Scanner nota

Saat scan berhasil:

```js
function parseReceiptScan(value) {
  const raw = String(value || "").trim()

  if (raw.startsWith("3BTRX:")) {
    return {
      type: "transactionId",
      value: raw.replace("3BTRX:", "")
    }
  }

  return {
    type: "invoiceNumber",
    value: raw
  }
}
```

## Search transaksi hasil scan

Jika `transactionId`:

```js
doc(db, "transactions", transactionId)
```

Jika `invoiceNumber`:

```js
query(collection(db, "transactions"), where("invoiceNumber", "==", invoiceNumber), limit(1))
```

## Return flow

Scan nota hanya membuka transaksi.

Jangan langsung proses return.

Status handling:

- `rented`: buka proses pengembalian
- `partially_returned`: buka proses pengembalian sisa item
- `overdue`: buka proses pengembalian dan tampilkan denda
- `returned`: tampilkan "transaksi sudah selesai"
- `void`: tampilkan "transaksi dibatalkan"

## Fallback manual

Tetap sediakan input manual:

- invoice number
- nama pelanggan
- nomor HP

Karena QR bisa rusak atau nota hilang.

## Acceptance criteria

- Nota print preview menampilkan QR.
- QR bisa discan kamera HP/laptop.
- QR membuka transaksi yang benar.
- Scan tidak langsung return otomatis.
- InvoiceNumber tetap tampil sebagai teks.
- Jika QR tidak tersedia pada transaksi lama, gunakan fallback `3BTRX:{id}` saat print.

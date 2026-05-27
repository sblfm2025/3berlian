import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

const files = {
  packageJson: read('package.json'),
  rentPage: read('src/pages/RentPage.jsx'),
  returnPage: read('src/pages/ReturnPage.jsx'),
  productCatalog: read('src/features/rental/components/ProductCatalog.jsx'),
  productCard: read('src/features/rental/components/ProductCard.jsx'),
  rentalCart: read('src/features/rental/components/RentalCart.jsx'),
  checkoutPanel: read('src/features/rental/components/CheckoutPanel.jsx'),
  paymentSummary: read('src/features/rental/components/PaymentSummary.jsx'),
  receiptModal: read('src/components/receipt/ReceiptModal.jsx'),
  transactionRepository: read('src/repositories/transactionRepository.js'),
  transactionStatus: read('src/utils/transactionStatus.js'),
  uiAudit: read('scripts/ui-audit-cdp.mjs')
};

assert.ok(files.packageJson.includes('"qa:rental"'), 'package.json harus punya script qa:rental.');
assert.ok(files.packageJson.includes('"ui:audit"'), 'package.json harus punya script ui:audit.');
assert.ok(existsSync('src/features/rental/components/VariantPickerModal.jsx'), 'VariantPickerModal harus tersedia.');
assert.ok(existsSync('src/features/rental/components/ProductFilterDrawer.jsx'), 'ProductFilterDrawer harus tersedia.');
assert.ok(existsSync('src/features/rental/components/RentalMobileBar.jsx'), 'RentalMobileBar harus tersedia.');
assert.ok(existsSync('src/features/receipt/receiptQr.js'), 'receiptQr helper harus tersedia.');
assert.ok(existsSync('src/features/returns/utils/receiptScan.js'), 'receiptScan helper harus tersedia.');

assert.ok(files.productCatalog.includes('VariantPickerModal'), 'ProductCatalog harus membuka VariantPickerModal.');
assert.ok(files.productCatalog.includes('ProductFilterDrawer'), 'ProductCatalog harus memakai filter drawer.');
assert.ok(files.productCard.includes('hasMultipleVariants'), 'ProductCard harus membedakan produk multi-varian.');
assert.ok(files.rentalCart.includes('getCartItemVariant'), 'RentalCart harus menjaga identitas varian saat qty berubah.');
assert.ok(files.checkoutPanel.includes('Mulai transaksi'), 'CheckoutPanel kosong harus memberi instruksi mulai transaksi.');
assert.ok(files.paymentSummary.includes("'Mixed'"), 'PaymentSummary harus menyediakan metode Mixed.');
assert.ok(files.paymentSummary.includes('Total dibayar'), 'Mixed payment harus memakai label total dibayar.');
assert.ok(files.receiptModal.includes('createReceiptQrDataUrl'), 'ReceiptModal harus membuat QR nota.');
assert.ok(files.receiptModal.includes('qrPreview'), 'ReceiptModal harus menampilkan QR preview.');
assert.ok(files.transactionRepository.includes('qrPayload'), 'Transaksi baru harus menyimpan qrPayload.');
assert.ok(files.transactionRepository.includes('operationToken'), 'Checkout harus punya operationToken untuk idempotensi.');
assert.ok(files.transactionRepository.includes('normalizeRentalItems'), 'Transaksi harus menyimpan snapshot item rental.');
assert.ok(files.transactionStatus.includes("completed"), 'Mapper status lama harus membaca completed.');
assert.ok(files.transactionStatus.includes("CANCELLED"), 'Mapper status lama harus membaca CANCELLED.');
assert.ok(files.uiAudit.includes('layoutChecks'), 'UI audit harus punya layoutChecks.');
assert.ok(files.uiAudit.includes('horizontalOverflow'), 'UI audit harus mendeteksi horizontal overflow.');
assert.ok(!/alert\s*\(/.test(files.rentPage + files.returnPage + files.checkoutPanel), 'Scope POS/return tidak boleh memakai alert browser.');

console.log('Blueprint coverage QA passed.');

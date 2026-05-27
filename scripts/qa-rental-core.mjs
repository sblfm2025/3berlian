import assert from 'node:assert/strict';

import { getReceiptQrPayload } from '../src/features/receipt/receiptQr.js';
import { parseReceiptScan, isReturnableStatus } from '../src/features/returns/utils/receiptScan.js';
import { calculatePaymentTotals } from '../src/features/rental/utils/rentalCalculations.js';
import { validateRentalPayload } from '../src/validators/rentalValidator.js';
import { isActiveTransaction, isCompletedTransaction, normalizeTransactionStatus } from '../src/utils/transactionStatus.js';

const sampleCart = [
  {
    productId: 'bugis-l',
    productName: 'Baju Bugis',
    qty: 2,
    size: 'L',
    rentPrice: 50000,
    deposit: 10000,
    discount: 5000
  },
  {
    productId: 'aksesoris',
    productName: 'Aksesoris',
    qty: 1,
    size: 'All Size',
    rentPrice: 25000,
    deposit: 0
  }
];

const mixedTotals = calculatePaymentTotals({
  cart: sampleCart,
  discountType: 'nominal',
  discountValue: '10000',
  depositAmountInput: '',
  paymentMethod: 'Mixed',
  cashReceived: '140000'
});

assert.equal(mixedTotals.subTotal, 120000);
assert.equal(mixedTotals.depositAmount, 20000);
assert.equal(mixedTotals.discountAmount, 10000);
assert.equal(mixedTotals.grandTotal, 130000);
assert.equal(mixedTotals.changeAmount, 10000);
assert.equal(mixedTotals.remainingAmount, 0);
assert.equal(mixedTotals.paymentStatus, 'paid');

const partialMixedTotals = calculatePaymentTotals({
  cart: sampleCart,
  discountType: 'nominal',
  discountValue: '10000',
  depositAmountInput: '',
  paymentMethod: 'Mixed',
  cashReceived: '50000'
});

assert.equal(partialMixedTotals.remainingAmount, 80000);
assert.equal(partialMixedTotals.paymentStatus, 'partial');

const transferTotals = calculatePaymentTotals({
  cart: sampleCart,
  discountType: 'percent',
  discountValue: '10',
  depositAmountInput: '30000',
  paymentMethod: 'Transfer',
  cashReceived: ''
});

assert.equal(transferTotals.discountAmount, 12000);
assert.equal(transferTotals.depositAmount, 30000);
assert.equal(transferTotals.changeAmount, 0);
assert.equal(transferTotals.remainingAmount, 0);
assert.equal(transferTotals.paymentStatus, 'paid');

const validPayload = validateRentalPayload({
  cashReceived: 130000,
  cart: sampleCart,
  customer: {
    address: 'Pinrang',
    name: 'Sitti Aminah',
    phone: '081234567890'
  },
  grandTotal: 130000,
  paymentMethod: 'Mixed',
  rentDate: '2026-05-27',
  returnDate: '2026-05-28'
});

assert.equal(validPayload.isValid, true);
assert.deepEqual(validPayload.errors, []);

const invalidMixedPayment = validateRentalPayload({
  cashReceived: 50000,
  cart: sampleCart,
  customer: {
    address: 'Pinrang',
    name: 'Sitti Aminah',
    phone: '081234567890'
  },
  grandTotal: 130000,
  paymentMethod: 'Mixed',
  rentDate: '2026-05-27',
  returnDate: '2026-05-28'
});

assert.equal(invalidMixedPayment.isValid, false);
assert.ok(invalidMixedPayment.errors.includes('Total pembayaran gabungan masih kurang.'));

assert.equal(getReceiptQrPayload({ id: 'TRX-001' }), '3BTRX:TRX-001');
assert.equal(getReceiptQrPayload({ qrPayload: '3BTRX:CUSTOM' }), '3BTRX:CUSTOM');
assert.deepEqual(parseReceiptScan('3BTRX:TRX-001'), { type: 'transactionId', value: 'TRX-001' });
assert.deepEqual(parseReceiptScan('INV-2026-001'), { type: 'invoiceNumber', value: 'INV-2026-001' });
assert.equal(isReturnableStatus('rented'), true);
assert.equal(isReturnableStatus('returned'), false);
assert.equal(isActiveTransaction({ status: 'disewa' }), true);
assert.equal(isCompletedTransaction({ status: 'completed' }), true);
assert.equal(normalizeTransactionStatus('disewa'), 'rented');
assert.equal(normalizeTransactionStatus('completed'), 'returned');
assert.equal(normalizeTransactionStatus('COMPLETED'), 'returned');
assert.equal(normalizeTransactionStatus('CANCELLED'), 'void');
assert.equal(normalizeTransactionStatus(undefined), 'rented');

console.log('Rental core QA passed.');

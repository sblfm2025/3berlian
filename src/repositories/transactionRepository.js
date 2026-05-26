import { runTransaction, serverTimestamp } from 'firebase/firestore';
import { formatDateInput, formatDateYYYYMMDD } from '../utils/format';
import { calculateStockAfterRent, calculateStockAfterReturn, normalizeStock } from '../utils/stock';
import { auditDoc, auditPayload, dataDoc, getDb } from './baseRepository';
import { canTransitionTo } from '../domains/rental/rentalStateMachine';
import { DEPOSIT_STATUS, RENTAL_STATUS } from '../domains/rental/rentalStatus';
import { createInventoryLog } from './productRepository';

const STATUS_ACTIVE = new Set(['rented', 'disewa', 'overdue', 'ACTIVE_RENTAL', 'RETURNED_PARTIAL', 'OVERDUE']);

const CONDITION_MAP = {
  Baik: 'good',
  'Kotor/Laundry': 'laundry',
  'Rusak Ringan': 'damaged',
  'Rusak Berat': 'damaged',
  Hilang: 'lost',
  good: 'good',
  laundry: 'laundry',
  damaged: 'damaged',
  lost: 'lost'
};

const getItemQty = (item) => Number(item.qty || 0);

const getProductId = (item) => item.productId || item.product?.id;

const getProductName = (item) => item.productName || item.product?.name || getProductId(item) || 'Produk';

const getCustomerId = (transactionData) => {
  if (!transactionData.customerName) return '';
  return `CUST-${String(transactionData.customerPhone || transactionData.customerName)
    .trim()
    .replace(/[/.#[\]]/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase()}`;
};

const buildAuditPayload = ({
  action,
  after = null,
  before = null,
  entityId,
  entityType = 'transaction',
  note = '',
  operatorId = 'system'
}) => ({
  action,
  after,
  before,
  createdAt: serverTimestamp(),
  createdBy: operatorId,
  entityId,
  entityType,
  note
});

/**
 * Helper untuk menulis mutasi kas ke buku besar keuangan (financialRecords).
 */
const writeFinancialRecord = (dbTransaction, {
  type,
  transactionId,
  customerId,
  amount,
  method = 'Tunai',
  direction = 'IN',
  category = 'rental',
  notes = '',
  createdBy = 'system'
}) => {
  if (amount <= 0) return;
  const recordId = `FIN-${Date.now()}-${type}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const recordRef = dataDoc('financialRecords', recordId);
  dbTransaction.set(recordRef, {
    id: recordId,
    type,
    transactionId,
    customerId,
    amount: Number(amount),
    method: String(method).trim(),
    direction,
    category,
    notes,
    createdBy,
    createdAt: new Date().toISOString()
  });
};

const normalizeTransactionForRental = (payload) => {
  const rentedAt = payload.rentedAt || payload.rentDate || formatDateInput();
  const returnDate = payload.returnDate || payload.expectedReturnDate;
  const total = Number(payload.total ?? payload.totalAmount ?? payload.grandTotal ?? 0);

  return {
    ...payload,
    customer: payload.customer || {
      name: payload.customerName || '',
      phone: payload.customerPhone || '',
      address: payload.customerAddress || '',
      identityType: payload.customerIdentityType || 'KTP',
      identityNumber: payload.customerIdentityNumber || '',
      notes: payload.customerNote || ''
    },
    createdAt: payload.createdAt || new Date().toISOString(),
    createdBy: payload.createdBy || 'system',
    deposit: Number(payload.deposit ?? payload.depositAmount ?? 0),
    depositStatus: DEPOSIT_STATUS.HELD,
    discount: Number(payload.discount ?? payload.discountAmount ?? 0),
    expectedReturnDate: returnDate,
    paymentStatus: payload.paymentStatus || 'paid',
    penalty: Number(payload.penalty ?? payload.lateFee ?? 0),
    rentDate: rentedAt,
    rentedAt,
    returnDate,
    status: RENTAL_STATUS.ACTIVE_RENTAL,
    subTotal: Number(payload.subTotal ?? payload.subtotal ?? 0),
    subtotal: Number(payload.subtotal ?? payload.subTotal ?? 0),
    total,
    totalAmount: total
  };
};

/**
 * Membuat transaksi sewa baru secara atomik.
 */
export const createRentalTransaction = async (payload, cart = payload.items || []) => {
  const baseTransactionData = normalizeTransactionForRental({ ...payload, items: cart });
  const bookingId = payload.bookingId || null;
  const operationToken = payload.operationToken || `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const productRefs = cart.map(item => ({
    item,
    ref: dataDoc('products', getProductId(item))
  }));
  const customerId = getCustomerId(baseTransactionData);
  const customerRef = customerId ? dataDoc('customers', customerId) : null;
  let savedTransaction = null;

  await runTransaction(getDb(), async (dbTransaction) => {
    const checkoutDate = new Date();
    const invoiceDateKey = formatDateYYYYMMDD(checkoutDate);
    const invoiceCounterRef = dataDoc('counters', `invoice-${invoiceDateKey}`);
    const bookingRef = bookingId ? dataDoc('bookings', bookingId) : null;
    const operationRef = dataDoc('operationTokens', operationToken);
    const operationSnapshot = await dbTransaction.get(operationRef);
    if (operationSnapshot.exists()) {
      const existingTransactionId = operationSnapshot.data()?.transactionId;
      if (!existingTransactionId) {
        throw new Error('Operasi checkout ini sudah pernah diproses.');
      }

      const existingTransactionSnapshot = await dbTransaction.get(dataDoc('transactions', existingTransactionId));
      if (!existingTransactionSnapshot.exists()) {
        throw new Error(`Transaksi ${existingTransactionId} dari operasi sebelumnya tidak ditemukan.`);
      }

      savedTransaction = existingTransactionSnapshot.data();
      return;
    }

    const invoiceCounterSnapshot = await dbTransaction.get(invoiceCounterRef);
    const bookingSnapshot = bookingRef ? await dbTransaction.get(bookingRef) : null;
    const productSnapshots = await Promise.all(productRefs.map(({ ref }) => dbTransaction.get(ref)));
    const lastInvoiceSequence = Number(invoiceCounterSnapshot.exists() ? invoiceCounterSnapshot.data().lastSequence || 0 : 0);
    const invoiceSequence = lastInvoiceSequence + 1;
    const invoiceNumber = `INV-${invoiceDateKey}-${String(invoiceSequence).padStart(4, '0')}`;
    const transactionRef = dataDoc('transactions', invoiceNumber);
    const transactionData = {
      ...baseTransactionData,
      id: invoiceNumber,
      invoiceNumber,
      invoiceSequence,
      operationToken
    };

    if (bookingRef) {
      if (!bookingSnapshot.exists()) {
        throw new Error(`Booking ${bookingId} tidak ditemukan.`);
      }

      const bookingData = bookingSnapshot.data();
      if (bookingData.status === 'cancelled' || bookingData.status === 'converted_to_rental') {
        throw new Error(`Booking ${bookingId} sudah tidak dapat diproses menjadi sewa.`);
      }
    }

    productSnapshots.forEach((snapshot, index) => {
      const { item } = productRefs[index];
      const qty = getItemQty(item);
      const productName = item.product?.name || getProductId(item) || 'Produk';

      if (!snapshot.exists()) {
        throw new Error(`${productName} tidak ditemukan di database.`);
      }

      calculateStockAfterRent(snapshot.data(), qty);
    });

    dbTransaction.set(invoiceCounterRef, {
      dateKey: invoiceDateKey,
      id: `invoice-${invoiceDateKey}`,
      lastSequence: invoiceSequence,
      updatedAt: serverTimestamp()
    }, { merge: true });
    dbTransaction.set(transactionRef, transactionData);
    dbTransaction.set(operationRef, {
      createdAt: serverTimestamp(),
      id: operationToken,
      operationType: 'checkout',
      transactionId: invoiceNumber
    });

    // --- PENCATATAN JURNAL KEUANGAN ATOMIK (PHASE 9) ---
    const rentRevenue = Number(transactionData.totalAmount || 0) - Number(transactionData.deposit || 0);
    if (rentRevenue > 0) {
      writeFinancialRecord(dbTransaction, {
        type: 'RENTAL_PAYMENT',
        transactionId: invoiceNumber,
        customerId: customerId || '',
        amount: rentRevenue,
        method: transactionData.paymentMethod || 'Tunai',
        direction: 'IN',
        category: 'rental',
        notes: `Uang sewa kostum masuk untuk nota ${invoiceNumber}`,
        createdBy: transactionData.createdBy || 'system'
      });
    }

    const depositAmountVal = Number(transactionData.deposit || 0);
    if (depositAmountVal > 0) {
      writeFinancialRecord(dbTransaction, {
        type: 'DEPOSIT_IN',
        transactionId: invoiceNumber,
        customerId: customerId || '',
        amount: depositAmountVal,
        method: transactionData.paymentMethod || 'Tunai',
        direction: 'IN',
        category: 'deposit',
        notes: `Jaminan deposit masuk untuk sewa kostum nota ${invoiceNumber}`,
        createdBy: transactionData.createdBy || 'system'
      });
    }

    const discountAmountVal = Number(transactionData.discount || 0);
    if (discountAmountVal > 0) {
      writeFinancialRecord(dbTransaction, {
        type: 'DISCOUNT',
        transactionId: invoiceNumber,
        customerId: customerId || '',
        amount: discountAmountVal,
        method: transactionData.paymentMethod || 'Tunai',
        direction: 'OUT',
        category: 'rental',
        notes: `Diskon sewa untuk nota ${invoiceNumber}`,
        createdBy: transactionData.createdBy || 'system'
      });
    }

    productRefs.forEach(({ item, ref }, index) => {
      const qty = getItemQty(item);
      const nextStock = calculateStockAfterRent(productSnapshots[index].data(), qty);
      dbTransaction.update(ref, nextStock);

      // Catat log pergerakan stok
      createInventoryLog(dbTransaction, {
        productId: getProductId(item),
        movementType: 'RENT_OUT',
        qty,
        fromStatus: 'READY',
        toStatus: 'RENTED',
        transactionId: invoiceNumber,
        actorId: transactionData.createdBy || 'system',
        notes: `Kostum disewakan dalam nota ${invoiceNumber}`
      });
    });

    if (customerRef) {
      dbTransaction.set(customerRef, {
        address: transactionData.customerAddress || transactionData.customer.address || '',
        depositAmount: transactionData.depositAmount || transactionData.deposit || 0,
        identityNumber: transactionData.customerIdentityNumber || transactionData.customer.identityNumber || '',
        identityType: transactionData.customerIdentityType || transactionData.customer.identityType || 'KTP',
        lastRentDate: transactionData.rentDate,
        lastTransactionId: transactionData.id,
        name: transactionData.customerName || transactionData.customer.name,
        note: transactionData.customerNote || transactionData.customer.notes || '',
        phone: transactionData.customerPhone || transactionData.customer.phone || ''
      }, { merge: true });
    }

    dbTransaction.set(auditDoc('CREATE_RENTAL', transactionData.id), buildAuditPayload({
      action: 'CREATE_RENTAL',
      after: transactionData,
      entityId: transactionData.id
    }));

    if (bookingRef) {
      dbTransaction.update(bookingRef, {
        convertedAt: new Date().toISOString(),
        convertedToTransactionId: invoiceNumber,
        status: 'converted_to_rental',
        updatedAt: new Date().toISOString()
      });
      dbTransaction.set(auditDoc('CONVERT_BOOKING_TO_RENTAL', bookingId), buildAuditPayload({
        action: 'CONVERT_BOOKING_TO_RENTAL',
        after: { bookingId, transactionId: invoiceNumber },
        before: bookingSnapshot.data(),
        entityId: bookingId,
        entityType: 'booking',
        operatorId: transactionData.createdBy || 'system'
      }));
    }

    savedTransaction = transactionData;
  });

  return savedTransaction;
};

/**
 * Memproses pengembalian barang sewa secara atomik (mendukung parsial).
 */
export const completeReturnTransaction = async (selectedTrx) => {
  const transactionRef = dataDoc('transactions', selectedTrx.id);
  const sourceItems = selectedTrx.items || [];
  const returnItems = (selectedTrx.returnItems || sourceItems)
    .filter(item => getProductId(item))
    .map(item => ({
      ...item,
      qty: Number(item.returnQty ?? item.qty ?? 0)
    }))
    .filter(item => Number(item.qty || 0) > 0);
  const productRefs = returnItems
    .map(item => ({
      item,
      ref: dataDoc('products', getProductId(item))
    }));
  const lateFee = Number(selectedTrx.lateFee || selectedTrx.calculatedFine || 0);
  const conditionFee = Number(selectedTrx.conditionFee || 0);
  const totalFee = Number(selectedTrx.totalFee || lateFee + conditionFee);
  const depositAmount = Number(selectedTrx.depositAmount ?? selectedTrx.deposit ?? 0);
  const useDepositForFees = selectedTrx.useDepositForFees !== false;
  const depositDeducted = useDepositForFees ? Math.min(depositAmount, totalFee) : 0;
  const depositReturned = Math.max(0, depositAmount - depositDeducted);
  const feePaidSeparately = Math.max(0, totalFee - depositDeducted);

  // Status siklus deposit terperinci
  const depositStatus = depositAmount <= 0
    ? DEPOSIT_STATUS.NOT_REQUIRED
    : depositDeducted <= 0
      ? DEPOSIT_STATUS.REFUNDED
      : depositReturned > 0
        ? DEPOSIT_STATUS.PARTIALLY_REFUNDED
        : DEPOSIT_STATUS.DEDUCTED;

  const itemConditions = Array.isArray(selectedTrx.itemConditions)
    ? selectedTrx.itemConditions
    : Object.entries(selectedTrx.itemConditions || {}).map(([productId, condition]) => {
        const item = sourceItems.find(cartItem => getProductId(cartItem) === productId);
        return {
          condition,
          fee: 0,
          note: '',
          productId,
          productName: item?.product?.name || productId
        };
      });
  const conditionByProduct = itemConditions.reduce((acc, item) => {
    acc[item.productId] = CONDITION_MAP[item.condition] || 'good';
    return acc;
  }, {});
  const returnedAt = new Date().toISOString();

  await runTransaction(getDb(), async (dbTransaction) => {
    const transactionSnapshot = await dbTransaction.get(transactionRef);
    if (!transactionSnapshot.exists()) {
      throw new Error(`Transaksi ${selectedTrx.id} tidak ditemukan.`);
    }

    const before = transactionSnapshot.data();
    if (!STATUS_ACTIVE.has(before.status)) {
      throw new Error(`Transaksi ${selectedTrx.id} sudah tidak aktif.`);
    }

    const currentReturnableItems = before.remainingItems?.length ? before.remainingItems : before.items || sourceItems;
    const totalOriginalQty = currentReturnableItems.reduce((sum, item) => sum + getItemQty(item), 0);
    const totalReturnedQty = returnItems.reduce((sum, item) => sum + getItemQty(item), 0);
    if (totalReturnedQty <= 0) {
      throw new Error('Belum ada item yang dipilih untuk dikembalikan.');
    }
    if (totalReturnedQty > totalOriginalQty) {
      throw new Error('Jumlah item kembali melebihi jumlah sewa.');
    }

    const productSnapshots = await Promise.all(productRefs.map(({ ref }) => dbTransaction.get(ref)));
    productSnapshots.forEach((snapshot, index) => {
      const productName = getProductName(productRefs[index].item);
      if (!snapshot.exists()) {
        throw new Error(`${productName} tidak ditemukan di database.`);
      }
    });

    const returnedQtyByProduct = returnItems.reduce((acc, item) => {
      const productId = getProductId(item);
      acc[productId] = (acc[productId] || 0) + getItemQty(item);
      return acc;
    }, {});
    const remainingItems = currentReturnableItems
      .map(item => ({
        ...item,
        qty: Math.max(0, getItemQty(item) - (returnedQtyByProduct[getProductId(item)] || 0))
      }))
      .filter(item => getItemQty(item) > 0);

    const isFullReturn = remainingItems.length === 0;

    // Status transaksi standar baru
    const returnStatus = isFullReturn ? RENTAL_STATUS.COMPLETED : RENTAL_STATUS.RETURNED_PARTIAL;

    // Validasi transisi status melalui State Machine
    if (!canTransitionTo(before.status, returnStatus)) {
      throw new Error(`Transisi status tidak valid dari ${before.status} ke ${returnStatus}.`);
    }

    const returnedItemDetails = returnItems.map(item => {
      const productId = getProductId(item);
      return {
        condition: conditionByProduct[productId] || 'good',
        productId,
        productName: getProductName(item),
        qty: getItemQty(item)
      };
    });

    const returnRecord = {
      conditionFee,
      depositAmount,
      depositDeducted,
      depositReturned,
      depositStatus,
      feePaidSeparately,
      itemConditions,
      items: returnedItemDetails,
      lateDays: Number(selectedTrx.calculatedLateDays || 0),
      lateFee,
      notes: selectedTrx.notes || '',
      paymentMethodForFees: selectedTrx.paymentMethodForFees || selectedTrx.paymentMethod || 'Tunai',
      returnedAt,
      status: returnStatus,
      totalFee,
      // override tracking
      originalLateFee: Number(selectedTrx.originalLateFee ?? selectedTrx.calculatedFine ?? lateFee),
      penaltyOverrideReason: selectedTrx.penaltyOverrideReason || ''
    };

    const returnHistory = [
      ...(Array.isArray(before.returnHistory) ? before.returnHistory : []),
      returnRecord
    ];

    const transactionUpdates = {
      conditionFee: Number(before.conditionFee || 0) + conditionFee,
      depositDeducted,
      depositReturned,
      depositStatus,
      feePaidSeparately,
      lateFee: Number(before.lateFee || 0) + lateFee,
      lastReturnAt: returnedAt,
      notes: selectedTrx.notes || '',
      paymentMethod: selectedTrx.paymentMethod || before.paymentMethod || 'Tunai',
      paymentMethodForFees: selectedTrx.paymentMethodForFees || selectedTrx.paymentMethod || 'Tunai',
      remainingItems,
      returnDate: isFullReturn ? formatDateInput() : before.returnDate || null,
      returnHistory,
      returnInfo: returnRecord,
      returnedAt: isFullReturn ? returnedAt : before.returnedAt || null,
      status: returnStatus,
      totalFee: Number(before.totalFee || 0) + totalFee
    };

    dbTransaction.update(transactionRef, transactionUpdates);

    // --- PENCATATAN JURNAL KEUANGAN ATOMIK (PHASE 9) ---
    const returnCustId = getCustomerId(before);

    if (lateFee > 0) {
      writeFinancialRecord(dbTransaction, {
        type: 'LATE_FEE',
        transactionId: selectedTrx.id,
        customerId: returnCustId || '',
        amount: lateFee,
        method: selectedTrx.paymentMethodForFees || selectedTrx.paymentMethod || 'Tunai',
        direction: 'IN',
        category: 'rental',
        notes: `Denda keterlambatan masuk untuk nota ${selectedTrx.id}`,
        createdBy: selectedTrx.operatorId || 'system'
      });
    }

    if (conditionFee > 0) {
      const hasLost = returnedItemDetails.some(item => item.condition === 'lost');
      writeFinancialRecord(dbTransaction, {
        type: hasLost ? 'LOST_FEE' : 'DAMAGE_FEE',
        transactionId: selectedTrx.id,
        customerId: returnCustId || '',
        amount: conditionFee,
        method: selectedTrx.paymentMethodForFees || selectedTrx.paymentMethod || 'Tunai',
        direction: 'IN',
        category: 'rental',
        notes: `Biaya ${hasLost ? 'kehilangan' : 'kerusakan/perbaikan'} kostum masuk untuk nota ${selectedTrx.id}`,
        createdBy: selectedTrx.operatorId || 'system'
      });
    }

    if (depositDeducted > 0) {
      writeFinancialRecord(dbTransaction, {
        type: 'DEPOSIT_DEDUCTION',
        transactionId: selectedTrx.id,
        customerId: returnCustId || '',
        amount: depositDeducted,
        method: selectedTrx.paymentMethodForFees || selectedTrx.paymentMethod || 'Tunai',
        direction: 'OUT',
        category: 'deposit',
        notes: `Pemotongan jaminan deposit untuk denda pada nota ${selectedTrx.id}`,
        createdBy: selectedTrx.operatorId || 'system'
      });
    }

    if (depositReturned > 0) {
      writeFinancialRecord(dbTransaction, {
        type: 'DEPOSIT_REFUND',
        transactionId: selectedTrx.id,
        customerId: returnCustId || '',
        amount: depositReturned,
        method: selectedTrx.paymentMethodForFees || selectedTrx.paymentMethod || 'Tunai',
        direction: 'OUT',
        category: 'deposit',
        notes: `Pengembalian jaminan deposit keluar untuk nota ${selectedTrx.id}`,
        createdBy: selectedTrx.operatorId || 'system'
      });
    }

    productRefs.forEach(({ item, ref }, index) => {
      const qty = getItemQty(item);
      const condition = conditionByProduct[getProductId(item)] || 'good';
      const nextStock = calculateStockAfterReturn(productSnapshots[index].data(), qty, condition);
      dbTransaction.update(ref, nextStock);

      const movementTypeMap = {
        good: 'RETURN_IN',
        laundry: 'SEND_TO_LAUNDRY',
        damaged: 'SEND_TO_MAINTENANCE',
        lost: 'MARK_LOST'
      };

      // Catat log pergerakan stok
      createInventoryLog(dbTransaction, {
        productId: getProductId(item),
        movementType: movementTypeMap[condition] || 'RETURN_IN',
        qty,
        fromStatus: 'RENTED',
        toStatus: condition === 'good' ? 'READY' : condition === 'laundry' ? 'IN_LAUNDRY' : condition === 'damaged' ? 'IN_MAINTENANCE' : 'LOST',
        transactionId: selectedTrx.id,
        actorId: selectedTrx.operatorId || 'system',
        notes: `Pengembalian kostum kondisi ${condition.toUpperCase()} dalam nota ${selectedTrx.id}`
      });
    });

    dbTransaction.set(auditDoc('RETURN_RENTAL', selectedTrx.id), buildAuditPayload({
      action: 'RETURN_RENTAL',
      before,
      after: { ...before, ...transactionUpdates },
      entityId: selectedTrx.id
    }));

    // Mencatat log audit khusus jika denda disesuaikan manual (override)
    const originalFine = Number(selectedTrx.originalLateFee ?? selectedTrx.calculatedFine ?? lateFee);
    if (lateFee !== originalFine) {
      dbTransaction.set(auditDoc('OVERRIDE_PENALTY', selectedTrx.id), buildAuditPayload({
        action: 'OVERRIDE_PENALTY',
        before: { lateFee: originalFine },
        after: { lateFee },
        entityId: selectedTrx.id,
        note: selectedTrx.penaltyOverrideReason || 'Override denda keterlambatan',
        operatorId: selectedTrx.operatorId || 'system'
      }));
    }
  });
};

/**
 * Melakukan pembatalan (void) transaksi secara aman dan mengembalikan stok.
 */
export const voidTransaction = async (trx, { reason = 'Dibatalkan dari laporan', operatorId = 'system' } = {}) => {
  const transactionRef = dataDoc('transactions', trx.id);
  let stockRestoreWarnings = [];

  await runTransaction(getDb(), async (dbTransaction) => {
    const transactionSnapshot = await dbTransaction.get(transactionRef);
    if (!transactionSnapshot.exists()) {
      throw new Error(`Transaksi ${trx.id} tidak ditemukan.`);
    }

    const before = transactionSnapshot.data();
    if (before.status === RENTAL_STATUS.CANCELLED || before.status === 'void') {
      throw new Error(`Transaksi ${trx.id} sudah dibatalkan.`);
    }

    const returnStatus = RENTAL_STATUS.CANCELLED;

    // Validasi transisi status melalui State Machine
    if (!canTransitionTo(before.status, returnStatus)) {
      throw new Error(`Transisi status tidak valid dari ${before.status} ke ${returnStatus}.`);
    }

    const shouldRestoreStock = STATUS_ACTIVE.has(before.status);
    const stockRestoreItems = before.status === 'partially_returned' && before.remainingItems?.length
      ? before.remainingItems
      : before.items || trx.items || [];
    const productRefs = shouldRestoreStock
      ? stockRestoreItems
        .filter(item => getProductId(item))
        .map(item => ({ item, ref: dataDoc('products', getProductId(item)) }))
      : [];
    const productSnapshots = shouldRestoreStock
      ? await Promise.all(productRefs.map(({ ref }) => dbTransaction.get(ref)))
      : [];

    stockRestoreWarnings = productSnapshots.reduce((warnings, snapshot, index) => {
      if (!snapshot.exists()) {
        const item = productRefs[index].item;
        warnings.push(getProductId(item));
      }
      return warnings;
    }, []);

    if (stockRestoreWarnings.length > 0) {
      throw new Error(`Sebagian produk tidak ditemukan: ${stockRestoreWarnings.join(', ')}`);
    }

    if (shouldRestoreStock) {
      productRefs.forEach(({ item, ref }, index) => {
        const productData = productSnapshots[index].data();
        const stock = normalizeStock(productData);
        const qty = getItemQty(item);
        const restored = {
          ...stock,
          availableStock: stock.availableStock + qty,
          rentedStock: Math.max(0, stock.rentedStock - qty),
          // Keep backward compatibility fields
          stockAvailable: stock.availableStock + qty,
          stockRented: Math.max(0, stock.rentedStock - qty)
        };
        dbTransaction.update(ref, {
          ...restored,
          stock: restored.availableStock
        });

        // Catat log pergerakan stok
        createInventoryLog(dbTransaction, {
          productId: getProductId(item),
          movementType: 'RETURN_IN',
          qty,
          fromStatus: 'RENTED',
          toStatus: 'READY',
          transactionId: trx.id,
          actorId: operatorId,
          notes: `Pembatalan (Void) transaksi sewa nota ${trx.id}`
        });
      });
    }

    const after = {
      ...before,
      status: RENTAL_STATUS.CANCELLED,
      stockRestored: shouldRestoreStock,
      voidAt: new Date().toISOString(),
      voidBy: operatorId,
      voidReason: reason
    };

    dbTransaction.update(transactionRef, after);

    // --- PENCATATAN JURNAL KEUANGAN ATOMIK PEMBALIK (PHASE 9 VOID) ---
    const voidCustId = getCustomerId(before);

    const rentRevenueBefore = Number(before.totalAmount || 0) - Number(before.deposit || before.depositAmount || 0);
    if (rentRevenueBefore > 0) {
      writeFinancialRecord(dbTransaction, {
        type: 'MANUAL_ADJUSTMENT',
        transactionId: trx.id,
        customerId: voidCustId || '',
        amount: rentRevenueBefore,
        method: before.paymentMethod || 'Tunai',
        direction: 'OUT',
        category: 'rental',
        notes: `Pembatalan (Void) sewa kostum untuk nota ${trx.id}. Saldo sewa dibatalkan.`,
        createdBy: operatorId
      });
    }

    const depositBefore = Number(before.deposit || before.depositAmount || 0);
    if (depositBefore > 0) {
      writeFinancialRecord(dbTransaction, {
        type: 'DEPOSIT_REFUND',
        transactionId: trx.id,
        customerId: voidCustId || '',
        amount: depositBefore,
        method: before.paymentMethod || 'Tunai',
        direction: 'OUT',
        category: 'deposit',
        notes: `Pembatalan (Void) sewa kostum untuk nota ${trx.id}. Saldo deposit dibatalkan.`,
        createdBy: operatorId
      });
    }
    dbTransaction.set(auditDoc('VOID_TRANSACTION', trx.id), buildAuditPayload({
      action: 'VOID_TRANSACTION',
      before,
      after,
      entityId: trx.id,
      note: reason,
      operatorId
    }));
  });

  return { stockRestoreWarnings };
};

/**
 * Memperbarui transaksi (edit) di Firestore.
 */
export const editTransaction = async (updatedTrx) => {
  const transactionRef = dataDoc('transactions', updatedTrx.id);

  await runTransaction(getDb(), async (dbTransaction) => {
    const transactionSnapshot = await dbTransaction.get(transactionRef);
    const before = transactionSnapshot.exists() ? transactionSnapshot.data() : null;

    dbTransaction.update(transactionRef, updatedTrx);
    dbTransaction.set(auditDoc('edit', updatedTrx.id), auditPayload({
      action: 'edit',
      before,
      after: updatedTrx,
      entityId: updatedTrx.id
    }));
  });
};

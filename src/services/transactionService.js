import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';

import { formatDateInput, formatDateYYYYMMDD } from '../utils/format';
import { calculateStockAfterRent, calculateStockAfterReturn, normalizeStock } from '../utils/stock';
import { appId, db } from './firebase';

const STATUS_ACTIVE = new Set(['rented', 'disewa', 'overdue']);
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

const getDb = () => {
  if (!db) throw new Error('Database aplikasi belum siap.');
  return db;
};

const dataCollection = (name) => collection(getDb(), 'artifacts', appId, 'public', 'data', name);
const dataDoc = (name, id) => doc(dataCollection(name), id);

const sanitizeDocId = (value) => String(value || '')
  .trim()
  .replace(/[/.#[\]]/g, '-')
  .replace(/\s+/g, '-')
  .toLowerCase();

const auditDoc = (action, entityId) => dataDoc('auditLogs', `${Date.now()}-${action}-${sanitizeDocId(entityId)}`);

const getItemQty = (item) => Number(item.qty || 0);

const getProductId = (item) => item.productId || item.product?.id;

const getProductName = (item) => item.productName || item.product?.name || getProductId(item) || 'Produk';

const getCustomerId = (transactionData) => {
  if (!transactionData.customerName) return '';
  return `CUST-${sanitizeDocId(transactionData.customerPhone || transactionData.customerName)}`;
};

const buildAuditPayload = ({ action, after = null, before = null, entityId, entityType = 'transaction', note = '', operatorId = 'system' }) => ({
  action,
  after,
  before,
  createdAt: serverTimestamp(),
  createdBy: operatorId,
  entityId,
  entityType,
  note
});

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
    discount: Number(payload.discount ?? payload.discountAmount ?? 0),
    expectedReturnDate: returnDate,
    paymentStatus: payload.paymentStatus || 'paid',
    penalty: Number(payload.penalty ?? payload.lateFee ?? 0),
    rentDate: rentedAt,
    rentedAt,
    returnDate,
    status: 'rented',
    subTotal: Number(payload.subTotal ?? payload.subtotal ?? 0),
    subtotal: Number(payload.subtotal ?? payload.subTotal ?? 0),
    total,
    totalAmount: total
  };
};

export const createRentalTransaction = async (payload, cart = payload.items || []) => {
  const baseTransactionData = normalizeTransactionForRental({ ...payload, items: cart });
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
    const invoiceCounterSnapshot = await dbTransaction.get(invoiceCounterRef);
    const productSnapshots = await Promise.all(productRefs.map(({ ref }) => dbTransaction.get(ref)));
    const lastInvoiceSequence = Number(invoiceCounterSnapshot.exists() ? invoiceCounterSnapshot.data().lastSequence || 0 : 0);
    const invoiceSequence = lastInvoiceSequence + 1;
    const invoiceNumber = `INV-${invoiceDateKey}-${String(invoiceSequence).padStart(4, '0')}`;
    const transactionRef = dataDoc('transactions', invoiceNumber);
    const transactionData = {
      ...baseTransactionData,
      id: invoiceNumber,
      invoiceNumber,
      invoiceSequence
    };

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

    productRefs.forEach(({ item, ref }, index) => {
      const nextStock = calculateStockAfterRent(productSnapshots[index].data(), getItemQty(item));
      dbTransaction.update(ref, nextStock);
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

    savedTransaction = transactionData;
  });

  return savedTransaction;
};

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
  const depositStatus = depositAmount <= 0
    ? 'none'
    : depositDeducted <= 0
      ? 'returned'
      : depositReturned > 0
        ? 'partial_returned'
        : 'deducted';
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
    const returnStatus = isFullReturn ? 'returned' : 'partially_returned';
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
      totalFee
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

    productRefs.forEach(({ item, ref }, index) => {
      const condition = conditionByProduct[getProductId(item)] || 'good';
      const nextStock = calculateStockAfterReturn(productSnapshots[index].data(), getItemQty(item), condition);
      dbTransaction.update(ref, nextStock);
    });

    dbTransaction.set(auditDoc('RETURN_RENTAL', selectedTrx.id), buildAuditPayload({
      action: 'RETURN_RENTAL',
      before,
      after: { ...before, ...transactionUpdates },
      entityId: selectedTrx.id
    }));
  });
};

export const voidTransaction = async (trx, { reason = 'Dibatalkan dari laporan', operatorId = 'system' } = {}) => {
  const transactionRef = dataDoc('transactions', trx.id);
  let stockRestoreWarnings = [];

  await runTransaction(getDb(), async (dbTransaction) => {
    const transactionSnapshot = await dbTransaction.get(transactionRef);
    if (!transactionSnapshot.exists()) {
      throw new Error(`Transaksi ${trx.id} tidak ditemukan.`);
    }

    const before = transactionSnapshot.data();
    if (before.status === 'void') {
      throw new Error(`Transaksi ${trx.id} sudah void.`);
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
          stockAvailable: stock.stockAvailable + qty,
          stockRented: Math.max(0, stock.stockRented - qty)
        };
        dbTransaction.update(ref, {
          ...restored,
          stock: restored.stockAvailable
        });
      });
    }

    const after = {
      ...before,
      status: 'void',
      stockRestored: shouldRestoreStock,
      voidAt: new Date().toISOString(),
      voidBy: operatorId,
      voidReason: reason
    };

    dbTransaction.update(transactionRef, after);
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

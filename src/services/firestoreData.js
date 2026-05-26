import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';

import { formatDateInput } from '../utils/format';
import { normalizeProduct } from '../utils/product';
import { appId, db } from './firebase';

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

const auditPayload = ({ action, after = null, before = null, entityId, operatorId = 'system' }) => ({
  action,
  after,
  before,
  createdAt: serverTimestamp(),
  entityId,
  entityType: 'transaction',
  operatorId
});

const getItemQty = (item) => Number(item.qty || 0);

export const listenToAppData = ({ onProducts, onCustomers, onTransactions, onUsers, onError }) => {
  const unsubscribers = [];
  const started = {
    products: false,
    customers: false,
    transactions: false
  };

  const startTransactions = () => {
    if (started.transactions) return;
    started.transactions = true;

    const unsubscribe = onSnapshot(
      query(dataCollection('transactions'), orderBy('rentDate', 'desc'), limit(100)),
      (snap) => onTransactions(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
      (error) => onError?.('transactions', error)
    );
    unsubscribers.push(unsubscribe);
  };

  const startCustomers = () => {
    if (started.customers) return;
    started.customers = true;

    const unsubscribe = onSnapshot(
      dataCollection('customers'),
      (snap) => {
        onCustomers(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
        startTransactions();
      },
      (error) => {
        onError?.('customers', error);
        startTransactions();
      }
    );
    unsubscribers.push(unsubscribe);
  };

  const startProducts = () => {
    if (started.products) return;
    started.products = true;

    const unsubscribe = onSnapshot(
      dataCollection('products'),
      (snap) => {
        onProducts(snap.docs.map(docSnap => normalizeProduct({ id: docSnap.id, ...docSnap.data() })));
        startCustomers();
      },
      (error) => {
        onError?.('products', error);
        startCustomers();
      }
    );
    unsubscribers.push(unsubscribe);
  };

  const unsubUsers = onSnapshot(
    dataCollection('users'),
    (snap) => {
      onUsers(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      startProducts();
    },
    (error) => {
      onError?.('users', error);
      startProducts();
    }
  );
  unsubscribers.push(unsubUsers);

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
};

export const listenToAppUsers = ({ onUsers, onError }) => {
  const unsubUsers = onSnapshot(
    dataCollection('users'),
    (snap) => onUsers(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('users', error)
  );

  return () => unsubUsers();
};

export const saveCheckoutTransaction = async (newTransaction, cart) => {
  const transactionRef = dataDoc('transactions', newTransaction.id);
  const productRefs = cart.map(item => ({
    item,
    ref: dataDoc('products', item.product.id)
  }));
  const customerId = newTransaction.customerName
    ? `CUST-${sanitizeDocId(newTransaction.customerPhone || newTransaction.customerName)}`
    : '';
  const customerRef = customerId ? dataDoc('customers', customerId) : null;
  const transactionData = {
    ...newTransaction,
    createdAt: newTransaction.createdAt || new Date().toISOString()
  };

  await runTransaction(getDb(), async (dbTransaction) => {
    const productSnapshots = await Promise.all(productRefs.map(({ ref }) => dbTransaction.get(ref)));

    productSnapshots.forEach((snapshot, index) => {
      const { item } = productRefs[index];
      const qty = getItemQty(item);
      const productName = item.product?.name || item.product?.id || 'Produk';

      if (!snapshot.exists()) {
        throw new Error(`${productName} tidak ditemukan di database.`);
      }

      const currentStock = Number(snapshot.data().stock || 0);
      if (qty <= 0 || currentStock < qty) {
        throw new Error(`${productName}: stok tersisa ${currentStock} unit.`);
      }
    });

    dbTransaction.set(transactionRef, transactionData);

    productRefs.forEach(({ item, ref }, index) => {
      const productData = productSnapshots[index].data();
      const qty = getItemQty(item);
      const nextStock = Number(productData.stock || 0) - qty;
      const nextStockAvailable = Number(productData.stockAvailable ?? productData.stock ?? 0) - qty;

      dbTransaction.update(ref, {
        stock: nextStock,
        stockAvailable: nextStockAvailable
      });
    });

    if (customerRef) {
      dbTransaction.set(customerRef, {
        name: newTransaction.customerName,
        phone: newTransaction.customerPhone || '',
        address: newTransaction.customerAddress || '',
        note: newTransaction.customerNote || '',
        identityType: newTransaction.customerIdentityType || 'KTP',
        identityNumber: newTransaction.customerIdentityNumber || '',
        lastRentDate: newTransaction.rentDate,
        lastTransactionId: newTransaction.id,
        depositAmount: newTransaction.depositAmount || 0
      }, { merge: true });
    }

    dbTransaction.set(auditDoc('checkout', newTransaction.id), auditPayload({
      action: 'checkout',
      after: transactionData,
      entityId: newTransaction.id
    }));
  });
};

export const updateCustomerProfile = async (customer) => {
  await setDoc(dataDoc('customers', customer.id), {
    address: customer.address || '',
    note: customer.note || '',
    identityType: customer.identityType || 'KTP',
    identityNumber: customer.identityNumber || '',
    depositAmount: Number(customer.depositAmount || 0)
  }, { merge: true });
};

export const completeReturnTransaction = async (selectedTrx) => {
  const lateFee = Number(selectedTrx.lateFee || selectedTrx.calculatedFine || 0);
  const conditionFee = Number(selectedTrx.conditionFee || 0);
  const totalFee = Number(selectedTrx.totalFee || lateFee + conditionFee);
  const paymentMethod = selectedTrx.paymentMethod || 'Tunai';
  const paymentMethodForFees = selectedTrx.paymentMethodForFees || paymentMethod;
  const notes = selectedTrx.notes || '';

  const itemConditions = Array.isArray(selectedTrx.itemConditions)
    ? selectedTrx.itemConditions
    : Object.entries(selectedTrx.itemConditions || {}).map(([productId, condition]) => {
        const item = (selectedTrx.items || []).find(cartItem => cartItem.product?.id === productId);
        const productName = item?.product?.name || productId;
        const rentPrice = Number(item?.product?.rentPrice || 0);
        let fee = 0;
        if (condition === 'Kotor/Laundry') fee = Math.max(15000, Math.round(rentPrice * 0.1));
        if (condition === 'Rusak Ringan') fee = Math.max(25000, Math.round(rentPrice * 0.25));
        if (condition === 'Rusak Berat') fee = Math.max(50000, Math.round(rentPrice * 0.5));
        if (condition === 'Hilang') fee = rentPrice;

        return {
          productId,
          productName,
          condition,
          fee,
          note: ''
        };
      });

  const returnInfo = {
    returnedAt: new Date().toISOString(),
    paymentMethod,
    paymentMethodForFees,
    notes,
    lateDays: Number(selectedTrx.calculatedLateDays || 0),
    lateFee,
    conditionFee,
    totalFee,
    itemConditions,
    status: 'selesai'
  };

  const transactionRef = dataDoc('transactions', selectedTrx.id);
  const productRefs = (selectedTrx.items || [])
    .filter(item => item.product?.id)
    .map(item => ({
      item,
      ref: dataDoc('products', item.product.id)
    }));
  const transactionUpdates = {
    status: 'selesai',
    returnDate: formatDateInput(),
    paymentMethod,
    paymentMethodForFees,
    notes,
    lateFee,
    conditionFee,
    totalFee,
    returnInfo
  };

  await runTransaction(getDb(), async (dbTransaction) => {
    const transactionSnapshot = await dbTransaction.get(transactionRef);
    if (!transactionSnapshot.exists()) {
      throw new Error(`Transaksi ${selectedTrx.id} tidak ditemukan.`);
    }

    const before = transactionSnapshot.data();
    if (before.status !== 'disewa') {
      throw new Error(`Transaksi ${selectedTrx.id} sudah tidak aktif.`);
    }

    const productSnapshots = await Promise.all(productRefs.map(({ ref }) => dbTransaction.get(ref)));
    productSnapshots.forEach((snapshot, index) => {
      const productName = productRefs[index].item.product?.name || productRefs[index].item.product?.id || 'Produk';
      if (!snapshot.exists()) {
        throw new Error(`${productName} tidak ditemukan di database.`);
      }
    });

    dbTransaction.update(transactionRef, transactionUpdates);

    productRefs.forEach(({ item, ref }, index) => {
      const productData = productSnapshots[index].data();
      const qty = getItemQty(item);

      dbTransaction.update(ref, {
        stock: Number(productData.stock || 0) + qty,
        stockAvailable: Number(productData.stockAvailable ?? productData.stock ?? 0) + qty
      });
    });

    dbTransaction.set(auditDoc('return', selectedTrx.id), auditPayload({
      action: 'return',
      before,
      after: { ...before, ...transactionUpdates },
      entityId: selectedTrx.id
    }));
  });
};

export const saveProduct = async (productData, isEdit) => {
  const id = isEdit ? productData.id : `P-${Date.now()}`;
  const finalData = { ...productData, id };
  await setDoc(dataDoc('products', id), finalData, { merge: true });
};

export const deleteProduct = async (id) => {
  await deleteDoc(dataDoc('products', id));
};

export const updateAppUser = async (userData) => {
  await setDoc(dataDoc('users', userData.id), userData, { merge: true });
};

export const deleteTransaction = async (trx) => {
  const transactionRef = dataDoc('transactions', trx.id);

  await runTransaction(getDb(), async (dbTransaction) => {
    const transactionSnapshot = await dbTransaction.get(transactionRef);
    if (!transactionSnapshot.exists()) {
      throw new Error(`Transaksi ${trx.id} tidak ditemukan.`);
    }

    const before = transactionSnapshot.data();
    const shouldRestoreStock = before.status === 'disewa';
    const productRefs = shouldRestoreStock
      ? (before.items || trx.items || [])
        .filter(item => item.product?.id)
        .map(item => ({ item, ref: dataDoc('products', item.product.id) }))
      : [];
    const productSnapshots = shouldRestoreStock
      ? await Promise.all(productRefs.map(({ ref }) => dbTransaction.get(ref)))
      : [];

    productSnapshots.forEach((snapshot, index) => {
      const productName = productRefs[index].item.product?.name || productRefs[index].item.product?.id || 'Produk';
      if (!snapshot.exists()) {
        throw new Error(`${productName} tidak ditemukan di database.`);
      }
    });

    if (shouldRestoreStock) {
      productRefs.forEach(({ item, ref }, index) => {
        const productData = productSnapshots[index].data();
        const qty = getItemQty(item);

        dbTransaction.update(ref, {
          stock: Number(productData.stock || 0) + qty,
          stockAvailable: Number(productData.stockAvailable ?? productData.stock ?? 0) + qty
        });
      });
    }

    dbTransaction.delete(transactionRef);
    dbTransaction.set(auditDoc('delete', trx.id), auditPayload({
      action: 'delete',
      before,
      entityId: trx.id
    }));
  });

  return {
    stockRestoreWarnings: []
  };
};

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

export const seedInitialData = async ({ users, products }) => {
  for (const user of users) {
    await setDoc(dataDoc('users', user.id), user);
  }

  for (const product of products) {
    await setDoc(dataDoc('products', product.id), product);
  }
};

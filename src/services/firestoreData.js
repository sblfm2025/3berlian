import { collection, doc, limit, onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';

import { normalizeProduct } from '../utils/product';
import { normalizeStock } from '../utils/stock';
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

const auditPayload = ({ action, after = null, before = null, entityId, entityType = 'transaction', operatorId = 'system' }) => ({
  action,
  after,
  before,
  createdAt: serverTimestamp(),
  entityId,
  entityType,
  operatorId
});

export const listenToAppData = ({ onProducts, onCustomers, onTransactions, onBookings, onUsers, onFinancialRecords, onError }) => {
  const unsubscribers = [];

  unsubscribers.push(onSnapshot(
    dataCollection('users'),
    (snap) => onUsers(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('users', error)
  ));

  unsubscribers.push(onSnapshot(
    dataCollection('products'),
    (snap) => onProducts(snap.docs.map(docSnap => normalizeProduct({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('products', error)
  ));

  unsubscribers.push(onSnapshot(
    dataCollection('customers'),
    (snap) => onCustomers(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('customers', error)
  ));

  unsubscribers.push(onSnapshot(
    query(dataCollection('transactions'), orderBy('rentDate', 'desc'), limit(100)),
    (snap) => onTransactions(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('transactions', error)
  ));

  unsubscribers.push(onSnapshot(
    query(dataCollection('bookings'), orderBy('createdAt', 'desc'), limit(150)),
    (snap) => onBookings(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('bookings', error)
  ));

  unsubscribers.push(onSnapshot(
    query(dataCollection('financialRecords'), orderBy('createdAt', 'desc'), limit(300)),
    (snap) => onFinancialRecords?.(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('financialRecords', error)
  ));

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

export const updateCustomerProfile = async (customer) => {
  await setDoc(dataDoc('customers', customer.id), {
    address: customer.address || '',
    note: customer.note || '',
    riskNote: customer.riskNote || '',
    identityType: customer.identityType || 'KTP',
    identityNumber: customer.identityNumber || '',
    depositAmount: Number(customer.depositAmount || 0)
  }, { merge: true });
};

export const saveProduct = async (productData, isEdit) => {
  const id = isEdit ? productData.id : `P-${Date.now()}`;
  const productRef = dataDoc('products', id);
  const stock = normalizeStock(productData);
  const finalData = normalizeProduct({
    ...productData,
    ...stock,
    id,
    isActive: productData.isActive ?? productData.status !== 'inactive'
  });

  await runTransaction(getDb(), async (dbTransaction) => {
    const productSnapshot = await dbTransaction.get(productRef);
    const before = productSnapshot.exists() ? productSnapshot.data() : null;

    dbTransaction.set(productRef, finalData, { merge: true });
    dbTransaction.set(auditDoc(isEdit ? 'EDIT_PRODUCT' : 'CREATE_PRODUCT', id), auditPayload({
      action: isEdit ? 'EDIT_PRODUCT' : 'CREATE_PRODUCT',
      before,
      after: finalData,
      entityId: id,
      entityType: 'product'
    }));
  });
};

export const deleteProduct = async (id) => {
  const productRef = dataDoc('products', id);

  await runTransaction(getDb(), async (dbTransaction) => {
    const productSnapshot = await dbTransaction.get(productRef);
    if (!productSnapshot.exists()) {
      throw new Error(`Produk ${id} tidak ditemukan.`);
    }

    const before = productSnapshot.data();
    const after = {
      ...before,
      deletedAt: new Date().toISOString(),
      isActive: false,
      status: 'inactive'
    };

    dbTransaction.update(productRef, after);
    dbTransaction.set(auditDoc('DEACTIVATE_PRODUCT', id), auditPayload({
      action: 'DEACTIVATE_PRODUCT',
      before,
      after,
      entityId: id,
      entityType: 'product'
    }));
  });
};

export const updateAppUser = async (userData) => {
  await setDoc(dataDoc('users', userData.id), userData, { merge: true });
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

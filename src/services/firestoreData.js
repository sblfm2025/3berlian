import { collection, deleteDoc, doc, increment, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

import { formatDateInput } from '../utils/format';
import { normalizeProduct } from '../utils/product';
import { appId, db } from './firebase';

const getDb = () => {
  if (!db) throw new Error('Database aplikasi belum siap.');
  return db;
};

const dataCollection = (name) => collection(getDb(), 'artifacts', appId, 'public', 'data', name);
const dataDoc = (name, id) => doc(dataCollection(name), id);

export const listenToAppData = ({ onProducts, onCustomers, onTransactions, onUsers, onError }) => {
  const unsubProducts = onSnapshot(
    dataCollection('products'),
    (snap) => onProducts(snap.docs.map(docSnap => normalizeProduct({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('products', error)
  );

  const unsubCustomers = onSnapshot(
    dataCollection('customers'),
    (snap) => onCustomers(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('customers', error)
  );

  const unsubTransactions = onSnapshot(
    dataCollection('transactions'),
    (snap) => onTransactions(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('transactions', error)
  );

  const unsubUsers = onSnapshot(
    dataCollection('users'),
    (snap) => onUsers(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
    (error) => onError?.('users', error)
  );

  return () => {
    unsubProducts();
    unsubCustomers();
    unsubTransactions();
    unsubUsers();
  };
};

export const saveCheckoutTransaction = async (newTransaction, cart) => {
  await setDoc(dataDoc('transactions', newTransaction.id), newTransaction);

  for (const item of cart) {
    await updateDoc(dataDoc('products', item.product.id), {
      stock: increment(-item.qty),
      stockAvailable: increment(-item.qty)
    });
  }

  if (newTransaction.customerName) {
    const customerId = newTransaction.customerPhone
      ? `CUST-${newTransaction.customerPhone}`
      : `CUST-${newTransaction.customerName.replace(/\s+/g, '-').toLowerCase()}`;

    await setDoc(dataDoc('customers', customerId), {
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

  await updateDoc(dataDoc('transactions', selectedTrx.id), {
    status: 'selesai',
    returnDate: formatDateInput(),
    paymentMethod,
    paymentMethodForFees,
    notes,
    lateFee,
    conditionFee,
    totalFee,
    returnInfo
  });

  for (const item of selectedTrx.items) {
    await updateDoc(dataDoc('products', item.product.id), {
      stock: increment(item.qty),
      stockAvailable: increment(item.qty)
    });
  }
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
  if (trx.status === 'disewa') {
    for (const item of trx.items) {
      await updateDoc(dataDoc('products', item.product.id), {
        stock: increment(item.qty),
        stockAvailable: increment(item.qty)
      });
    }
  }

  await deleteDoc(dataDoc('transactions', trx.id));
};

export const editTransaction = async (updatedTrx) => {
  await updateDoc(dataDoc('transactions', updatedTrx.id), updatedTrx);
};

export const seedInitialData = async ({ users, products }) => {
  for (const user of users) {
    await setDoc(dataDoc('users', user.id), user);
  }

  for (const product of products) {
    await setDoc(dataDoc('products', product.id), product);
  }
};

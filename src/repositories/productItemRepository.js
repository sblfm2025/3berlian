import { collection, getDocs, query, where, runTransaction } from 'firebase/firestore';
import { auditDoc, auditPayload, dataDoc, getDb } from './baseRepository';

/**
 * Mengambil seluruh unit item fisik aktif untuk suatu produk.
 */
export const getProductItems = async (productId) => {
  const db = getDb();
  const itemsRef = collection(db, 'product_items');
  const q = query(itemsRef, where('productId', '==', productId), where('deleted', '==', false));
  const snapshot = await getDocs(q);

  const items = [];
  snapshot.forEach(doc => {
    items.push({ id: doc.id, ...doc.data() });
  });

  // Urutkan berdasarkan itemCode secara alfabetis
  return items.sort((a, b) => (a.itemCode || '').localeCompare(b.itemCode || ''));
};

/**
 * Menyimpan atau memperbarui data unit item fisik spesifik.
 */
export const saveProductItem = async (itemData) => {
  const db = getDb();
  const itemId = itemData.id || itemData.itemCode;
  const itemRef = dataDoc('product_items', itemId);

  const finalData = {
    ...itemData,
    id: itemId,
    updatedAt: new Date().toISOString(),
    deleted: itemData.deleted || false
  };

  if (!itemData.createdAt) {
    finalData.createdAt = new Date().toISOString();
  }

  await runTransaction(db, async (dbTransaction) => {
    dbTransaction.set(itemRef, finalData, { merge: true });

    // Log audit pergerakan unit item fisik
    dbTransaction.set(auditDoc('SAVE_PRODUCT_ITEM', itemId), auditPayload({
      action: 'SAVE_PRODUCT_ITEM',
      after: finalData,
      entityId: itemId,
      entityType: 'product_item',
      operatorId: itemData.operatorId || 'system'
    }));
  });

  return finalData;
};

/**
 * Generator otomatis unit item fisik berurutan untuk produk.
 * Contoh: BUGIS, ukuran L, jumlah 3 unit -> BUGIS-L-001, BUGIS-L-002, BUGIS-L-003.
 */
export const generateItemsForProduct = async (product, size, qty, operatorId = 'system') => {
  const db = getDb();
  const productId = product.id;
  const productCode = (product.code || product.name || 'COSTUME')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);

  const existingItems = await getProductItems(productId);
  const sizeItems = existingItems.filter(item => item.size === size);

  // Mencari nomor urut terbesar dari item fisik ber-ukuran sama yang sudah ada
  let startNumber = 1;
  sizeItems.forEach(item => {
    const parts = (item.itemCode || '').split('-');
    const numPart = Number(parts[parts.length - 1]);
    if (!isNaN(numPart) && numPart >= startNumber) {
      startNumber = numPart + 1;
    }
  });

  const generatedItems = [];
  for (let i = 0; i < qty; i++) {
    const sequence = String(startNumber + i).padStart(3, '0');
    const itemCode = `${productCode}-${size}-${sequence}`;

    generatedItems.push({
      id: itemCode,
      itemCode,
      productId,
      size,
      condition: 'good', // default bagus
      status: 'READY', // default siap sewa
      location: product.location || 'Gudang Utama',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false
    });
  }

  // Simpan seluruh item secara batch
  await runTransaction(db, async (dbTransaction) => {
    generatedItems.forEach(item => {
      const itemRef = dataDoc('product_items', item.id);
      dbTransaction.set(itemRef, item);

      dbTransaction.set(auditDoc('GENERATE_PRODUCT_ITEM', item.id), auditPayload({
        action: 'GENERATE_PRODUCT_ITEM',
        after: item,
        entityId: item.id,
        entityType: 'product_item',
        operatorId
      }));
    });
  });

  return generatedItems;
};

/**
 * Menyimpan sesi rekapitulasi stock opname dan discrepancy report.
 */
export const saveStockOpnameSession = async (sessionData) => {
  const db = getDb();
  const dateKey = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const sessionId = `OPNAME-${dateKey}-${uniqueId}`;

  const sessionRef = dataDoc('stockOpnames', sessionId);
  const finalData = {
    ...sessionData,
    id: sessionId,
    sessionId,
    createdAt: new Date().toISOString()
  };

  await runTransaction(db, async (dbTransaction) => {
    dbTransaction.set(sessionRef, finalData);

    // Log audit stock opname
    dbTransaction.set(auditDoc('STOCK_OPNAME', sessionId), auditPayload({
      action: 'STOCK_OPNAME_ADJUSTMENT',
      after: finalData,
      entityId: sessionId,
      entityType: 'inventory',
      operatorId: sessionData.createdBy || 'system'
    }));
  });

  return finalData;
};

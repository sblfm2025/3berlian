import { runTransaction } from 'firebase/firestore';
import { normalizeProduct } from '../utils/product';
import { normalizeStock } from '../utils/stock';
import { auditDoc, auditPayload, dataDoc, getDb } from './baseRepository';

/**
 * Membuat dokumen log pergerakan stok secara historis.
 */
export const createInventoryLog = (dbTransaction, logData) => {
  const logId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const logRef = dataDoc('inventoryLogs', logId);
  const payload = {
    productId: logData.productId,
    itemId: logData.itemId || '',
    movementType: logData.movementType, // e.g., 'RENT_OUT', 'RETURN_IN', 'LAUNDRY_DONE', etc.
    qty: Number(logData.qty || 0),
    fromStatus: logData.fromStatus || '',
    toStatus: logData.toStatus || '',
    transactionId: logData.transactionId || '',
    actorId: logData.actorId || 'system',
    notes: logData.notes || '',
    createdAt: new Date().toISOString()
  };
  dbTransaction.set(logRef, payload);
};

/**
 * Menyimpan data produk ke Firestore (menambahkan baru atau memperbarui).
 */
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
      entityType: 'product',
      operatorId: productData.operatorId || 'system'
    }));

    // Mencatat log pergerakan stok jika terjadi penyesuaian stok
    const beforeStock = before ? normalizeStock(before) : normalizeStock({});
    const afterStock = stock;
    const diffTotal = afterStock.totalStock - beforeStock.totalStock;
    const diffAvailable = afterStock.availableStock - beforeStock.availableStock;

    if (!before || diffTotal !== 0 || diffAvailable !== 0) {
      createInventoryLog(dbTransaction, {
        productId: id,
        movementType: isEdit ? 'ADJUSTMENT' : 'PURCHASE',
        qty: diffTotal !== 0 ? Math.abs(diffTotal) : Math.abs(diffAvailable),
        fromStatus: before ? `Tersedia: ${beforeStock.availableStock}, Total: ${beforeStock.totalStock}` : 'NONE',
        toStatus: `Tersedia: ${afterStock.availableStock}, Total: ${afterStock.totalStock}`,
        actorId: productData.operatorId || 'system',
        notes: productData.adjustmentReason || (isEdit ? 'Penyesuaian stok manual' : 'Stok awal produk baru')
      });
    }

    // Generator otomatis unit item fisik unik jika stok bertambah (diffTotal > 0 atau produk baru)
    const totalToGenerate = !before ? afterStock.totalStock : diffTotal;
    if (totalToGenerate > 0) {
      const productCode = (finalData.sku || finalData.name || 'COSTUME')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6);
      const sizeLabel = finalData.size || '-';

      const counterRef = dataDoc('counters', `item-${id}`);
      const counterSnapshot = await dbTransaction.get(counterRef);
      const lastSequence = Number(counterSnapshot.exists() ? counterSnapshot.data().lastSequence || 0 : 0);

      for (let i = 0; i < totalToGenerate; i++) {
        const seq = lastSequence + i + 1;
        const sequenceStr = String(seq).padStart(3, '0');
        const itemCode = `${productCode}-${sizeLabel}-${sequenceStr}`;
        const itemRef = dataDoc('product_items', itemCode);

        const itemPayload = {
          id: itemCode,
          itemCode,
          productId: id,
          size: sizeLabel,
          condition: 'good',
          status: 'READY',
          location: finalData.location || 'Gudang Utama',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deleted: false
        };

        dbTransaction.set(itemRef, itemPayload);

        dbTransaction.set(auditDoc('GENERATE_PRODUCT_ITEM', itemCode), auditPayload({
          action: 'GENERATE_PRODUCT_ITEM',
          after: itemPayload,
          entityId: itemCode,
          entityType: 'product_item',
          operatorId: productData.operatorId || 'system'
        }));
      }

      dbTransaction.set(counterRef, {
        productId: id,
        lastSequence: lastSequence + totalToGenerate,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  });
};

/**
 * Menonaktifkan produk (soft-delete) di Firestore.
 */
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

/**
 * Menyelesaikan laundry: memindahkan laundryStock ke availableStock
 */
export const completeLaundry = async (productId, qty, operatorId = 'system') => {
  const productRef = dataDoc('products', productId);
  const quantityToMove = Number(qty || 0);

  if (quantityToMove <= 0) throw new Error('Jumlah laundry selesai harus lebih dari 0.');

  await runTransaction(getDb(), async (dbTransaction) => {
    const snapshot = await dbTransaction.get(productRef);
    if (!snapshot.exists()) throw new Error('Produk tidak ditemukan.');

    const before = snapshot.data();
    const stock = normalizeStock(before);

    if (stock.laundryStock < quantityToMove) {
      throw new Error(`Jumlah laundry selesai (${quantityToMove}) melebihi stok laundry saat ini (${stock.laundryStock}).`);
    }

    const nextStock = {
      ...stock,
      laundryStock: stock.laundryStock - quantityToMove,
      availableStock: stock.availableStock + quantityToMove,
      stockLaundry: stock.laundryStock - quantityToMove,
      stockAvailable: stock.availableStock + quantityToMove,
      stock: stock.availableStock + quantityToMove
    };

    dbTransaction.update(productRef, nextStock);

    createInventoryLog(dbTransaction, {
      productId,
      movementType: 'LAUNDRY_DONE',
      qty: quantityToMove,
      fromStatus: 'IN_LAUNDRY',
      toStatus: 'READY',
      actorId: operatorId,
      notes: 'Selesai proses cuci laundry'
    });

    dbTransaction.set(auditDoc('LAUNDRY_DONE', productId), auditPayload({
      action: 'LAUNDRY_DONE',
      before,
      after: { ...before, ...nextStock },
      entityId: productId,
      entityType: 'product',
      operatorId
    }));
  });
};

/**
 * Menyelesaikan perbaikan: memindahkan maintenanceStock ke availableStock
 */
export const completeMaintenance = async (productId, qty, operatorId = 'system') => {
  const productRef = dataDoc('products', productId);
  const quantityToMove = Number(qty || 0);

  if (quantityToMove <= 0) throw new Error('Jumlah perbaikan selesai harus lebih dari 0.');

  await runTransaction(getDb(), async (dbTransaction) => {
    const snapshot = await dbTransaction.get(productRef);
    if (!snapshot.exists()) throw new Error('Produk tidak ditemukan.');

    const before = snapshot.data();
    const stock = normalizeStock(before);

    if (stock.maintenanceStock < quantityToMove) {
      throw new Error(`Jumlah perbaikan selesai (${quantityToMove}) melebihi stok perbaikan saat ini (${stock.maintenanceStock}).`);
    }

    const nextStock = {
      ...stock,
      maintenanceStock: stock.maintenanceStock - quantityToMove,
      availableStock: stock.availableStock + quantityToMove,
      stockDamaged: stock.maintenanceStock - quantityToMove,
      stockAvailable: stock.availableStock + quantityToMove,
      stock: stock.availableStock + quantityToMove
    };

    dbTransaction.update(productRef, nextStock);

    createInventoryLog(dbTransaction, {
      productId,
      movementType: 'MAINTENANCE_DONE',
      qty: quantityToMove,
      fromStatus: 'IN_MAINTENANCE',
      toStatus: 'READY',
      actorId: operatorId,
      notes: 'Selesai proses perbaikan kostum'
    });

    dbTransaction.set(auditDoc('MAINTENANCE_DONE', productId), auditPayload({
      action: 'MAINTENANCE_DONE',
      before,
      after: { ...before, ...nextStock },
      entityId: productId,
      entityType: 'product',
      operatorId
    }));
  });
};

/**
 * Pensiunkan kostum: memindahkan stok dari bucket manapun ke retiredStock
 */
export const retireCostume = async (productId, qty, fromBucket = 'available', operatorId = 'system') => {
  const productRef = dataDoc('products', productId);
  const quantityToMove = Number(qty || 0);

  if (quantityToMove <= 0) throw new Error('Jumlah kostum dipensiunkan harus lebih dari 0.');

  await runTransaction(getDb(), async (dbTransaction) => {
    const snapshot = await dbTransaction.get(productRef);
    if (!snapshot.exists()) throw new Error('Produk tidak ditemukan.');

    const before = snapshot.data();
    const stock = normalizeStock(before);

    const nextStock = { ...stock };

    if (fromBucket === 'available' || fromBucket === 'ready') {
      if (stock.availableStock < quantityToMove) throw new Error(`Stok tersedia (${stock.availableStock}) tidak cukup.`);
      nextStock.availableStock -= quantityToMove;
      nextStock.stockAvailable = nextStock.availableStock;
      nextStock.stock = nextStock.availableStock;
    } else if (fromBucket === 'laundry') {
      if (stock.laundryStock < quantityToMove) throw new Error(`Stok laundry (${stock.laundryStock}) tidak cukup.`);
      nextStock.laundryStock -= quantityToMove;
      nextStock.stockLaundry = nextStock.laundryStock;
    } else if (fromBucket === 'maintenance' || fromBucket === 'damaged') {
      if (stock.maintenanceStock < quantityToMove) throw new Error(`Stok perbaikan (${stock.maintenanceStock}) tidak cukup.`);
      nextStock.maintenanceStock -= quantityToMove;
      nextStock.stockDamaged = nextStock.maintenanceStock;
    } else {
      throw new Error(`Bucket asal pensiun ${fromBucket} tidak didukung.`);
    }

    nextStock.retiredStock = (stock.retiredStock || 0) + quantityToMove;

    dbTransaction.update(productRef, nextStock);

    createInventoryLog(dbTransaction, {
      productId,
      movementType: 'MARK_RETIRED',
      qty: quantityToMove,
      fromStatus: fromBucket.toUpperCase(),
      toStatus: 'RETIRED',
      actorId: operatorId,
      notes: `Kostum dipensiunkan dari bucket ${fromBucket}`
    });

    dbTransaction.set(auditDoc('MARK_RETIRED', productId), auditPayload({
      action: 'MARK_RETIRED',
      before,
      after: { ...before, ...nextStock },
      entityId: productId,
      entityType: 'product',
      operatorId
    }));
  });
};

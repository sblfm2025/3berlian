import { runTransaction } from 'firebase/firestore';
import { auditDoc, auditPayload, dataDoc, getDb } from './baseRepository';
import { normalizeStock } from '../utils/stock';

/**
 * Status Siklus Booking
 */
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  CONVERTED_TO_RENTAL: 'CONVERTED_TO_RENTAL'
};

/**
 * Fungsi untuk mendeteksi overlap tanggal
 */
export const isDateOverlap = (start1, end1, start2, end2) => {
  const s1 = new Date(start1).toISOString().split('T')[0];
  const e1 = new Date(end1).toISOString().split('T')[0];
  const s2 = new Date(start2).toISOString().split('T')[0];
  const e2 = new Date(end2).toISOString().split('T')[0];

  return s1 <= e2 && e1 >= s2;
};

/**
 * Memeriksa ketersediaan produk pada rentang tanggal tertentu secara realtime.
 * Fungsi ini membandingkan sewa aktif dan booking terkonfirmasi lainnya.
 */
export const checkProductAvailability = (product, transactionsList, bookingsList, startDate, endDate, excludeBookingId = null) => {
  const stock = normalizeStock(product);
  const targetStart = startDate;
  const targetEnd = endDate;

  if (!targetStart || !targetEnd) return stock.availableStock;

  // 1. Hitung kostum yang sedang disewa pada tanggal tersebut
  const overlapRentQty = transactionsList.reduce((sum, trx) => {
    const isActive = ['rented', 'disewa', 'overdue', 'ACTIVE_RENTAL', 'RETURNED_PARTIAL', 'OVERDUE'].includes(trx.status);
    if (!isActive) return sum;

    const overlap = isDateOverlap(trx.rentedAt || trx.rentDate, trx.expectedReturnDate, targetStart, targetEnd);
    if (!overlap) return sum;

    // Cari item yang sesuai
    const item = trx.items?.find(cartItem => (cartItem.productId || cartItem.product?.id) === product.id);
    return sum + Number(item?.qty || 0);
  }, 0);

  // 2. Hitung booking terkonfirmasi/pending lain yang overlap pada tanggal tersebut
  const overlapBookingQty = bookingsList.reduce((sum, book) => {
    if (book.id === excludeBookingId) return sum;

    const isReserved = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING].includes(book.status);
    if (!isReserved) return sum;

    const overlap = isDateOverlap(book.startDate, book.endDate, targetStart, targetEnd);
    if (!overlap) return sum;

    const item = book.items?.find(cartItem => (cartItem.productId || cartItem.product?.id) === product.id);
    return sum + Number(item?.qty || 0);
  }, 0);

  // 3. Sisa stok tersedia pada rentang tanggal target
  const nonRentableStock = stock.laundryStock + stock.maintenanceStock + stock.retiredStock + stock.lostStock;
  const simulatedAvailable = Math.max(0, stock.totalStock - (overlapRentQty + overlapBookingQty + nonRentableStock));

  return simulatedAvailable;
};

/**
 * Membuat data booking baru di Firestore.
 */
export const createBooking = async (bookingData) => {
  const dateKey = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bookingNumber = `BOOK-${dateKey}-${uniqueId}`;

  const bookingRef = dataDoc('bookings', bookingNumber);
  const finalData = {
    ...bookingData,
    id: bookingNumber,
    bookingNumber,
    status: bookingData.status || BOOKING_STATUS.CONFIRMED,
    createdAt: new Date().toISOString(),
    createdBy: bookingData.createdBy || 'system'
  };

  await runTransaction(getDb(), async (dbTransaction) => {
    dbTransaction.set(bookingRef, finalData);
    dbTransaction.set(auditDoc('CREATE_BOOKING', bookingNumber), auditPayload({
      action: 'CREATE_BOOKING',
      after: finalData,
      entityId: bookingNumber,
      entityType: 'booking',
      operatorId: bookingData.createdBy || 'system'
    }));
  });

  return finalData;
};

/**
 * Membatalkan booking dengan menyertakan alasan.
 */
export const cancelBooking = async (bookingId, reason, operatorId = 'system') => {
  const bookingRef = dataDoc('bookings', bookingId);

  await runTransaction(getDb(), async (dbTransaction) => {
    const snapshot = await dbTransaction.get(bookingRef);
    if (!snapshot.exists()) throw new Error('Data booking tidak ditemukan.');

    const before = snapshot.data();
    if (before.status === BOOKING_STATUS.CANCELLED) throw new Error('Booking sudah dibatalkan sebelumnya.');

    const after = {
      ...before,
      status: BOOKING_STATUS.CANCELLED,
      cancelledAt: new Date().toISOString(),
      cancelledBy: operatorId,
      cancelReason: reason
    };

    dbTransaction.update(bookingRef, {
      status: BOOKING_STATUS.CANCELLED,
      cancelledAt: after.cancelledAt,
      cancelledBy: operatorId,
      cancelReason: reason
    });

    dbTransaction.set(auditDoc('CANCEL_BOOKING', bookingId), auditPayload({
      action: 'CANCEL_BOOKING',
      before,
      after,
      entityId: bookingId,
      entityType: 'booking',
      operatorId
    }));
  });
};

/**
 * Mengonversi status booking menjadi CONVERTED_TO_RENTAL secara aman.
 */
export const convertBookingStatus = async (bookingId, operatorId = 'system') => {
  const bookingRef = dataDoc('bookings', bookingId);

  await runTransaction(getDb(), async (dbTransaction) => {
    const snapshot = await dbTransaction.get(bookingRef);
    if (!snapshot.exists()) throw new Error('Data booking tidak ditemukan.');

    const before = snapshot.data();

    dbTransaction.update(bookingRef, {
      status: BOOKING_STATUS.CONVERTED_TO_RENTAL,
      convertedAt: new Date().toISOString(),
      convertedBy: operatorId
    });

    dbTransaction.set(auditDoc('CONVERT_BOOKING_STATUS', bookingId), auditPayload({
      action: 'CONVERT_BOOKING_STATUS',
      before,
      after: { ...before, status: BOOKING_STATUS.CONVERTED_TO_RENTAL },
      entityId: bookingId,
      entityType: 'booking',
      operatorId
    }));
  });
};

import { runTransaction } from 'firebase/firestore';
import { auditDoc, auditPayload, dataDoc, getDb } from './baseRepository';

/**
 * Menyimpan data tutup kas harian (Daily Cash Closing) ke Firestore secara atomik.
 */
export const saveCashClosing = async (closingData) => {
  const dateKey = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const closingId = `CLOSE-${dateKey}-${uniqueId}`;

  const closingRef = dataDoc('cashClosings', closingId);
  const finalData = {
    ...closingData,
    id: closingId,
    closingNumber: closingId,
    createdAt: new Date().toISOString()
  };

  await runTransaction(getDb(), async (dbTransaction) => {
    dbTransaction.set(closingRef, finalData);
    dbTransaction.set(auditDoc('DAILY_CASH_CLOSING', closingId), auditPayload({
      action: 'DAILY_CASH_CLOSING',
      after: finalData,
      entityId: closingId,
      entityType: 'finance',
      operatorId: closingData.closedBy || 'system'
    }));
  });

  return finalData;
};

import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { appId, db } from '../services/firebase';

export const getDb = () => {
  if (!db) throw new Error('Database aplikasi belum siap.');
  return db;
};

export const dataCollection = (name) => collection(getDb(), 'artifacts', appId, 'public', 'data', name);

export const dataDoc = (name, id) => doc(dataCollection(name), id);

export const sanitizeDocId = (value) => String(value || '')
  .trim()
  .replace(/[/.#[\]]/g, '-')
  .replace(/\s+/g, '-')
  .toLowerCase();

export const auditDoc = (action, entityId) => dataDoc('auditLogs', `${Date.now()}-${action}-${sanitizeDocId(entityId)}`);

export const auditPayload = ({
  action,
  after = null,
  before = null,
  entityId,
  entityType = 'transaction',
  operatorId = 'system'
}) => ({
  action,
  after,
  before,
  createdAt: serverTimestamp(),
  entityId,
  entityType,
  operatorId
});

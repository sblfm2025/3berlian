import { getRentalStatusLabel } from '../domains/rental/rentalStatus.js';

export const ACTIVE_TRANSACTION_STATUSES = [
  'rented',
  'disewa',
  'overdue',
  'partially_returned',
  'ACTIVE_RENTAL',
  'RETURNED_PARTIAL',
  'OVERDUE'
];

export const COMPLETED_TRANSACTION_STATUSES = [
  'returned',
  'selesai',
  'completed',
  'COMPLETED'
];

export const isActiveTransaction = (transaction) => ACTIVE_TRANSACTION_STATUSES.includes(transaction?.status);

export const isCompletedTransaction = (transaction) => COMPLETED_TRANSACTION_STATUSES.includes(transaction?.status);

export const normalizeTransactionStatus = (status) => {
  if (status === 'disewa') return 'rented';
  if (status === 'selesai' || status === 'completed' || status === 'COMPLETED') return 'returned';
  if (status === 'CANCELLED' || status === 'cancelled') return 'void';
  return status || 'rented';
};

export const getTransactionStatusLabel = (status) => {
  return getRentalStatusLabel(status);
};

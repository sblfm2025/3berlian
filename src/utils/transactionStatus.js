import { getRentalStatusLabel } from '../domains/rental/rentalStatus';

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
  'COMPLETED'
];

export const isActiveTransaction = (transaction) => ACTIVE_TRANSACTION_STATUSES.includes(transaction?.status);

export const isCompletedTransaction = (transaction) => COMPLETED_TRANSACTION_STATUSES.includes(transaction?.status);

export const normalizeTransactionStatus = (status) => {
  if (status === 'disewa') return 'rented';
  if (status === 'selesai') return 'returned';
  return status || 'ACTIVE_RENTAL';
};

export const getTransactionStatusLabel = (status) => {
  return getRentalStatusLabel(status);
};

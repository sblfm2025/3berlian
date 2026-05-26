export const ACTIVE_TRANSACTION_STATUSES = ['rented', 'disewa', 'overdue', 'partially_returned'];
export const COMPLETED_TRANSACTION_STATUSES = ['returned', 'selesai'];

export const isActiveTransaction = (transaction) => ACTIVE_TRANSACTION_STATUSES.includes(transaction?.status);

export const isCompletedTransaction = (transaction) => COMPLETED_TRANSACTION_STATUSES.includes(transaction?.status);

export const normalizeTransactionStatus = (status) => {
  if (status === 'disewa') return 'rented';
  if (status === 'selesai') return 'returned';
  return status || 'rented';
};

export const getTransactionStatusLabel = (status) => {
  if (status === 'rented' || status === 'disewa') return 'Disewa';
  if (status === 'returned' || status === 'selesai') return 'Selesai';
  if (status === 'overdue') return 'Terlambat';
  if (status === 'partially_returned') return 'Sebagian kembali';
  if (status === 'void') return 'Void';
  return status || '-';
};

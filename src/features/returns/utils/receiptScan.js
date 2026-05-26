export const parseReceiptScan = (value) => {
  const raw = String(value || '').trim();
  const normalized = raw.toUpperCase();

  if (normalized.startsWith('3BTRX:')) {
    return {
      type: 'transactionId',
      value: raw.slice(6).trim()
    };
  }

  return {
    type: 'invoiceNumber',
    value: raw
  };
};

export const isReturnableStatus = (status) => (
  ['rented', 'disewa', 'overdue', 'ACTIVE_RENTAL', 'RETURNED_PARTIAL', 'partially_returned'].includes(status)
);

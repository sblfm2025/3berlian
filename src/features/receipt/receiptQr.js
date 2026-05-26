import QRCode from 'qrcode';

export const getReceiptQrPayload = (transaction = {}) => (
  transaction.qrPayload || `3BTRX:${transaction.id || transaction.invoiceNumber || ''}`
);

export const createReceiptQrDataUrl = async (value) => {
  if (!value) return '';

  return QRCode.toDataURL(value, {
    width: 160,
    margin: 1,
    errorCorrectionLevel: 'M'
  });
};

import { formatDateYYYYMMDD } from './format';

export const createInvoiceNumber = (date) => {
  return `INV-${formatDateYYYYMMDD(date)}-${date.getTime().toString().slice(-4)}`;
};

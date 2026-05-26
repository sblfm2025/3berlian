export const RENTAL_STATUS = {
  DRAFT: 'DRAFT',
  BOOKED: 'BOOKED',
  CONFIRMED: 'CONFIRMED',
  ACTIVE_RENTAL: 'ACTIVE_RENTAL',
  OVERDUE: 'OVERDUE',
  RETURNED_PARTIAL: 'RETURNED_PARTIAL',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  PROBLEM: 'PROBLEM'
};

export const DEPOSIT_STATUS = {
  NOT_REQUIRED: 'NOT_REQUIRED',
  REQUIRED: 'REQUIRED',
  HELD: 'HELD',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  REFUNDED: 'REFUNDED',
  DEDUCTED: 'DEDUCTED',
  FORFEITED: 'FORFEITED'
};

export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  OVERPAID: 'OVERPAID'
};

/**
 * Menerjemahkan status transaksi ke bahasa Indonesia yang mudah dipahami kasir.
 */
export const getRentalStatusLabel = (status) => {
  switch (status) {
    case RENTAL_STATUS.DRAFT:
      return 'Draft';
    case RENTAL_STATUS.BOOKED:
      return 'Dipesan';
    case RENTAL_STATUS.CONFIRMED:
      return 'Dikonfirmasi';
    case RENTAL_STATUS.ACTIVE_RENTAL:
    case 'rented':
    case 'disewa':
      return 'Disewa';
    case RENTAL_STATUS.OVERDUE:
    case 'overdue':
      return 'Terlambat';
    case RENTAL_STATUS.RETURNED_PARTIAL:
    case 'partially_returned':
      return 'Sebagian Kembali';
    case RENTAL_STATUS.COMPLETED:
    case 'returned':
    case 'selesai':
      return 'Selesai';
    case RENTAL_STATUS.CANCELLED:
    case 'void':
      return 'Dibatalkan (Void)';
    case RENTAL_STATUS.PROBLEM:
      return 'Bermasalah';
    default:
      return status || '-';
  }
};

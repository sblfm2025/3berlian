import { RENTAL_STATUS } from './rentalStatus.js';

// Peta transisi status yang valid
const VALID_TRANSITIONS = {
  [RENTAL_STATUS.DRAFT]: [
    RENTAL_STATUS.BOOKED,
    RENTAL_STATUS.ACTIVE_RENTAL,
    RENTAL_STATUS.CANCELLED
  ],
  [RENTAL_STATUS.BOOKED]: [
    RENTAL_STATUS.CONFIRMED,
    RENTAL_STATUS.CANCELLED
  ],
  [RENTAL_STATUS.CONFIRMED]: [
    RENTAL_STATUS.ACTIVE_RENTAL,
    RENTAL_STATUS.CANCELLED
  ],
  [RENTAL_STATUS.ACTIVE_RENTAL]: [
    RENTAL_STATUS.RETURNED_PARTIAL,
    RENTAL_STATUS.COMPLETED,
    RENTAL_STATUS.OVERDUE,
    RENTAL_STATUS.CANCELLED,
    RENTAL_STATUS.PROBLEM
  ],
  [RENTAL_STATUS.OVERDUE]: [
    RENTAL_STATUS.RETURNED_PARTIAL,
    RENTAL_STATUS.COMPLETED,
    RENTAL_STATUS.CANCELLED,
    RENTAL_STATUS.PROBLEM
  ],
  [RENTAL_STATUS.RETURNED_PARTIAL]: [
    RENTAL_STATUS.COMPLETED,
    RENTAL_STATUS.CANCELLED,
    RENTAL_STATUS.PROBLEM
  ],
  [RENTAL_STATUS.COMPLETED]: [],
  [RENTAL_STATUS.CANCELLED]: [],
  [RENTAL_STATUS.PROBLEM]: [
    RENTAL_STATUS.COMPLETED,
    RENTAL_STATUS.CANCELLED
  ]
};

/**
 * Memvalidasi apakah transisi status dari status lama ke status baru diperbolehkan.
 * Juga mendukung status lama ('rented', 'partially_returned', 'returned', 'void') untuk kelancaran transisi runtime.
 */
export const canTransitionTo = (fromStatus, toStatus) => {
  // Mapping status lama ke standar baru jika diperlukan
  let normalizedFrom = fromStatus || RENTAL_STATUS.DRAFT;
  if (normalizedFrom === 'rented' || normalizedFrom === 'disewa') normalizedFrom = RENTAL_STATUS.ACTIVE_RENTAL;
  if (normalizedFrom === 'partially_returned') normalizedFrom = RENTAL_STATUS.RETURNED_PARTIAL;
  if (normalizedFrom === 'returned' || normalizedFrom === 'selesai' || normalizedFrom === 'completed') normalizedFrom = RENTAL_STATUS.COMPLETED;
  if (normalizedFrom === 'void' || normalizedFrom === 'cancelled') normalizedFrom = RENTAL_STATUS.CANCELLED;

  let normalizedTo = toStatus;
  if (normalizedTo === 'rented' || normalizedTo === 'disewa') normalizedTo = RENTAL_STATUS.ACTIVE_RENTAL;
  if (normalizedTo === 'partially_returned') normalizedTo = RENTAL_STATUS.RETURNED_PARTIAL;
  if (normalizedTo === 'returned' || normalizedTo === 'selesai' || normalizedTo === 'completed') normalizedTo = RENTAL_STATUS.COMPLETED;
  if (normalizedTo === 'void' || normalizedTo === 'cancelled') normalizedTo = RENTAL_STATUS.CANCELLED;

  if (normalizedFrom === normalizedTo) return true;

  const allowedTransitions = VALID_TRANSITIONS[normalizedFrom] || [];
  return allowedTransitions.includes(normalizedTo);
};

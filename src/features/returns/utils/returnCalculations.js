export const getLateDays = (trx) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(trx.expectedReturnDate);
  expected.setHours(0, 0, 0, 0);
  return today > expected ? Math.ceil((today - expected) / (1000 * 60 * 60 * 24)) : 0;
};

export const getDailyFine = (trx) => {
  return (trx.items || []).reduce((sum, item) => sum + (item.product.dailyLateFee || 50000) * item.qty, 0);
};

export const getConditionFee = (condition, item) => {
  const rentPrice = item.product.rentPrice || 0;

  switch (condition) {
    case 'Kotor/Laundry':
      return Math.max(15000, Math.round(rentPrice * 0.1));
    case 'Rusak Ringan':
      return Math.max(25000, Math.round(rentPrice * 0.25));
    case 'Rusak Berat':
      return Math.max(50000, Math.round(rentPrice * 0.5));
    case 'Hilang':
      return rentPrice;
    default:
      return 0;
  }
};

/**
 * Validator untuk data produk kostum.
 */
export const validateProductPayload = (productData) => {
  const errors = [];
  const name = String(productData.name || '').trim();
  const rentPrice = Number(productData.rentPrice ?? productData.dailyRentPrice ?? 0);
  const dailyLateFee = Number(productData.dailyLateFee ?? productData.lateFeePerDay ?? 0);
  const stockTotal = Number(productData.stockTotal ?? productData.stock ?? 0);

  if (!name) {
    errors.push('Nama produk belum diisi.');
  }

  if (productData.isEdit && !productData.id) {
    errors.push('ID produk tidak valid untuk pembaruan.');
  }

  if (rentPrice < 0) {
    errors.push('Harga sewa tidak boleh kurang dari 0.');
  }

  if (dailyLateFee < 0) {
    errors.push('Denda keterlambatan harian tidak boleh kurang dari 0.');
  }

  if (stockTotal < 0) {
    errors.push('Jumlah stok total tidak boleh kurang dari 0.');
  }

  return {
    errors,
    isValid: errors.length === 0
  };
};

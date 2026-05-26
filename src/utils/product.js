export const normalizeProduct = (product) => {
  const rentPrice = Number(product.dailyRentPrice ?? product.rentPrice ?? product.price ?? 0);
  const dailyLateFee = Number(product.lateFeePerDay ?? product.dailyLateFee ?? product.lateFee ?? 50000);
  const stockTotal = Number(product.stockTotal ?? product.stock ?? 0);
  const stockAvailable = Number(product.stockAvailable ?? product.stock ?? stockTotal);

  return {
    ...product,
    sku: product.sku || product.id?.slice(0, 8)?.toUpperCase() || '',
    category: product.category || 'Lainnya',
    size: product.size || '-',
    color: product.color || '',
    gender: product.gender || 'Unisex',
    rentPrice,
    dailyRentPrice: rentPrice,
    dailyLateFee,
    lateFeePerDay: dailyLateFee,
    stock: stockAvailable,
    stockTotal,
    stockAvailable,
    stockRented: Number(product.stockRented || 0),
    stockLaundry: Number(product.stockLaundry || 0),
    stockDamaged: Number(product.stockDamaged || 0),
    description: product.description || '',
    notes: product.notes || '',
    status: product.status || (stockAvailable > 0 ? 'tersedia' : 'habis')
  };
};

import { normalizeStock } from './stock';

export const normalizeProduct = (product) => {
  const rentPrice = Number(product.dailyRentPrice ?? product.rentPrice ?? product.price ?? 0);
  const dailyLateFee = Number(product.lateFeePerDay ?? product.dailyLateFee ?? product.lateFee ?? 50000);
  const stock = normalizeStock(product);
  const isActive = product.isActive ?? product.status !== 'inactive';

  return {
    ...product,
    isActive,
    sku: product.sku || product.id?.slice(0, 8)?.toUpperCase() || '',
    category: product.category || 'Lainnya',
    size: product.size || '-',
    color: product.color || '',
    gender: product.gender || 'Unisex',
    rentPrice,
    dailyRentPrice: rentPrice,
    dailyLateFee,
    lateFeePerDay: dailyLateFee,
    ...stock,
    description: product.description || '',
    notes: product.notes || '',
    status: !isActive ? 'inactive' : product.status || (stock.stockAvailable > 0 ? 'tersedia' : 'habis')
  };
};

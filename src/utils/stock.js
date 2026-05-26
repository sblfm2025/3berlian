export const normalizeStock = (product = {}) => {
  const stockTotal = Number(product.stockTotal ?? product.stock ?? 0);
  const stockAvailable = Number(product.stockAvailable ?? product.stock ?? stockTotal);
  const stockRented = Number(product.stockRented || 0);
  const stockLaundry = Number(product.stockLaundry || 0);
  const stockDamaged = Number(product.stockDamaged || 0);

  return {
    stockTotal,
    stockAvailable,
    stockRented,
    stockLaundry,
    stockDamaged,
    stock: stockAvailable
  };
};

export const canRentProduct = (product, qty = 1) => {
  const requestedQty = Number(qty || 0);
  const stock = normalizeStock(product);

  return requestedQty > 0 && stock.stockAvailable >= requestedQty;
};

export const calculateStockAfterRent = (product, qty = 1) => {
  const requestedQty = Number(qty || 0);
  const stock = normalizeStock(product);

  if (requestedQty <= 0) {
    throw new Error('Jumlah sewa harus lebih dari 0.');
  }

  if (stock.stockAvailable < requestedQty) {
    throw new Error(`Stok tersisa ${stock.stockAvailable} unit.`);
  }

  return {
    ...stock,
    stockAvailable: stock.stockAvailable - requestedQty,
    stockRented: stock.stockRented + requestedQty,
    stock: stock.stockAvailable - requestedQty
  };
};

export const calculateStockAfterReturn = (product, qty = 1, condition = 'good') => {
  const returnedQty = Number(qty || 0);
  const stock = normalizeStock(product);
  const nextStock = {
    ...stock,
    stockRented: Math.max(0, stock.stockRented - returnedQty)
  };

  if (returnedQty <= 0) {
    throw new Error('Jumlah kembali harus lebih dari 0.');
  }

  if (condition === 'laundry') {
    nextStock.stockLaundry += returnedQty;
  } else if (condition === 'damaged' || condition === 'lost') {
    nextStock.stockDamaged += returnedQty;
  } else {
    nextStock.stockAvailable += returnedQty;
  }

  nextStock.stock = nextStock.stockAvailable;
  return nextStock;
};

export const getRentableStock = (product) => normalizeStock(product).stockAvailable;

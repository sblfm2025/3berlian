export const normalizeStock = (product = {}) => {
  const rentedStock = Number(product.rentedStock ?? product.stockRented ?? 0);
  const laundryStock = Number(product.laundryStock ?? product.stockLaundry ?? 0);
  const maintenanceStock = Number(product.maintenanceStock ?? product.stockDamaged ?? product.stockMaintenance ?? 0);
  const lostStock = Number(product.lostStock ?? 0);
  const retiredStock = Number(product.retiredStock ?? 0);

  // Jika ada totalStock atau stockTotal, gunakan itu, jika tidak hitung dari available + status lainnya
  const availableStock = Number(product.availableStock ?? product.stockAvailable ?? product.stock ?? 0);
  const totalStock = Number(product.totalStock ?? product.stockTotal ?? (availableStock + rentedStock + laundryStock + maintenanceStock + lostStock + retiredStock));

  return {
    totalStock,
    availableStock,
    rentedStock,
    laundryStock,
    maintenanceStock,
    lostStock,
    retiredStock,
    // Fallbacks untuk backward-compatibility:
    stockTotal: totalStock,
    stockAvailable: availableStock,
    stockRented: rentedStock,
    stockLaundry: laundryStock,
    stockDamaged: maintenanceStock,
    stock: availableStock
  };
};

export const canRentProduct = (product, qty = 1) => {
  const requestedQty = Number(qty || 0);
  const stock = normalizeStock(product);

  return requestedQty > 0 && stock.availableStock >= requestedQty;
};

export const calculateStockAfterRent = (product, qty = 1) => {
  const requestedQty = Number(qty || 0);
  const stock = normalizeStock(product);

  if (requestedQty <= 0) {
    throw new Error('Jumlah sewa harus lebih dari 0.');
  }

  if (stock.availableStock < requestedQty) {
    throw new Error(`Stok tersisa ${stock.availableStock} unit.`);
  }

  const nextAvailable = stock.availableStock - requestedQty;
  const nextRented = stock.rentedStock + requestedQty;

  return {
    ...stock,
    availableStock: nextAvailable,
    rentedStock: nextRented,
    // Keep backward compatibility fields
    stockAvailable: nextAvailable,
    stockRented: nextRented,
    stock: nextAvailable
  };
};

export const calculateStockAfterReturn = (product, qty = 1, condition = 'good') => {
  const returnedQty = Number(qty || 0);
  const stock = normalizeStock(product);
  const nextStock = {
    ...stock,
    rentedStock: Math.max(0, stock.rentedStock - returnedQty),
    stockRented: Math.max(0, stock.stockRented - returnedQty)
  };

  if (returnedQty <= 0) {
    throw new Error('Jumlah kembali harus lebih dari 0.');
  }

  if (condition === 'laundry') {
    nextStock.laundryStock += returnedQty;
    nextStock.stockLaundry = nextStock.laundryStock;
  } else if (condition === 'damaged') {
    nextStock.maintenanceStock += returnedQty;
    nextStock.stockDamaged = nextStock.maintenanceStock;
  } else if (condition === 'lost') {
    nextStock.lostStock += returnedQty;
  } else {
    nextStock.availableStock += returnedQty;
    nextStock.stockAvailable = nextStock.availableStock;
  }

  nextStock.stock = nextStock.availableStock;
  return nextStock;
};

export const getRentableStock = (product) => normalizeStock(product).availableStock;

import { canRentProduct, getRentableStock } from '../utils/stock.js';

const phonePattern = /^[0-9+\-\s()]{7,20}$/;

export const validateRentalPayload = ({
  cashReceived = 0,
  cart = [],
  customer = {},
  grandTotal = 0,
  paymentMethod,
  returnDate,
  rentDate
}) => {
  const errors = [];
  const customerName = String(customer.name || '').trim();
  const customerPhone = String(customer.phone || '').trim();
  const customerAddress = String(customer.address || '').trim();

  if (!customerName) errors.push('Nama pelanggan belum diisi.');
  if (!customerPhone) {
    errors.push('Nomor HP belum diisi.');
  } else if (!phonePattern.test(customerPhone)) {
    errors.push('Format nomor HP belum valid.');
  }
  if (!customerAddress) errors.push('Alamat pelanggan belum diisi.');
  if (!Array.isArray(cart) || cart.length === 0) errors.push('Keranjang masih kosong.');
  cart.forEach((item, index) => {
    const itemLabel = item.productName || item.product?.name || `Item ${index + 1}`;
    if (!(item.productId || item.product?.id)) errors.push(`${itemLabel} belum memiliki ID produk.`);
    if (Number(item.qty || 0) <= 0) errors.push(`${itemLabel} harus memiliki qty lebih dari 0.`);
    if (!String(item.size || item.product?.size || '').trim()) errors.push(`${itemLabel} belum memiliki ukuran.`);
  });
  if (!returnDate) errors.push('Tanggal kembali belum dipilih.');
  if (!paymentMethod) errors.push('Metode pembayaran belum dipilih.');

  if (returnDate && rentDate && new Date(returnDate) < new Date(rentDate)) {
    errors.push('Tanggal kembali tidak boleh lebih awal dari tanggal sewa.');
  }

  if ((paymentMethod === 'Tunai' || paymentMethod === 'Mixed') && Number(cashReceived || 0) < Number(grandTotal || 0)) {
    errors.push(paymentMethod === 'Mixed' ? 'Total pembayaran gabungan masih kurang.' : 'Uang tunai yang diterima masih kurang.');
  }

  return {
    errors,
    isValid: errors.length === 0
  };
};

export const validateCartAgainstProducts = ({ cart = [], products = [] }) => (
  cart.reduce((issues, item) => {
    const latestProduct = products.find(product => product.id === (item.productId || item.product?.id));
    const qty = Number(item.qty || 0);

    if (!latestProduct) {
      issues.push({ item, reason: 'Produk tidak ditemukan' });
      return issues;
    }

    if (!canRentProduct(latestProduct, qty)) {
      const stockAvailable = getRentableStock(latestProduct);
      issues.push({
        item,
        reason: stockAvailable <= 0 ? 'Produk sudah habis' : `Stok tersisa ${stockAvailable} unit`
      });
    }

    return issues;
  }, [])
);

import { canRentProduct, getRentableStock } from '../utils/stock';

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
  if (!returnDate) errors.push('Tanggal kembali belum dipilih.');
  if (!paymentMethod) errors.push('Metode pembayaran belum dipilih.');

  if (returnDate && rentDate && new Date(returnDate) < new Date(rentDate)) {
    errors.push('Tanggal kembali tidak boleh lebih awal dari tanggal sewa.');
  }

  if (paymentMethod === 'Tunai' && Number(cashReceived || 0) < Number(grandTotal || 0)) {
    errors.push('Uang tunai yang diterima masih kurang.');
  }

  return {
    errors,
    isValid: errors.length === 0
  };
};

export const validateCartAgainstProducts = ({ cart = [], products = [] }) => (
  cart.reduce((issues, item) => {
    const latestProduct = products.find(product => product.id === item.product?.id);
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

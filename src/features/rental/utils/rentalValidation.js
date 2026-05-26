export const getCartStockIssues = ({ cart, products }) => (
  cart.reduce((issues, item) => {
    const latestProduct = products.find(product => product.id === item.product.id);
    if (!latestProduct) {
      issues.push({ item, reason: 'Produk tidak ditemukan' });
      return issues;
    }
    if (latestProduct.stock <= 0) {
      issues.push({ item, reason: 'Produk sudah habis' });
      return issues;
    }
    if (item.qty > latestProduct.stock) {
      issues.push({ item, reason: `Stok tersisa ${latestProduct.stock} unit` });
    }
    return issues;
  }, [])
);

export const getCustomerMissingFields = ({ customerPhoneInput, customerAddressInput, customerIdentityNumber }) => {
  const missingFields = [];
  if (!customerPhoneInput.trim()) missingFields.push('Nomor telepon');
  if (!customerAddressInput.trim()) missingFields.push('Alamat');
  if (!customerIdentityNumber.trim()) missingFields.push('Nomor identitas');
  return missingFields;
};

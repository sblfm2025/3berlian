import { validateCartAgainstProducts } from '../../../validators/rentalValidator';

export const getCartStockIssues = ({ cart, products }) => validateCartAgainstProducts({ cart, products });

export const getCustomerMissingFields = ({ customerPhoneInput, customerAddressInput, customerIdentityNumber }) => {
  const missingFields = [];
  if (!customerPhoneInput.trim()) missingFields.push('Nomor telepon');
  if (!customerAddressInput.trim()) missingFields.push('Alamat');
  if (!customerIdentityNumber.trim()) missingFields.push('Nomor identitas');
  return missingFields;
};

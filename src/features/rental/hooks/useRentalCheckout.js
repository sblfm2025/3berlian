import { useState } from 'react';

import { formatDateInput } from '../../../utils/format';
import { validateRentalPayload } from '../../../validators/rentalValidator';

export const useRentalCheckout = ({
  cart,
  changeAmount,
  clearCart,
  customerAddressInput,
  customerIdentityNumber,
  customerIdentityType,
  customerNameInput,
  customerNoteInput,
  customerPhoneInput,
  depositAmount,
  discountAmount,
  finalCashReceived,
  getStockIssue,
  grandTotal,
  onCheckout,
  onValidationError,
  paymentMethod,
  resetCustomerAfterCheckout,
  returnDateInput,
  setCashReceived,
  setDiscountValue,
  setPaymentMethod,
  subTotal
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckoutClick = async () => {
    if (isCheckingOut) return undefined;
    const todayDate = new Date();
    const rentDate = formatDateInput(todayDate);
    const validation = validateRentalPayload({
      cashReceived: finalCashReceived,
      cart,
      customer: {
        address: customerAddressInput,
        name: customerNameInput,
        phone: customerPhoneInput
      },
      grandTotal,
      paymentMethod,
      rentDate,
      returnDate: returnDateInput
    });
    const stockIssues = getStockIssue();
    const validationErrors = [
      ...validation.errors,
      ...stockIssues.map(issue => `${issue.item.product.name}: ${issue.reason}`)
    ];

    if (validationErrors.length > 0) {
      onValidationError?.(validationErrors);
      return undefined;
    }

    setIsCheckingOut(true);
    try {
      await onCheckout({
        customerName: customerNameInput,
        customerPhone: customerPhoneInput,
        customerAddress: customerAddressInput,
        customerNote: customerNoteInput,
        customerIdentityType,
        customerIdentityNumber,
        depositAmount,
        items: cart,
        rentDate,
        expectedReturnDate: returnDateInput,
        subTotal,
        discountAmount,
        totalAmount: grandTotal,
        paymentMethod,
        cashReceived: paymentMethod === 'Tunai' ? finalCashReceived : 0,
        change: paymentMethod === 'Tunai' ? changeAmount : 0,
        status: 'disewa',
        lateFee: 0
      }, cart);
    } catch {
      return undefined;
    } finally {
      setIsCheckingOut(false);
    }

    clearCart();
    resetCustomerAfterCheckout();
    setDiscountValue('');
    setCashReceived('');
    setPaymentMethod('Tunai');
    return undefined;
  };

  return { handleCheckoutClick, isCheckingOut };
};

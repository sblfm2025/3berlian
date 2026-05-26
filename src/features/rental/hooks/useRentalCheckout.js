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
  customers,
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

    // Pengecekan fail-safe status pemblokiran pelanggan di database
    const matchingCustomer = (customers || []).find(
      c => c.name.toLowerCase().trim() === customerNameInput.toLowerCase().trim()
    );
    if (matchingCustomer && matchingCustomer.isBlocked) {
      onValidationError?.([`Pelanggan "${matchingCustomer.name}" berstatus DIBLOKIR oleh sanggar dan tidak diizinkan menyewa kostum.`]);
      return undefined;
    }

    setIsCheckingOut(true);
    try {
      const bookingId = localStorage.getItem('checkout_active_booking_id') || null;
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
        lateFee: 0,
        bookingId
      }, cart);

      if (bookingId) {
        localStorage.removeItem('checkout_active_booking_id');
      }
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

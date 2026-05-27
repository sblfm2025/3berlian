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
  const [checkoutErrors, setCheckoutErrors] = useState([]);

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
      ...stockIssues.map(issue => `${issue.item.productName || issue.item.product?.name || 'Produk'}: ${issue.reason}`)
    ];

    if (validationErrors.length > 0) {
      setCheckoutErrors(validationErrors);
      onValidationError?.(validationErrors);
      return undefined;
    }

    // Pengecekan fail-safe status pemblokiran pelanggan di database
    const matchingCustomer = (customers || []).find(
      c => c.name.toLowerCase().trim() === customerNameInput.toLowerCase().trim()
    );
    if (matchingCustomer && matchingCustomer.isBlocked) {
      const blockedErrors = [`Pelanggan "${matchingCustomer.name}" berstatus DIBLOKIR oleh sanggar dan tidak diizinkan menyewa kostum.`];
      setCheckoutErrors(blockedErrors);
      onValidationError?.(blockedErrors);
      return undefined;
    }

    setCheckoutErrors([]);
    setIsCheckingOut(true);
    try {
      const needsPaidAmount = paymentMethod === 'Tunai' || paymentMethod === 'Mixed';
      const bookingId = localStorage.getItem('checkout_active_booking_id') || null;
      const operationToken = `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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
        cashReceived: needsPaidAmount ? finalCashReceived : 0,
        change: needsPaidAmount ? changeAmount : 0,
        paymentStatus: finalCashReceived >= grandTotal || !needsPaidAmount ? 'paid' : finalCashReceived > 0 ? 'partial' : 'unpaid',
        status: 'rented',
        lateFee: 0,
        bookingId,
        operationToken
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

  return { checkoutErrors, handleCheckoutClick, isCheckingOut };
};

export const calculateCartSubtotal = (cart) => (
  cart.reduce((sum, item) => {
    const rentPrice = Number(item.rentPrice ?? item.product?.rentPrice ?? 0);
    const discount = Number(item.discount || 0);
    return sum + Math.max(0, (rentPrice * Number(item.qty || 0)) - discount);
  }, 0)
);

export const calculateCartItemCount = (cart) => (
  cart.reduce((sum, item) => sum + Number(item.qty || 0), 0)
);

export const calculateCartDepositTotal = (cart) => (
  cart.reduce((sum, item) => {
    const itemDeposit = Number(item.deposit ?? item.product?.deposit ?? 0);
    return sum + (itemDeposit * Number(item.qty || 0));
  }, 0)
);

export const calculateDiscountAmount = ({ discountType, discountValue, subTotal }) => {
  const rawDiscount = Number(discountValue) || 0;
  return discountType === 'percent' ? subTotal * (rawDiscount / 100) : rawDiscount;
};

export const calculatePaymentTotals = ({ cart, discountType, discountValue, depositAmountInput, paymentMethod, cashReceived }) => {
  const subTotal = calculateCartSubtotal(cart);
  const totalItems = calculateCartItemCount(cart);
  const discountAmount = calculateDiscountAmount({ discountType, discountValue, subTotal });
  const depositAmount = Number(depositAmountInput) || calculateCartDepositTotal(cart);
  const grandTotal = Math.max(0, subTotal + depositAmount - discountAmount);
  const finalCashReceived = Number(cashReceived) || 0;
  const changeAmount = paymentMethod === 'Tunai' ? Math.max(0, finalCashReceived - grandTotal) : 0;
  const remainingAmount = paymentMethod === 'Tunai' ? Math.max(0, grandTotal - finalCashReceived) : 0;
  const paymentStatus = remainingAmount === 0 ? 'paid' : finalCashReceived > 0 ? 'partial' : 'unpaid';

  return {
    changeAmount,
    depositAmount,
    discountAmount,
    finalCashReceived,
    grandTotal,
    paymentStatus,
    remainingAmount,
    subTotal,
    totalItems
  };
};

export const buildCashPresets = (grandTotal) => (
  Array.from(new Set([
    grandTotal,
    Math.max(grandTotal, 100000),
    Math.max(Math.round(grandTotal * 1.1), 100000),
    Math.max(Math.round(grandTotal * 1.25), 200000)
  ])).sort((a, b) => a - b)
);

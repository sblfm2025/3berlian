import { useMemo, useState } from 'react';

import { buildCashPresets, calculatePaymentTotals } from '../utils/rentalCalculations';

export const usePaymentCalculation = ({ cart, depositAmountInput }) => {
  const [discountType, setDiscountType] = useState('nominal');
  const [discountValue, setDiscountValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [cashReceived, setCashReceived] = useState('');

  const totals = useMemo(() => (
    calculatePaymentTotals({ cart, discountType, discountValue, depositAmountInput, paymentMethod, cashReceived })
  ), [cart, cashReceived, depositAmountInput, discountType, discountValue, paymentMethod]);

  const cashPresets = useMemo(() => buildCashPresets(totals.grandTotal), [totals.grandTotal]);

  return {
    cashPresets,
    cashReceived,
    discountType,
    discountValue,
    paymentMethod,
    setCashReceived,
    setDiscountType,
    setDiscountValue,
    setPaymentMethod,
    ...totals
  };
};

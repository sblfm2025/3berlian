import { useMemo, useState } from 'react';

import { formatDateInput } from '../../../utils/format';

export const useCustomerSelection = ({
  cart,
  customers,
  depositAmountInput,
  onCustomerWarning,
  openCheckout,
  products,
  setCart,
  setCashReceived,
  setDepositAmountInput,
  setDiscountType,
  setDiscountValue,
  setPaymentMethod,
  transactions
}) => {
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  const [customerAddressInput, setCustomerAddressInput] = useState('');
  const [customerNoteInput, setCustomerNoteInput] = useState('');
  const [customerIdentityType, setCustomerIdentityType] = useState('KTP');
  const [customerIdentityNumber, setCustomerIdentityNumber] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = formatDateInput(tomorrow);
  const [returnDateInput, setReturnDateInput] = useState(defaultDateStr);

  const lastCompletedTransaction = useMemo(() => {
    return [...transactions]
      .filter(transaction => Array.isArray(transaction.items) && transaction.items.length > 0)
      .sort((a, b) => {
        const aDate = new Date(a.rentDate || a.expectedReturnDate || 0).getTime();
        const bDate = new Date(b.rentDate || b.expectedReturnDate || 0).getTime();
        return bDate - aDate;
      })[0];
  }, [transactions]);

  const filteredCustomers = customers
    .filter(c => c.deleted !== true && c.name.toLowerCase().includes(customerNameInput.toLowerCase()) && customerNameInput.length > 0)
    .slice(0, 6);

  const recentCustomers = useMemo(() => {
    return [...customers]
      .filter(customer => customer?.name && customer.deleted !== true)
      .sort((a, b) => new Date(b.lastRentDate || 0) - new Date(a.lastRentDate || 0))
      .slice(0, 4);
  }, [customers]);

  const customerActivity = useMemo(() => {
    const counts = (transactions || []).reduce((acc, trx) => {
      const name = (trx.customerName || '').trim();
      if (!name) return acc;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        customer: customers.find(customer => customer.name === name)
      }))
      .filter(item => item.customer && item.customer.deleted !== true)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [customers, transactions]);

  const favoriteCustomers = useMemo(() => {
    return customerActivity
      .map(item => ({
        ...item.customer,
        name: item.name,
        count: item.count,
        source: 'favorit'
      }))
      .filter(item => item.name);
  }, [customerActivity]);

  const applyCustomer = (customer) => {
    if (customer.isBlocked) {
      onCustomerWarning?.(`Pelanggan "${customer.name}" berstatus DIBLOKIR karena alasan keamanan sanggar. Tidak diperbolehkan menyewa kostum.`, 'Pelanggan Diblokir');
      return;
    }
    setCustomerNameInput(customer.name || '');
    setCustomerPhoneInput(customer.phone || '');
    setCustomerAddressInput(customer.address || '');
    setCustomerNoteInput(customer.note || '');
    setCustomerIdentityType(customer.identityType || 'KTP');
    setCustomerIdentityNumber(customer.identityNumber || '');
    setDepositAmountInput(customer.depositAmount ? String(customer.depositAmount) : '');
    setShowSuggestions(false);
  };

  const applyLastTransaction = () => {
    if (!lastCompletedTransaction) {
      onCustomerWarning?.('Belum ada transaksi sebelumnya untuk diulang.');
      return;
    }

    const restoredItems = (lastCompletedTransaction.items || [])
      .map(item => {
        const currentProduct = products.find(product => product.id === item.product?.id);
        return currentProduct ? { product: currentProduct, qty: item.qty || 1 } : null;
      })
      .filter(Boolean);

    if (restoredItems.length === 0) {
      onCustomerWarning?.('Produk dari transaksi terakhir tidak tersedia untuk diulang.');
      return;
    }

    setCart(restoredItems);
    setCustomerNameInput(lastCompletedTransaction.customerName || '');
    setCustomerPhoneInput(lastCompletedTransaction.customerPhone || '');
    setCustomerAddressInput(lastCompletedTransaction.customerAddress || '');
    setCustomerNoteInput(lastCompletedTransaction.customerNote || '');
    setCustomerIdentityType(lastCompletedTransaction.customerIdentityType || 'KTP');
    setCustomerIdentityNumber(lastCompletedTransaction.customerIdentityNumber || '');
    setDepositAmountInput(lastCompletedTransaction.depositAmount ? String(lastCompletedTransaction.depositAmount) : '');
    setReturnDateInput(lastCompletedTransaction.expectedReturnDate || defaultDateStr);
    setPaymentMethod(lastCompletedTransaction.paymentMethod || 'Tunai');
    setCashReceived(lastCompletedTransaction.cashReceived ? String(lastCompletedTransaction.cashReceived) : '');
    setDiscountType('nominal');
    setDiscountValue('');
    openCheckout();
  };

  const resetCustomer = () => {
    setCustomerNameInput('');
    setCustomerPhoneInput('');
    setCustomerAddressInput('');
    setCustomerNoteInput('');
    setCustomerIdentityType('KTP');
    setCustomerIdentityNumber('');
    setDepositAmountInput('');
    setShowSuggestions(false);
  };

  const resetAfterCheckout = () => {
    resetCustomer();
    setReturnDateInput(defaultDateStr);
  };

  return {
    applyCustomer,
    applyLastTransaction,
    cart,
    customerAddressInput,
    customerIdentityNumber,
    customerIdentityType,
    customerNameInput,
    customerNoteInput,
    customerPhoneInput,
    defaultDateStr,
    depositAmountInput,
    favoriteCustomers,
    filteredCustomers,
    lastCompletedTransaction,
    recentCustomers,
    resetAfterCheckout,
    resetCustomer,
    returnDateInput,
    setCustomerAddressInput,
    setCustomerIdentityNumber,
    setCustomerIdentityType,
    setCustomerNameInput,
    setCustomerNoteInput,
    setCustomerPhoneInput,
    setDepositAmountInput,
    setReturnDateInput,
    setShowSuggestions,
    showSuggestions
  };
};

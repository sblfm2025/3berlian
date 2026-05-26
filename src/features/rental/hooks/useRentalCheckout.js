import { formatDateInput } from '../../../utils/format';
import { createInvoiceNumber } from '../../../utils/invoice';

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
  paymentMethod,
  resetCustomerAfterCheckout,
  returnDateInput,
  setCashReceived,
  setDiscountValue,
  setPaymentMethod,
  subTotal
}) => {
  const handleCheckoutClick = () => {
    if (cart.length === 0) return alert('Pilih barang terlebih dahulu');
    if (!customerNameInput.trim()) return alert('Masukkan nama pelanggan');
    if (!returnDateInput) return alert('Masukkan tanggal pengembalian');

    const stockIssues = getStockIssue();
    if (stockIssues.length > 0) {
      const firstIssue = stockIssues[0];
      return alert(`${firstIssue.item.product.name}: ${firstIssue.reason}`);
    }

    const todayDate = new Date();
    const rentDate = formatDateInput(todayDate);
    const invoiceNumber = createInvoiceNumber(todayDate);
    if (new Date(returnDateInput) < new Date(rentDate)) {
      return alert('Tanggal pengembalian tidak boleh lebih awal dari tanggal sewa');
    }

    if (paymentMethod === 'Tunai' && finalCashReceived < grandTotal) {
      return alert('Transaksi Ditolak: Uang tunai yang diterima kurang dari total tagihan!');
    }

    onCheckout({
      id: invoiceNumber,
      invoiceNumber,
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

    clearCart();
    resetCustomerAfterCheckout();
    setDiscountValue('');
    setCashReceived('');
    setPaymentMethod('Tunai');
    return undefined;
  };

  return { handleCheckoutClick };
};

import { CheckCircle, AlertCircle, X } from 'lucide-react';
import CustomerQuickForm from './CustomerQuickForm';
import RentalCart from './RentalCart';
import PaymentSummary from './PaymentSummary';

export default function CheckoutPanel({
  activeStep = 1,
  showMobileCheckout,
  setShowMobileCheckout,
  paymentSummaryLabel,
  totalItems,
  grandTotal,
  paymentMethod,
  checkoutChecklist,
  checkoutErrors = [],
  customerNameInput,
  setCustomerNameInput,
  setShowSuggestions,
  showSuggestions,
  filteredCustomers,
  applyCustomer,
  resetCustomer,
  customerMissingFields,
  favoriteCustomers,
  recentCustomers,
  customerPhoneInput,
  setCustomerPhoneInput,
  customerIdentityType,
  setCustomerIdentityType,
  customerIdentityNumber,
  setCustomerIdentityNumber,
  returnDateInput,
  setReturnDateInput,
  customerAddressInput,
  setCustomerAddressInput,
  customerNoteInput,
  setCustomerNoteInput,
  depositAmountInput,
  setDepositAmountInput,
  cart,
  removeCartItem,
  updateCartItem,
  updateCartQty,
  discountType,
  setDiscountType,
  setDiscountValue,
  discountValue,
  setPaymentMethod,
  cashReceived,
  setCashReceived,
  cashPresets,
  finalCashReceived,
  changeAmount,
  subTotal,
  discountAmount,
  depositAmount,
  handleCheckoutClick,
  isCheckingOut,
  getStockIssue,
  formatCurrency,
  formatDate,
  formatDateInput,
  formatNumberDot
}) {
  const stepTitles = {
    1: 'Katalog Produk',
    2: 'Keranjang Sewa',
    3: 'Data Pelanggan & Deposit',
    4: 'Metode Pembayaran'
  };

  return (
    <div
      className={`${showMobileCheckout ? 'fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden' : 'hidden'} md:block md:w-[420px] shrink-0 xl:sticky xl:top-4 xl:self-start`}
      onClick={() => showMobileCheckout && setShowMobileCheckout(false)}
    >
      <div
        className={`bg-white h-full flex flex-col md:rounded-[18px] md:border md:border-slate-200 md:shadow-sm overflow-hidden ${showMobileCheckout ? 'absolute inset-x-0 bottom-0 max-h-[92vh] rounded-t-[22px]' : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-900 px-4 py-3 text-white md:rounded-t-[18px] md:px-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-100 sm:text-[11px] sm:tracking-[0.18em]">POS 3 BERLIAN</p>
            <h3 className="mt-1 text-base font-bold sm:text-lg">
              <span className="md:hidden">{stepTitles[activeStep]}</span>
              <span className="hidden md:inline">Ringkasan tagihan</span>
            </h3>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100 sm:text-[11px] sm:tracking-[0.18em] hidden md:block">
              {paymentSummaryLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold sm:mt-3 sm:gap-2 sm:text-[11px]">
              <span className="rounded-full bg-white/10 px-3 py-1">{totalItems} item</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{formatCurrency(grandTotal)}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{paymentMethod}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileCheckout(false)}
            className="rounded-full bg-white/10 p-2 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3 md:space-y-4 md:p-5">
          {cart.length === 0 && (
            <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 sm:text-[11px] sm:tracking-[0.18em]">Mulai transaksi</p>
              <h4 className="mt-2 text-base font-bold text-slate-900">Scan atau pilih kostum dari katalog</h4>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
                Panel ini akan terisi otomatis setelah item pertama masuk keranjang.
              </p>
              <div className="mt-4 grid gap-2">
                {[
                  { label: 'Keranjang belum berisi item', ok: false },
                  { label: customerNameInput.trim() ? 'Pelanggan sudah dipilih' : 'Pelanggan bisa diisi nanti', ok: customerNameInput.trim().length > 0 },
                  { label: returnDateInput ? 'Tanggal kembali siap' : 'Tanggal kembali mengikuti default', ok: Boolean(returnDateInput) },
                  { label: 'Pembayaran aktif setelah ada item', ok: false }
                ].map(item => {
                  const Icon = item.ok ? CheckCircle : AlertCircle;
                  return (
                    <div key={item.label} className="flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2">
                      <Icon size={16} className={item.ok ? 'text-emerald-600' : 'text-blue-700'} />
                      <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm sm:p-5 sm:rounded-[24px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">Checklist Transaksi</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{checkoutChecklist.every(item => item.ok) ? 'Transaksi siap checkout' : 'Periksa bagian yang belum lengkap'}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">{checkoutChecklist.filter(item => item.ok).length}/{checkoutChecklist.length}</span>
            </div>

            <div className="mt-3 grid gap-2 sm:mt-4 sm:space-y-3">
              {checkoutChecklist.map(item => {
                const Icon = item.ok ? CheckCircle : AlertCircle;
                return (
                  <div key={item.label} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 sm:gap-3 sm:rounded-[18px]">
                    <Icon size={16} className={item.ok ? 'text-emerald-600' : 'text-amber-600'} />
                    <p className="text-xs font-semibold text-slate-700 sm:text-sm">{item.label}</p>
                  </div>
                );
              })}
            </div>

            {checkoutErrors.length > 0 && (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-bold text-red-700">Checkout belum lengkap</p>
                <ul className="mt-2 space-y-1">
                  {checkoutErrors.map(error => (
                    <li key={error} className="text-xs font-semibold text-red-700">- {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <CustomerQuickForm
              customerNameInput={customerNameInput}
              setCustomerNameInput={setCustomerNameInput}
              setShowSuggestions={setShowSuggestions}
              showSuggestions={showSuggestions}
              filteredCustomers={filteredCustomers}
              applyCustomer={applyCustomer}
              resetCustomer={resetCustomer}
              customerMissingFields={customerMissingFields}
              favoriteCustomers={favoriteCustomers}
              recentCustomers={recentCustomers}
              customerPhoneInput={customerPhoneInput}
              setCustomerPhoneInput={setCustomerPhoneInput}
              customerIdentityType={customerIdentityType}
              setCustomerIdentityType={setCustomerIdentityType}
              customerIdentityNumber={customerIdentityNumber}
              setCustomerIdentityNumber={setCustomerIdentityNumber}
              returnDateInput={returnDateInput}
              setReturnDateInput={setReturnDateInput}
              customerAddressInput={customerAddressInput}
              setCustomerAddressInput={setCustomerAddressInput}
              customerNoteInput={customerNoteInput}
              setCustomerNoteInput={setCustomerNoteInput}
              depositAmountInput={depositAmountInput}
              setDepositAmountInput={setDepositAmountInput}
              totalItems={totalItems}
              formatDate={formatDate}
              formatDateInput={formatDateInput}
              formatNumberDot={formatNumberDot}
            />
          </div>

          <div>
            <RentalCart
              cart={cart}
              removeCartItem={removeCartItem}
              updateCartItem={updateCartItem}
              updateCartQty={updateCartQty}
              formatCurrency={formatCurrency}
            />
          </div>

          <div>
            {cart.length > 0 ? (
              <PaymentSummary
                discountType={discountType}
                setDiscountType={setDiscountType}
                setDiscountValue={setDiscountValue}
                discountValue={discountValue}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cashReceived={cashReceived}
                setCashReceived={setCashReceived}
                grandTotal={grandTotal}
                cashPresets={cashPresets}
                finalCashReceived={finalCashReceived}
                changeAmount={changeAmount}
                formatCurrency={formatCurrency}
                formatNumberDot={formatNumberDot}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500">
                Tambahkan produk ke keranjang untuk mulai pembayaran.
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-4 py-3 md:px-5 md:py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">{formatCurrency(subTotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Diskon</span>
                <span className="font-bold">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {depositAmount > 0 && (
              <div className="flex justify-between text-sm text-amber-700">
                <span>Deposit / Jaminan</span>
                <span className="font-bold">{formatCurrency(depositAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-xs sm:tracking-[0.18em]">Total tagihan</span>
              <span className="text-xl font-bold text-emerald-900 sm:text-2xl">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckoutClick}
            disabled={isCheckingOut || cart.length === 0}
            className="mt-3 w-full rounded-xl bg-emerald-900 hover:bg-emerald-950 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] sm:rounded-2xl"
          >
            {isCheckingOut ? 'Memproses pembayaran...' : getStockIssue().length > 0 ? 'Periksa ulang stok' : 'Bayar & Cetak Nota'}
          </button>
        </div>
      </div>
    </div>
  );
}

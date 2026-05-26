export default function RentalMobileBar({
  totalItems,
  grandTotal,
  customerNameInput,
  paymentMethod,
  setShowMobileCheckout,
  formatCurrency
}) {
  return (
    <div className="md:hidden fixed bottom-24 left-0 right-0 px-4 z-20 pointer-events-none">
      {totalItems > 0 && (
        <div className="pointer-events-auto rounded-[24px] bg-blue-900 px-4 py-3 text-white shadow-[0_24px_60px_-24px_rgba(30,64,175,0.9)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-blue-100">Keranjang</p>
              <p className="mt-1 break-words text-base font-black leading-snug sm:text-lg">{totalItems} item - {formatCurrency(grandTotal)}</p>
              <p className="mt-1 break-words text-[11px] leading-snug text-blue-100">
                {customerNameInput || 'Pelanggan belum diisi'} - {paymentMethod}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMobileCheckout(true)}
              className="rounded-[18px] bg-amber-400 px-4 py-3 text-sm font-black text-slate-900 shrink-0"
            >
              Bayar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

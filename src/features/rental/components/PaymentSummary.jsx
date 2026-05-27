export default function PaymentSummary({
  discountType,
  setDiscountType,
  setDiscountValue,
  discountValue,
  paymentMethod,
  setPaymentMethod,
  cashReceived,
  setCashReceived,
  grandTotal,
  cashPresets,
  finalCashReceived,
  changeAmount,
  formatCurrency,
  formatNumberDot
}) {
  return (
    <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm sm:p-5 sm:rounded-[24px]">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">Diskon & Metode</h4>
      <div className="mt-4 space-y-4">
        <div className="grid gap-2 sm:grid-cols-[100px_1fr]">
          <select
            value={discountType}
            onChange={event => { setDiscountType(event.target.value); setDiscountValue(''); }}
            className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700"
          >
            <option value="nominal">Rp</option>
            <option value="percent">%</option>
          </select>
          <input
            type="text"
            value={discountType === 'nominal' ? formatNumberDot(discountValue) : discountValue}
            onChange={event => {
              const rawValue = event.target.value.replace(/[^0-9]/g, '');
              if (discountType === 'percent' && Number(rawValue) > 100) return;
              setDiscountValue(rawValue);
            }}
            placeholder="Nilai diskon"
            className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['Tunai', 'Transfer', 'QRIS', 'Mixed'].map(method => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={`rounded-[18px] px-2 py-3 text-[11px] font-bold border transition-all ${paymentMethod === method ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-500'}`}
            >
              {method}
            </button>
          ))}
        </div>

        {(paymentMethod === 'Tunai' || paymentMethod === 'Mixed') && (
          <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4">
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800 sm:text-[11px] sm:tracking-[0.18em]">
              {paymentMethod === 'Mixed' ? 'Total dibayar' : 'Uang diterima'}
            </label>
            {paymentMethod === 'Mixed' && (
              <p className="mt-1 text-xs font-semibold text-amber-800">Catat total gabungan tunai, transfer, dan QRIS.</p>
            )}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={formatNumberDot(cashReceived)}
                onChange={event => setCashReceived(event.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Rp 0"
                className="flex-1 rounded-[16px] border border-white bg-white px-4 py-3 text-sm font-bold text-amber-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCashReceived(String(grandTotal))}
                className="rounded-[16px] bg-amber-500 px-4 py-3 text-xs font-bold text-white"
              >
                Uang Pas
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {cashPresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCashReceived(String(Math.round(preset)))}
                  className="rounded-[14px] bg-white px-3 py-2 text-[11px] font-bold text-amber-900 border border-white"
                >
                  {formatCurrency(Math.round(preset))}
                </button>
              ))}
            </div>

            {finalCashReceived > 0 && finalCashReceived < grandTotal && (
              <p className="mt-3 text-[11px] font-bold text-red-600">Uang kurang {formatCurrency(grandTotal - finalCashReceived)}</p>
            )}
            {finalCashReceived >= grandTotal && finalCashReceived > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-[16px] bg-white/80 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800 sm:text-[11px] sm:tracking-[0.18em]">Kembalian</span>
                <span className="text-base font-bold text-emerald-600 sm:text-lg">{formatCurrency(changeAmount)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

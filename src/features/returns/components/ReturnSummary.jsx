export default function ReturnSummary({
  depositAmount,
  useDepositForFees,
  setUseDepositForFees,
  paymentMethod,
  setPaymentMethod,
  returnModeLabel,
  lateFee,
  conditionFee,
  totalAdditionalFee,
  depositDeducted,
  depositReturned,
  feePaidSeparately,
  totalReturnQty,
  totalReturnableQty,
  formatCurrency,
  lateFeeOverride,
  setLateFeeOverride,
  penaltyOverrideReason,
  setPenaltyOverrideReason,
  isPenaltyOverridden
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
      <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 sm:rounded-[22px] sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">Metode pembayaran biaya tambahan</p>
        {depositAmount > 0 && (
          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-[18px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
            <span>Potong biaya dari deposit</span>
            <input
              type="checkbox"
              checked={useDepositForFees}
              onChange={(event) => setUseDepositForFees(event.target.checked)}
              className="h-4 w-4 accent-blue-700"
            />
          </label>
        )}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {['Tunai', 'Transfer', 'QRIS'].map(method => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={`rounded-[14px] px-2 py-2 text-[11px] font-bold border transition-all ${paymentMethod === method ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}
            >
              {method}
            </button>
          ))}
        </div>

        {/* Input Override Denda */}
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">Override Denda Keterlambatan</p>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500">Nominal Denda (Rp)</label>
              <input
                type="number"
                min="0"
                placeholder={lateFee}
                value={lateFeeOverride === null ? '' : lateFeeOverride}
                onChange={(e) => {
                  const val = e.target.value;
                  setLateFeeOverride(val === '' ? null : Number(val));
                }}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {isPenaltyOverridden && (
              <div>
                <label className="block text-[11px] font-semibold text-red-500">Alasan Perubahan Denda (Wajib)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Diskon keterlambatan disetujui owner karena kendala teknis kurir..."
                  value={penaltyOverrideReason}
                  onChange={(e) => setPenaltyOverrideReason(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 sm:rounded-[22px] sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">Ringkasan biaya</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between font-bold text-blue-700">
            <span>Mode pengembalian</span>
            <span>{returnModeLabel}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Denda keterlambatan</span>
            <span>
              {isPenaltyOverridden ? (
                <span className="flex items-center gap-1.5">
                  <span className="line-through text-slate-400 font-semibold">{formatCurrency(lateFee)}</span>
                  <span className="text-red-600 font-bold">{formatCurrency(lateFeeOverride)}</span>
                </span>
              ) : (
                formatCurrency(lateFee)
              )}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Biaya kondisi</span>
            <span>{formatCurrency(conditionFee)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
            <span>Total tambahan</span>
            <span>{formatCurrency(totalAdditionalFee)}</span>
          </div>
          {depositAmount > 0 && (
            <>
              <div className="flex justify-between text-amber-700">
                <span>Deposit tertahan</span>
                <span>{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Deposit dipotong</span>
                <span>{formatCurrency(depositDeducted)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Deposit dikembalikan</span>
                <span>{formatCurrency(depositReturned)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                <span>Bayar terpisah</span>
                <span>{formatCurrency(feePaidSeparately)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Jumlah kembali</span>
            <span>{totalReturnQty}/{totalReturnableQty} item</span>
          </div>
        </div>
      </div>
    </div>
  );
}

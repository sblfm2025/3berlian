import { X } from 'lucide-react';

export default function ReturnConfirmModal({
  showConfirmModal,
  setShowConfirmModal,
  selectedTrx,
  returnModeLabel,
  totalReturnQty,
  conditionBreakdown,
  returnQtyByProduct,
  itemConditions,
  lateFee,
  conditionFee,
  totalAdditionalFee,
  depositAmount,
  useDepositForFees,
  depositDeducted,
  depositReturned,
  feePaidSeparately,
  paymentMethod,
  notes,
  isReturning,
  handleConfirm,
  formatCurrency
}) {
  if (!showConfirmModal || !selectedTrx) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-t-[22px] sm:rounded-[24px] w-full max-w-lg overflow-hidden shadow-xl animate-in zoom-in-95 animate-duration-200">
        <div className="p-4 sm:p-5 bg-blue-900 text-white flex justify-between items-center border-b border-blue-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100 sm:text-[11px] sm:tracking-[0.18em]">Konfirmasi Final Pengembalian</p>
            <h3 className="mt-1.5 text-base font-bold sm:text-lg">{selectedTrx.id}</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowConfirmModal(false)}
            className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Tutup modal konfirmasi"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-3 sm:p-5 md:p-6 bg-slate-50 space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="rounded-[20px] bg-white border border-slate-100 p-4 space-y-2 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Detail Pelanggan</p>
            <p className="text-sm font-bold text-slate-900">{selectedTrx.customerName}</p>
            <p className="text-xs text-slate-500 font-semibold">Mode: <span className="font-bold text-blue-700">{returnModeLabel}</span></p>
          </div>

          <div className="rounded-[20px] bg-white border border-slate-100 p-4 space-y-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Item yang dikembalikan ({totalReturnQty} item)</p>
            <div className="space-y-2 divide-y divide-slate-100">
              {conditionBreakdown.filter(item => (returnQtyByProduct[item.product.id] ?? item.returnQty) > 0).map((item, idx) => {
                const rQty = returnQtyByProduct[item.product.id] ?? item.returnQty;
                return (
                  <div key={item.product.id || idx} className="pt-2 first:pt-0 flex justify-between items-start text-xs sm:text-sm">
                    <div>
                      <p className="font-bold text-slate-900">{rQty}x {item.product.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">Kondisi: <span className="font-bold text-slate-700">{itemConditions[item.product.id] || 'Baik'}</span></p>
                    </div>
                    {item.fee > 0 && (
                      <span className="font-bold text-red-600">+{formatCurrency(item.fee)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-slate-100 p-4 space-y-2 text-xs sm:text-sm shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-2">Rincian Keuangan</p>
            <div className="flex justify-between text-slate-600 font-semibold">
              <span>Denda Keterlambatan ({selectedTrx.calculatedLateDays} hari)</span>
              <span>{formatCurrency(lateFee)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-semibold">
              <span>Biaya Kondisi Kostum</span>
              <span>{formatCurrency(conditionFee)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-800">
              <span>Total Biaya Tambahan</span>
              <span>{formatCurrency(totalAdditionalFee)}</span>
            </div>
            {depositAmount > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Deposit Awal</span>
                  <span>{formatCurrency(depositAmount)}</span>
                </div>
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Deposit Dipotong ({useDepositForFees ? 'Otomatis' : 'Tidak'})</span>
                  <span>-{formatCurrency(depositDeducted)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-extrabold">
                  <span>Deposit Dikembalikan</span>
                  <span>{formatCurrency(depositReturned)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900 text-sm sm:text-base">
                  <span>Sisa Bayar Terpisah ({paymentMethod})</span>
                  <span>{formatCurrency(feePaidSeparately)}</span>
                </div>
              </div>
            )}
          </div>

          {notes && (
            <div className="rounded-[20px] bg-white border border-slate-100 p-4 space-y-1 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Catatan Pengembalian</p>
              <p className="text-xs sm:text-sm text-slate-700 font-medium italic">"{notes}"</p>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-5 bg-slate-100 border-t border-slate-200 flex flex-wrap justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowConfirmModal(false)}
            className="rounded-[16px] border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isReturning}
            onClick={async () => {
              await handleConfirm();
              setShowConfirmModal(false);
            }}
            className="rounded-[16px] bg-blue-800 hover:bg-blue-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm disabled:opacity-50 transition-colors"
          >
            {isReturning ? 'Memproses...' : 'Ya, Konfirmasi Kembali'}
          </button>
        </div>
      </div>
    </div>
  );
}

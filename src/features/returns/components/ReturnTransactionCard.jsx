export default function ReturnTransactionCard({ tx, isLate, lateDays, selectedTrx, handleSelect, formatDate }) {
  return (
    <button
      type="button"
      onClick={() => handleSelect(tx)}
      className={`w-full rounded-2xl border p-3 text-left transition-all sm:rounded-[22px] sm:p-4 ${selectedTrx?.id === tx.id ? 'border-blue-500 bg-blue-50/60 shadow-md' : isLate ? 'border-red-200 bg-red-50/40 hover:border-red-300' : 'border-slate-200 bg-white hover:border-slate-300'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-bold text-slate-900">{tx.id}</p>
          <p className="mt-1 break-words text-xs text-slate-600 sm:text-sm">{tx.customerName || 'Pelanggan belum tercatat'}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:px-3 sm:text-[11px] ${isLate ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {isLate ? `Terlambat ${lateDays} hari` : 'Tepat waktu'}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 sm:mt-3 sm:text-sm">
        <span>{formatDate(tx.rentDate)}</span>
        <span>{formatDate(tx.expectedReturnDate)}</span>
      </div>
    </button>
  );
}

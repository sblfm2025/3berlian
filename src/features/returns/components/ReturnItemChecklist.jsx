import { CheckCircle, AlertCircle, Minus, Plus } from 'lucide-react';

export default function ReturnItemChecklist({
  conditionBreakdown,
  returnQtyByProduct,
  updateReturnQty,
  setItemConditions,
  applyConditionToAll,
  formatCurrency
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 sm:rounded-[22px] sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">Item yang dikembalikan</h4>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">Setiap item bisa diberi status kondisi berbeda. Gunakan aksi cepat untuk mempercepat proses.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">Checklist</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyConditionToAll('Baik')}
          className="min-h-[44px] rounded-[14px] bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
        >
          <span className="inline-flex items-center gap-1"><CheckCircle size={14} /> Semua Baik</span>
        </button>
        <button
          type="button"
          onClick={() => applyConditionToAll('Kotor/Laundry')}
          className="rounded-[14px] bg-amber-100 px-3 py-2 text-[11px] font-bold text-amber-800"
        >
          <span className="inline-flex items-center gap-1"><AlertCircle size={14} /> Kotor / Laundry</span>
        </button>
        <button
          type="button"
          onClick={() => applyConditionToAll('Rusak Ringan')}
          className="rounded-[14px] bg-orange-100 px-3 py-2 text-[11px] font-bold text-orange-700"
        >
          Rusak Ringan
        </button>
        <button
          type="button"
          onClick={() => applyConditionToAll('Rusak Berat')}
          className="rounded-[14px] bg-red-100 px-3 py-2 text-[11px] font-bold text-red-700"
        >
          Rusak Berat
        </button>
        <button
          type="button"
          onClick={() => applyConditionToAll('Hilang')}
          className="rounded-[14px] bg-slate-900 px-3 py-2 text-[11px] font-bold text-white"
        >
          Hilang
        </button>
      </div>
      <div className="mt-3 space-y-3">
        {conditionBreakdown.map(item => (
          <div key={item.product.id} className="rounded-2xl border border-slate-200 bg-white p-3 sm:rounded-[20px] sm:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{item.qty}x {item.product.name}</p>
                <p className="text-sm text-slate-500">Harga sewa: {formatCurrency(item.product.rentPrice || 0)}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-[16px] border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => updateReturnQty(item.product.id, item.returnQty - 1, item.qty)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"
                    aria-label={`Kurangi jumlah kembali ${item.product.name}`}
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="min-w-16 text-center text-xs font-bold text-slate-900">
                    {returnQtyByProduct[item.product.id] ?? item.returnQty}/{item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateReturnQty(item.product.id, item.returnQty + 1, item.qty)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm"
                    aria-label={`Tambah jumlah kembali ${item.product.name}`}
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-xs sm:tracking-[0.18em]">Biaya kondisi sekarang: {formatCurrency(item.fee)}</p>
              </div>
              <div className="lg:w-56">
                <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-2 sm:text-[11px] sm:tracking-[0.18em]">Kondisi</label>
                <select
                  value={item.condition}
                  onChange={(e) => setItemConditions(prev => ({ ...prev, [item.product.id]: e.target.value }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700"
                >
                  <option value="Baik">Baik</option>
                  <option value="Kotor/Laundry">Kotor / Laundry</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                  <option value="Hilang">Hilang</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

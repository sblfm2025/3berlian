import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Package, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import { useReturnWorkflow } from '../features/returns/hooks/useReturnWorkflow';
import { useMobileSearchRegistration } from '../components/layout/useMobileSearch';

// ==========================================
export default function ReturnPage({ transactions, onReturn }) {
  const {
    RETURNS_PER_PAGE,
    activeTransactions,
    applyConditionToAll,
    conditionBreakdown,
    conditionFee,
    dueSoonCount,
    dueTodayCount,
    filter,
    filteredTransactions,
    getLateDays,
    handleConfirm,
    handleSelect,
    lateFee,
    lateItemCount,
    notes,
    overdueCount,
    paginatedTransactions,
    paymentMethod,
    priorityTransactions,
    resetSelection,
    returnEndNumber,
    returnPageCount,
    returnStartNumber,
    safeReturnPage,
    searchTerm,
    selectedTrx,
    setItemConditions,
    setNotes,
    setPaymentMethod,
    setReturnPage,
    totalAdditionalFee,
    updateFilter,
    updateSearchTerm
  } = useReturnWorkflow({ transactions, onReturn });
  const mobileSearchConfig = useMemo(() => ({
    placeholder: 'Cari nota atau pelanggan',
    value: searchTerm,
    onChange: updateSearchTerm
  }), [searchTerm, updateSearchTerm]);
  useMobileSearchRegistration(mobileSearchConfig);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      <div className="brand-gradient hidden rounded-[24px] p-5 text-white shadow-soft md:block md:p-6">
        <div className="max-w-2xl">
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-white/80">Pengembalian</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-black leading-tight">Pengembalian kostum yang jelas dan siap diproses</h2>
          <p className="mt-3 text-sm md:text-base text-white/90">
            Cek status transaksi aktif, kondisi barang, dan biaya tambahan secara detail sebelum barang dikonfirmasi kembali.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Barang disewa</p>
            <p className="mt-2 text-2xl font-black">{activeTransactions.length}</p>
          </div>
          <div className="rounded-[22px] bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Terlambat</p>
            <p className="mt-2 text-2xl font-black">{overdueCount}</p>
          </div>
          <div className="rounded-[22px] bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Jatuh hari ini</p>
            <p className="mt-2 text-2xl font-black">{dueTodayCount}</p>
          </div>
          <div className="rounded-[22px] bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Mendekati batas</p>
            <p className="mt-2 text-2xl font-black">{dueSoonCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Saat ini</p>
          <p className="mt-2 text-sm font-black text-slate-900">{selectedTrx ? selectedTrx.id : 'Pilih nota'}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Biaya tambahan</p>
          <p className="mt-2 text-sm font-black text-slate-900">{formatCurrency(totalAdditionalFee)}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Aksi</p>
          <button
            type="button"
            onClick={() => {
              resetSelection();
            }}
            disabled={!selectedTrx}
            className="mt-2 rounded-[16px] bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ganti Nota
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.02fr_1.38fr] gap-4 items-start">
        <div className="pos-card p-4 md:p-5">
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-500">Daftar transaksi aktif</p>
            <h3 className="mt-1 text-lg font-black text-slate-900">Cari nota atau pelanggan</h3>
          </div>

          <div className="mt-4 hidden md:block relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID nota / nama pelanggan"
              value={searchTerm}
              onChange={(e) => {
                updateSearchTerm(e.target.value);
              }}
              className="w-full rounded-[18px] border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['Semua', 'Tepat Waktu', 'Terlambat'].map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  updateFilter(option);
                }}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${filter === option ? 'bg-blue-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-[22px] border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800">Prioritas nota</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Tindakan paling mendesak untuk hari ini</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-amber-800">{priorityTransactions.length} fokus</span>
            </div>
            <div className="mt-3 space-y-2">
              {priorityTransactions.map(({ tx, lateDays }) => (
                <div key={tx.id} className="rounded-[18px] bg-white px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{tx.id}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${lateDays > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {lateDays > 0 ? `Terlambat ${lateDays}` : 'Mendekati batas'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{tx.customerName || 'Pelanggan belum tercatat'} - {formatDate(tx.expectedReturnDate)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              {returnStartNumber}-{returnEndNumber} dari {filteredTransactions.length} nota
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              Halaman {safeReturnPage}/{returnPageCount}
            </span>
          </div>

          {filteredTransactions.length > RETURNS_PER_PAGE && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-2">
              <button
                type="button"
                onClick={() => setReturnPage(page => Math.max(1, page - 1))}
                disabled={safeReturnPage === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-slate-700 disabled:opacity-40"
                aria-label="Halaman nota sebelumnya"
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              <p className="text-sm font-black text-slate-900">{safeReturnPage}/{returnPageCount}</p>
              <button
                type="button"
                onClick={() => setReturnPage(page => Math.min(returnPageCount, page + 1))}
                disabled={safeReturnPage === returnPageCount}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-slate-700 disabled:opacity-40"
                aria-label="Halaman nota berikutnya"
              >
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                Tidak ada transaksi aktif sesuai filter.
              </div>
            ) : paginatedTransactions.map(tx => {
              const lateDays = getLateDays(tx);
              const isLate = lateDays > 0;

              return (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => handleSelect(tx)}
                  className={`w-full rounded-[22px] border p-4 text-left transition-all ${selectedTrx?.id === tx.id ? 'border-blue-500 bg-blue-50/60 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-black text-slate-900">{tx.id}</p>
                      <p className="mt-1 break-words text-sm text-slate-600">{tx.customerName || 'Pelanggan belum tercatat'}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${isLate ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isLate ? `Terlambat ${lateDays} hari` : 'Tepat waktu'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span>{formatDate(tx.rentDate)}</span>
                    <span>{formatDate(tx.expectedReturnDate)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`pos-card p-4 md:p-5 ${selectedTrx ? '' : 'hidden md:block'} md:min-h-[620px]`}>
          {selectedTrx ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Detail pengembalian</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">{selectedTrx.id}</h3>
                  <p className="mt-1 text-sm text-slate-600">{selectedTrx.customerName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${selectedTrx.calculatedLateDays > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {selectedTrx.calculatedLateDays > 0 ? `Terlambat ${selectedTrx.calculatedLateDays} hari` : 'Tepat waktu'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">{selectedTrx.items.length} item</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] bg-blue-50 p-4 border border-blue-100">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">Tanggal sewa</p>
                  <p className="mt-2 text-sm font-black text-slate-900">{formatDate(selectedTrx.rentDate)}</p>
                </div>
                <div className="rounded-[22px] bg-amber-50 p-4 border border-amber-100">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">Batas kembali</p>
                  <p className="mt-2 text-sm font-black text-slate-900">{formatDate(selectedTrx.expectedReturnDate)}</p>
                </div>
                <div className="rounded-[22px] bg-emerald-50 p-4 border border-emerald-100">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Perlu perhatian</p>
                  <p className="mt-2 text-sm font-black text-slate-900">{lateItemCount} item</p>
                </div>
              </div>

              <div className="rounded-[22px] bg-slate-50 p-4 border border-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Keterangan pelanggan</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{selectedTrx.customerName}</p>
                    <p className="mt-1 text-sm text-slate-600">Telepon: {selectedTrx.customerPhone || '-'}</p>
                    <p className="mt-1 text-sm text-slate-600">Alamat: {selectedTrx.customerAddress || 'Alamat belum dicatat'}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700">{selectedTrx.items.length} item</span>
                </div>
              </div>

              <div className="rounded-[22px] bg-slate-50 p-4 border border-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Item yang dikembalikan</h4>
                    <p className="mt-1 text-sm text-slate-600">Setiap item bisa diberi status kondisi berbeda. Gunakan aksi cepat untuk mempercepat proses.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">Checklist</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyConditionToAll('Baik')}
                    className="rounded-[14px] bg-emerald-100 px-3 py-2 text-[11px] font-bold text-emerald-700"
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
                </div>
                <div className="mt-3 space-y-3">
                  {conditionBreakdown.map(item => (
                    <div key={item.product.id} className="rounded-[20px] border border-slate-200 bg-white p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900">{item.qty}x {item.product.name}</p>
                          <p className="text-sm text-slate-500">Harga sewa: {formatCurrency(item.product.rentPrice || 0)}</p>
                          <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Biaya kondisi sekarang: {formatCurrency(item.fee)}</p>
                        </div>
                        <div className="lg:w-56">
                          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Kondisi</label>
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

              <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
                <div className="rounded-[22px] bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Metode pembayaran biaya tambahan</p>
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
                </div>

                <div className="rounded-[22px] bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Ringkasan biaya</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Denda keterlambatan</span>
                      <span>{formatCurrency(lateFee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya kondisi</span>
                      <span>{formatCurrency(conditionFee)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900">
                      <span>Total tambahan</span>
                      <span>{formatCurrency(totalAdditionalFee)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Catatan pengembalian</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Contoh: barang dikembalikan dalam keadaan kotor, ada set yang terpisah, pelanggan datang sendiri."
                  className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 resize-none"
                />
              </div>

              <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-bold">Pastikan semua item sudah dicek sebelum di-konfirmasi.</p>
                <p className="mt-1">Biaya tambahan akan dihitung berdasarkan kondisi barang dan keterlambatan.</p>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                className="w-full rounded-[20px] bg-blue-800 px-4 py-4 text-lg font-black text-white shadow-lg"
              >
                Konfirmasi Pengembalian
              </button>
            </div>
          ) : (
            <div className="hidden min-h-[560px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/50 text-center p-8 md:flex">
              <Package size={40} className="text-slate-300" />
              <p className="mt-4 text-lg font-black text-slate-800">Pilih nota terlebih dahulu</p>
              <p className="mt-2 text-sm text-slate-500">Transaksi aktif akan muncul di panel kiri untuk diproses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

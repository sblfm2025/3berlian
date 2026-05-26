import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Package, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import { useReturnWorkflow } from '../features/returns/hooks/useReturnWorkflow';
import { useMobileSearchRegistration } from '../components/layout/useMobileSearch';

// Import Subkomponen Modular
import ReturnTransactionCard from '../features/returns/components/ReturnTransactionCard';
import ReturnItemChecklist from '../features/returns/components/ReturnItemChecklist';
import ReturnSummary from '../features/returns/components/ReturnSummary';
import ReturnConfirmModal from '../features/returns/components/ReturnConfirmModal';

export default function ReturnPage({ transactions, onReturn }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const {
    RETURNS_PER_PAGE,
    activeTransactions,
    applyConditionToAll,
    conditionBreakdown,
    conditionFee,
    depositAmount,
    depositDeducted,
    depositReturned,
    dueSoonCount,
    dueTodayCount,
    feePaidSeparately,
    filter,
    filteredTransactions,
    getLateDays,
    handleConfirm,
    handleSelect,
    itemConditions,
    isReturning,
    lateFee,
    lateItemCount,
    notes,
    overdueCount,
    paginatedTransactions,
    paymentMethod,
    priorityTransactions,
    resetSelection,
    returnEndNumber,
    returnModeLabel,
    returnPageCount,
    returnQtyByProduct,
    returnStartNumber,
    safeReturnPage,
    searchTerm,
    selectedTrx,
    setItemConditions,
    setNotes,
    setPaymentMethod,
    setReturnPage,
    setUseDepositForFees,
    totalAdditionalFee,
    totalReturnableQty,
    totalReturnQty,
    useDepositForFees,
    updateReturnQty,
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
    <div className="max-w-7xl mx-auto flex flex-col gap-3">
      {/* Return Header Banner */}
      <div className="brand-gradient hidden rounded-[24px] p-4 text-white shadow-soft md:block md:p-5">
        <div className="max-w-2xl">
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-white/80">Pengembalian</p>
          <h2 className="mt-3 text-lg font-bold leading-tight sm:text-2xl md:text-3xl">Pengembalian kostum yang jelas dan siap diproses</h2>
          <p className="mt-3 text-xs text-white/90 sm:text-sm md:text-base">
            Cek status transaksi aktif, kondisi barang, dan biaya tambahan secara detail sebelum barang dikonfirmasi kembali.
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Barang disewa</p>
            <p className="mt-2 text-lg font-black sm:text-2xl">{activeTransactions.length}</p>
          </div>
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Terlambat</p>
            <p className="mt-2 text-lg font-black sm:text-2xl">{overdueCount}</p>
          </div>
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Jatuh hari ini</p>
            <p className="mt-2 text-lg font-black sm:text-2xl">{dueTodayCount}</p>
          </div>
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Mendekati batas</p>
            <p className="mt-2 text-lg font-black sm:text-2xl">{dueSoonCount}</p>
          </div>
        </div>
      </div>

      {/* Return Quick Metrics */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[11px] sm:tracking-[0.2em]">Saat ini</p>
          <p className="mt-1.5 text-sm font-semibold text-slate-900 sm:mt-2 sm:font-black">{selectedTrx ? selectedTrx.id : 'Pilih nota'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[11px] sm:tracking-[0.2em]">Biaya tambahan</p>
          <p className="mt-1.5 text-sm font-semibold text-slate-900 sm:mt-2 sm:font-black">{formatCurrency(totalAdditionalFee)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm col-span-2 sm:col-span-1 sm:px-4 sm:py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[11px] sm:tracking-[0.2em]">Aksi</p>
          <button
            type="button"
            onClick={() => {
              resetSelection();
            }}
            disabled={!selectedTrx}
            className="mt-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:mt-2 sm:rounded-[16px]"
          >
            Ganti Nota
          </button>
        </div>
      </div>

      {/* Main Interface (Left list, Right check form) */}
      <div className="grid items-start gap-3 xl:grid-cols-[1.02fr_1.38fr] xl:gap-4">
        {/* Left List of Transactions */}
        <div className="pos-card p-3 md:p-5">
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-500">Daftar transaksi aktif</p>
            <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg sm:font-black">Cari nota atau pelanggan</h3>
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

          <div className={`mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1 md:mt-4 md:flex-wrap md:overflow-visible ${searchTerm ? 'hidden md:flex' : ''}`}>
            {['Semua', 'Tepat Waktu', 'Terlambat'].map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  updateFilter(option);
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all sm:px-4 sm:py-2 sm:text-sm ${filter === option ? 'bg-blue-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Priority Alert Box */}
          <div className={`mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 md:mt-4 md:p-4 ${searchTerm ? 'hidden md:block' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800 sm:text-[11px] sm:tracking-[0.2em]">Prioritas nota</p>
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

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold md:mt-4">
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

          <div className="mt-3 space-y-2.5 md:mt-4 md:space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500 sm:rounded-[22px] sm:p-6">
                Tidak ada transaksi aktif sesuai filter.
              </div>
            ) : paginatedTransactions.map(tx => {
              const lateDays = getLateDays(tx);
              const isLate = lateDays > 0;

              return (
                <ReturnTransactionCard
                  key={tx.id}
                  tx={tx}
                  isLate={isLate}
                  lateDays={lateDays}
                  selectedTrx={selectedTrx}
                  handleSelect={handleSelect}
                  formatDate={formatDate}
                />
              );
            })}
          </div>
        </div>

        {/* Right Costumes Check Form */}
        <div className={`pos-card p-3 md:p-5 ${selectedTrx ? '' : 'hidden md:block'} md:min-h-[620px]`}>
          {selectedTrx ? (
            <div className="space-y-3 md:space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Detail pengembalian</p>
                  <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg sm:font-black">{selectedTrx.id}</h3>
                  <p className="mt-1 text-sm text-slate-600">{selectedTrx.customerName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${selectedTrx.calculatedLateDays > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {selectedTrx.calculatedLateDays > 0 ? `Terlambat ${selectedTrx.calculatedLateDays} hari` : 'Tepat waktu'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">{selectedTrx.items.length} item</span>
                </div>
              </div>

              {/* Rental Dates Summary */}
              <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 border border-blue-100 sm:rounded-[22px] sm:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700 sm:text-[11px] sm:tracking-[0.2em]">Tanggal sewa</p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-900 sm:mt-2 sm:font-black">{formatDate(selectedTrx.rentDate)}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 border border-amber-100 sm:rounded-[22px] sm:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 sm:text-[11px] sm:tracking-[0.2em]">Batas kembali</p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-900 sm:mt-2 sm:font-black">{formatDate(selectedTrx.expectedReturnDate)}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-100 sm:rounded-[22px] sm:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 sm:text-[11px] sm:tracking-[0.2em]">Perlu perhatian</p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-900 sm:mt-2 sm:font-black">{lateItemCount} item</p>
                </div>
              </div>

              {/* Customer Contact Summary */}
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 sm:rounded-[22px] sm:p-4">
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

              {/* Item Conditions Checklist */}
              <ReturnItemChecklist
                conditionBreakdown={conditionBreakdown}
                returnQtyByProduct={returnQtyByProduct}
                updateReturnQty={updateReturnQty}
                itemConditions={itemConditions}
                setItemConditions={setItemConditions}
                applyConditionToAll={applyConditionToAll}
                formatCurrency={formatCurrency}
              />

              {/* Financial & Deposit Summary */}
              <ReturnSummary
                depositAmount={depositAmount}
                useDepositForFees={useDepositForFees}
                setUseDepositForFees={setUseDepositForFees}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                returnModeLabel={returnModeLabel}
                lateFee={lateFee}
                conditionFee={conditionFee}
                totalAdditionalFee={totalAdditionalFee}
                depositDeducted={depositDeducted}
                depositReturned={depositReturned}
                feePaidSeparately={feePaidSeparately}
                totalReturnQty={totalReturnQty}
                totalReturnableQty={totalReturnableQty}
                formatCurrency={formatCurrency}
              />

              {/* Notes Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Catatan pengembalian</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Contoh: barang dikembalikan dalam keadaan kotor, ada set yang terpisah, pelanggan datang sendiri."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 resize-none sm:rounded-[18px] sm:px-4 sm:py-3"
                />
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 sm:rounded-[22px] sm:p-4 sm:text-sm">
                <p className="font-bold">Pastikan semua item sudah dicek sebelum di-konfirmasi.</p>
                <p className="mt-1">Biaya tambahan akan dihitung berdasarkan kondisi barang dan keterlambatan.</p>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={isReturning || totalReturnQty <= 0}
                className="w-full rounded-2xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white shadow-md sm:rounded-[20px] sm:py-4 sm:text-base sm:font-black"
              >
                {isReturning ? 'Memproses pengembalian...' : totalReturnQty <= 0 ? 'Pilih item kembali' : 'Konfirmasi Pengembalian'}
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

      {/* Confirm Modal Dialog */}
      <ReturnConfirmModal
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        selectedTrx={selectedTrx}
        returnModeLabel={returnModeLabel}
        totalReturnQty={totalReturnQty}
        conditionBreakdown={conditionBreakdown}
        returnQtyByProduct={returnQtyByProduct}
        itemConditions={itemConditions}
        lateFee={lateFee}
        conditionFee={conditionFee}
        totalAdditionalFee={totalAdditionalFee}
        depositAmount={depositAmount}
        useDepositForFees={useDepositForFees}
        depositDeducted={depositDeducted}
        depositReturned={depositReturned}
        feePaidSeparately={feePaidSeparately}
        paymentMethod={paymentMethod}
        notes={notes}
        isReturning={isReturning}
        handleConfirm={handleConfirm}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

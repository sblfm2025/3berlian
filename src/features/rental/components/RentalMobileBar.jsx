import { ArrowLeft, CreditCard, ChevronRight } from 'lucide-react';

export default function RentalMobileBar({
  activeStep,
  setActiveStep,
  totalItems,
  grandTotal,
  customerNameInput,
  paymentMethod,
  setShowMobileCheckout,
  formatCurrency,
  handleCheckoutClick,
  isCheckingOut,
  getStockIssue,
  finalCashReceived,
  onNotify
}) {
  if (totalItems === 0) return null;

  const handleNextStep = () => {
    if (activeStep === 1) {
      if (totalItems === 0) {
        onNotify?.({
          title: 'Keranjang Kosong',
          message: 'Silakan pilih minimal 1 kostum adat dari katalog.',
          type: 'warning'
        });
        return;
      }
      setActiveStep(2);
      setShowMobileCheckout(true); // Membuka panel checkout overlay di mobile
    } else if (activeStep === 2) {
      if (totalItems === 0) return;
      setActiveStep(3);
    } else if (activeStep === 3) {
      if (!customerNameInput?.trim()) {
        onNotify?.({
          title: 'Nama Pelanggan Wajib',
          message: 'Silakan isi atau pilih nama pelanggan terlebih dahulu.',
          type: 'warning'
        });
        return;
      }
      setActiveStep(4);
    } else if (activeStep === 4) {
      // Pemicu checkout akhir secara langsung
      if (getStockIssue().length > 0) {
        onNotify?.({
          title: 'Stok Tidak Cukup',
          message: 'Ada item di keranjang yang melebihi batas stok tersedia.',
          type: 'error'
        });
        return;
      }
      if (paymentMethod === 'Tunai' && finalCashReceived < grandTotal) {
        onNotify?.({
          title: 'Pembayaran Kurang',
          message: 'Uang tunai yang diterima kurang dari total tagihan.',
          type: 'warning'
        });
        return;
      }
      handleCheckoutClick();
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      const nextStep = activeStep - 1;
      setActiveStep(nextStep);
      if (nextStep === 1) {
        setShowMobileCheckout(false); // Menutup panel checkout kembali ke katalog
      }
    }
  };

  const stepLabels = {
    1: 'Ke Keranjang',
    2: 'Ke Pelanggan',
    3: 'Ke Pembayaran',
    4: isCheckingOut ? 'Memproses...' : 'Bayar & Cetak'
  };

  const isNextDisabled = () => {
    if (activeStep === 1 && totalItems === 0) return true;
    if (activeStep === 2 && totalItems === 0) return true;
    if (activeStep === 3 && !customerNameInput?.trim()) return true;
    if (activeStep === 4 && (isCheckingOut || getStockIssue().length > 0 || (paymentMethod === 'Tunai' && finalCashReceived < grandTotal))) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] flex gap-3 items-center justify-between">
      {/* Tombol Kembali (Hanya tampil dari step 2 ke atas) */}
      {activeStep > 1 ? (
        <button
          type="button"
          onClick={handlePrevStep}
          className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
          aria-label="Kembali ke langkah sebelumnya"
        >
          <ArrowLeft size={18} />
        </button>
      ) : (
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">Total Sewa</p>
          <p className="text-base font-black text-slate-900 truncate mt-0.5">{formatCurrency(grandTotal)}</p>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">{totalItems} item kostum dipilih</p>
        </div>
      )}

      {/* Tombol Aksi Stepper Utama (Min-height 44px) */}
      <button
        type="button"
        onClick={handleNextStep}
        disabled={isNextDisabled()}
        className={`flex-1 min-h-[44px] rounded-xl px-4 text-xs font-black uppercase tracking-[0.1em] text-white shadow-md flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed ${
          activeStep === 4
            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
            : 'bg-emerald-900 hover:bg-emerald-950 shadow-emerald-100'
        }`}
      >
        {activeStep === 4 ? <CreditCard size={15} /> : <ChevronRight size={15} />}
        <span>{stepLabels[activeStep]}</span>
        {activeStep === 1 && <span className="bg-white/20 text-white rounded-full px-2 py-0.5 text-[9px] font-bold">{totalItems}</span>}
      </button>
    </div>
  );
}

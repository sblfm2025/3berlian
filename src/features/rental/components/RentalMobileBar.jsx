import { ArrowLeft, CreditCard, ChevronRight } from 'lucide-react';

export default function RentalMobileBar({
  activeStep,
  setActiveStep,
  totalItems,
  grandTotal,
  setShowMobileCheckout,
  formatCurrency,
  handleCheckoutClick,
  isCheckingOut,
  onNotify
}) {
  if (totalItems === 0) return null;

  const handleNextStep = () => {
    if (activeStep === 1) {
      setActiveStep(2);
      setShowMobileCheckout(true);
    } else if (activeStep === 2) {
      setActiveStep(3);
      setShowMobileCheckout(true);
    } else if (activeStep === 3) {
      setActiveStep(4);
      setShowMobileCheckout(true);
    } else if (activeStep === 4) {
      onNotify?.({ title: 'Memeriksa checkout', message: 'Validasi lengkap dijalankan sekarang.', type: 'info' });
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
    return activeStep === 4 && isCheckingOut;
  };

  return (
    <div
      style={{ bottom: 'calc(92px + env(safe-area-inset-bottom))' }}
      className="md:hidden fixed left-3 right-3 z-40 rounded-2xl bg-slate-950 px-3 py-3 text-white shadow-[0_18px_50px_rgba(15,23,42,0.28)] flex gap-3 items-center justify-between"
    >
      {/* Tombol Kembali (Hanya tampil dari step 2 ke atas) */}
      {activeStep > 1 ? (
        <button
          type="button"
          onClick={handlePrevStep}
          className="min-h-[44px] min-w-[44px] rounded-xl border border-white/15 bg-white/10 flex items-center justify-center text-white transition"
          aria-label="Kembali ke langkah sebelumnya"
        >
          <ArrowLeft size={18} />
        </button>
      ) : (
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/65">Keranjang</p>
          <p className="text-base font-bold text-white truncate mt-0.5">{totalItems} item - {formatCurrency(grandTotal)}</p>
          <p className="text-[10px] text-white/60 truncate mt-0.5">Total berjalan siap dilanjutkan</p>
        </div>
      )}

      {/* Tombol Aksi Stepper Utama (Min-height 44px) */}
      <button
        type="button"
        onClick={handleNextStep}
        disabled={isNextDisabled()}
        className={`flex-1 min-h-[44px] rounded-xl px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white shadow-md flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed ${
          activeStep === 4
            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-950/20'
            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-950/20'
        }`}
      >
        {activeStep === 4 ? <CreditCard size={15} /> : <ChevronRight size={15} />}
        <span>{stepLabels[activeStep]}</span>
        {activeStep === 1 && <span className="bg-white/20 text-white rounded-full px-2 py-0.5 text-[9px] font-bold">{totalItems}</span>}
      </button>
    </div>
  );
}

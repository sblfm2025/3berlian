import { Package, Sparkles } from 'lucide-react';

/**
 * Komponen EmptyState premium untuk menggantikan visual data kosong yang membosankan.
 * Menyediakan CTA terarah dan visual yang menarik.
 */
export default function EmptyState({
  title = 'Data Belum Tersedia',
  description = 'Tambahkan entri data baru untuk memulai pencatatan di sistem sanggar seni.',
  ctaText,
  onCtaClick,
  icon: Icon = Package
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-8 text-center max-w-lg mx-auto shadow-sm my-6 space-y-5 animate-fade-in">
      <div className="relative mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
        <Icon size={28} strokeWidth={2} />
        <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-500 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-black text-slate-800 tracking-tight sm:text-lg">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>

      {ctaText && onCtaClick && (
        <button
          type="button"
          onClick={onCtaClick}
          className="btn-accent min-h-[44px] px-6 rounded-xl font-black text-xs uppercase tracking-[0.1em] transition flex items-center gap-2 mx-auto"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
}

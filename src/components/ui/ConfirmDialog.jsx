import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  cancelLabel = 'Batal',
  confirmLabel = 'Konfirmasi',
  description,
  isLoading = false,
  onCancel,
  onConfirm,
  open,
  title,
  tone = 'danger'
}) {
  if (!open) return null;

  const toneClass = tone === 'danger'
    ? 'bg-red-50 text-red-700 border-red-100'
    : 'bg-blue-50 text-blue-700 border-blue-100';
  const buttonClass = tone === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-blue-800 hover:bg-blue-900';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_90px_-38px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border ${toneClass}`}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 disabled:opacity-50"
            aria-label="Tutup dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-[16px] border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-[16px] px-5 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass}`}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

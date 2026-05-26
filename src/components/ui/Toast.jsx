import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const styles = {
  error: {
    bar: 'bg-red-600',
    icon: 'bg-red-50 text-red-700',
    Icon: AlertCircle
  },
  info: {
    bar: 'bg-blue-700',
    icon: 'bg-blue-50 text-blue-700',
    Icon: Info
  },
  success: {
    bar: 'bg-emerald-600',
    icon: 'bg-emerald-50 text-emerald-700',
    Icon: CheckCircle2
  },
  warning: {
    bar: 'bg-amber-500',
    icon: 'bg-amber-50 text-amber-700',
    Icon: AlertCircle
  }
};

export default function Toast({ message, onClose, title, type = 'info' }) {
  if (!message && !title) return null;

  const current = styles[type] || styles.info;
  const Icon = current.Icon;

  return (
    <div className="fixed inset-x-3 top-4 z-[90] sm:inset-x-auto sm:right-5 sm:w-[380px]">
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_70px_-34px_rgba(15,23,42,0.75)]">
        <div className={`h-1.5 ${current.bar}`} />
        <div className="flex items-start gap-3 px-4 py-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] ${current.icon}`}>
            <Icon size={21} />
          </div>
          <div className="min-w-0 flex-1">
            {title && <p className="text-sm font-black text-slate-900">{title}</p>}
            {message && <p className="mt-1 text-sm leading-relaxed text-slate-600">{message}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            aria-label="Tutup notifikasi"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

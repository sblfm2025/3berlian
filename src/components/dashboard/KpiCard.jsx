const toneClasses = {
  blue: {
    badge: 'bg-blue-50 text-blue-700',
    label: 'Hari ini'
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700',
    label: 'Aktif'
  },
  red: {
    badge: 'bg-red-50 text-red-700',
    label: 'Perlu'
  },
  green: {
    badge: 'bg-emerald-50 text-emerald-700',
    label: 'Rata-rata'
  }
};

export default function KpiCard({ onClick, subtitle, title, tone = 'green', value }) {
  const toneConfig = toneClasses[tone] || toneClasses.green;

  return (
    <button
      onClick={onClick}
      className="pos-card p-3 text-left transition-transform hover:-translate-y-0.5 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">{title}</p>
          <p className="mt-2 text-xl font-bold text-slate-900 sm:mt-3 sm:text-2xl sm:font-black">{value}</p>
        </div>
        <span className={`rounded-xl px-2.5 py-1.5 text-[10px] font-bold sm:rounded-2xl sm:px-3 sm:py-2 sm:text-xs ${toneConfig.badge}`}>
          {toneConfig.label}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">{subtitle}</p>
    </button>
  );
}

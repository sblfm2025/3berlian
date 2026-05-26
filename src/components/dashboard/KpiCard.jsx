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
      className="pos-card p-5 text-left transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 font-semibold">{title}</p>
          <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
        </div>
        <span className={`rounded-2xl px-3 py-2 text-xs font-bold ${toneConfig.badge}`}>
          {toneConfig.label}
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{subtitle}</p>
    </button>
  );
}

export default function MetricCard({ description, title, value, valueClassName = 'text-2xl' }) {
  return (
    <div className="pos-card p-3 sm:p-5">
      <p className="text-xs font-semibold text-slate-500 sm:text-sm">{title}</p>
      <p className={`mt-2 font-bold text-slate-900 sm:mt-3 sm:font-black ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-500 sm:text-sm">{description}</p>
    </div>
  );
}

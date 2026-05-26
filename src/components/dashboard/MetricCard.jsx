export default function MetricCard({ description, title, value, valueClassName = 'text-2xl' }) {
  return (
    <div className="pos-card p-5">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className={`mt-3 font-black text-slate-900 ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

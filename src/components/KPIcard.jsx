export default function KPIcard({ label, value, helper, trend, color = 'brand' }) {
  const colors = { brand: 'bg-brand-100 text-brand-700', emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', rose: 'bg-rose-100 text-rose-700' };
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[color] || colors.brand}`}>{trend ?? 'Live'}</span>
      </div>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

const colors = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Critical: 'bg-rose-100 text-rose-800 border-rose-300',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Pending Escalation': 'bg-rose-50 text-rose-700 border-rose-200',
  'Ready for Approval': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  Escalated: 'bg-rose-50 text-rose-700 border-rose-200',
  'Modified with Comment': 'bg-amber-50 text-amber-700 border-amber-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-50 text-slate-500 border-slate-200',
  Open: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-brand-50 text-brand-700 border-brand-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Resolved: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function StatusBadge({ text }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${colors[text] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {text}
    </span>
  );
}

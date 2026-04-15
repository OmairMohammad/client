import { useState } from 'react';

const permissionMap = {
  'Engineer / Operator': ['Approved', 'Modified with Comment'],
  'Maintenance Planner': ['Approved', 'Modified with Comment', 'Escalated'],
  Executive: ['Approved', 'Modified with Comment', 'Escalated'],
  'Regulator / Auditor': ['Approved'],
  'Sustainability / Transition Lead': ['Modified with Comment'],
  Admin: ['Approved', 'Modified with Comment', 'Escalated'],
};

const standardOptions = ['AS3788', 'AS4343', 'NGER', 'ISO14001', 'ISO55001', 'AISC'];

export default function ReviewActions({ asset, userRole, onDecision }) {
  const [comment, setComment] = useState('');
  const [standard, setStandard] = useState('AS3788');
  const [submitted, setSubmitted] = useState(null);
  const allowed = permissionMap[userRole] ?? [];

  const handleAction = decision => {
    if (!allowed.includes(decision)) return;
    onDecision?.({ decision, comment: comment.trim() || 'No additional comment provided.', standard, compliant: decision !== 'Escalated' });
    setSubmitted(decision);
    setComment('');
    setTimeout(() => setSubmitted(null), 3000);
  };

  const buttons = [
    { label: 'Approve Recommendation', decision: 'Approved', className: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Modify with Comment', decision: 'Modified with Comment', className: 'bg-amber-500 hover:bg-amber-600' },
    { label: 'Escalate to Manager', decision: 'Escalated', className: 'bg-rose-600 hover:bg-rose-700' },
  ];

  return (
    <div className="card p-5">
      <h3 className="card-title">Human Review – {asset?.assetId}</h3>
      <p className="muted">Role: {userRole} · Human-in-the-loop decision required before any maintenance action.</p>

      {submitted && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✓ Decision recorded: <strong>{submitted}</strong>. Audit log updated.
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {buttons.map(btn => (
          <button key={btn.decision} type="button"
            disabled={!allowed.includes(btn.decision)}
            onClick={() => handleAction(btn.decision)}
            className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${btn.className} disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500`}>
            {btn.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Compliance Standard</label>
          <select value={standard} onChange={e => setStandard(e.target.value)} className="input">
            {standardOptions.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-1" />
      </div>

      <textarea value={comment} onChange={e => setComment(e.target.value)}
        className="input mt-3 min-h-[100px] resize-y"
        placeholder="Reviewer comment / justification / escalation note (required for audit)" />

      <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Permitted actions for <strong>{userRole}</strong>: {allowed.join(', ') || 'View only — no action permitted for this role'}
      </div>
    </div>
  );
}

import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function ExplainabilityPanel({ asset }) {
  if (!asset) return null;
  const { anomaly } = asset;
  const explainability = asset.explainability || {};
  const factors = asset.keyFactors || explainability.factors || [];
  const supportingNotes = asset.supportingNotes || explainability.supportingNotes || 'Recommendation generated from rules-based scoring, anomaly signals, maintenance history, and human-review safeguards.';

  return (
    <div className="card p-5">
      <h3 className="card-title">Explainable Output</h3>
      <p className="muted">Key factors, anomaly detection results, and decision rationale.</p>

      <div className="mt-5 space-y-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Key Factors Driving This Recommendation</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {factors.map(f => (
              <li key={f} className="flex items-start gap-2">
                {f.includes('⚠') ? <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" /> : <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />}
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Anomaly Detection Results</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className={`h-full rounded-full ${anomaly.score >= 50 ? 'bg-rose-500' : anomaly.score >= 25 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${anomaly.score}%` }} />
            </div>
            <span className="text-sm font-bold">{anomaly.level}</span>
          </div>
          <ul className="mt-3 space-y-1">
            {anomaly.flags.map(f => (
              <li key={f} className="text-xs text-slate-600 flex items-start gap-1">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risk Priority</p>
          <p className="mt-2 text-sm text-slate-700">Priority is <span className="font-semibold">{asset.riskLevel}</span> based on asset condition, maintenance lag, sensor thresholds, and fault event history.</p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supporting Notes</p>
          <p className="mt-2 text-sm text-slate-700">{supportingNotes}</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
          <strong>Governance note:</strong> All recommendations are advisory only. A human reviewer must approve, modify, or escalate each recommendation before action is taken. Outputs are logged for audit compliance.
        </div>
      </div>
    </div>
  );
}

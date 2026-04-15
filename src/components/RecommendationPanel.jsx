import { Brain, Clock, TrendingDown } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function RecommendationPanel({ asset }) {
  if (!asset) return null;
  const { prediction, strategyRecommendation, confidenceScore } = asset;
  const strategyNote = strategyRecommendation?.rationale || `Recommended strategy score: ${strategyRecommendation?.score ?? 'N/A'}. This option best fits the current asset criticality, age, fault history, and overdue maintenance profile.`;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="card-title">AI Recommendation Panel</h3>
          <p className="muted">Multi-model advisory output — {asset.assetId} · {asset.assetName}</p>
        </div>
        <StatusBadge text={asset.riskLevel} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended Action</p>
          <p className="mt-2 text-base font-bold text-slate-900">{asset.recommendedAction}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review Status</p>
          <p className="mt-2 text-base font-bold text-slate-900">{asset.reviewStatus}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1"><Clock size={12} /> Predicted Days to Failure</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{prediction.daysToFailure} <span className="text-sm font-normal text-slate-500">days</span></p>
          <p className="text-xs text-slate-400 mt-1">Model confidence: {prediction.confidence}%</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1"><Brain size={12} /> AI Confidence Score</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className={`h-full rounded-full ${confidenceScore >= 80 ? 'bg-emerald-500' : confidenceScore >= 65 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${confidenceScore}%` }} />
            </div>
            <span className="text-sm font-bold text-slate-900">{confidenceScore}%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1"><TrendingDown size={12} /> Strategy Recommendation</p>
        <p className="mt-2 text-sm font-bold text-slate-900">{strategyRecommendation?.name}</p>
        <p className="mt-1 text-sm text-slate-600">{strategyNote}</p>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operator Observation</p>
        <p className="mt-2 text-sm text-slate-700">{asset.operatorObservation}</p>
      </div>
    </div>
  );
}

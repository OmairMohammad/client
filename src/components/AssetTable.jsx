import StatusBadge from './StatusBadge';

export default function AssetTable({ assets, onSelect, selectedId }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="card-title">Asset Overview</h3>
          <p className="muted">Click any row to load recommendation and explainability data.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Asset ID</th>
              <th className="px-5 py-3">Asset</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Health</th>
              <th className="px-5 py-3">Risk</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {assets.map(asset => (
              <tr key={asset.assetId}
                onClick={() => onSelect(asset)}
                className={`cursor-pointer transition hover:bg-slate-50 ${selectedId === asset.assetId ? 'bg-brand-50 border-l-4 border-brand-600' : ''}`}>
                <td className="px-5 py-4 text-sm font-semibold text-slate-900">{asset.assetId}</td>
                <td className="px-5 py-4 text-sm text-slate-700">{asset.assetName}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{asset.assetType}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-slate-200 overflow-hidden">
                      <div className={`h-full rounded-full ${asset.healthScore >= 70 ? 'bg-emerald-500' : asset.healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${asset.healthScore}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{asset.healthScore}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><StatusBadge text={asset.riskLevel} /></td>
                <td className="px-5 py-4 text-sm text-slate-700">{asset.recommendedAction}</td>
                <td className="px-5 py-4"><StatusBadge text={asset.reviewStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

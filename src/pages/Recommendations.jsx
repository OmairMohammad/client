import { AlertTriangle, BriefcaseBusiness, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import Navbar from '../components/Navbar';
import RecommendationPanel from '../components/RecommendationPanel';
import ReviewActions from '../components/ReviewActions';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Recommendations() {
  const { currentUser, addAuditEntry, addNotification, refreshAudit, refreshAlerts } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [riskFilter, setRiskFilter] = useState('All');
  const [stratFilter, setStratFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [siteFilter, setSiteFilter] = useState(currentUser?.site || 'All');

  const loadAssets = async () => {
    const data = await api.getAssets(siteFilter && siteFilter !== 'All' ? { site: siteFilter } : {});
    setAssets(data);
    setSelected(prev => data.find(asset => asset.assetId === prev?.assetId) || data[0] || null);
  };

  useEffect(() => {
    loadAssets();
  }, [siteFilter]);

  const strategies = useMemo(() => ['All', ...new Set(assets.map(a => a.maintenanceStrategy))], [assets]);
  const visible = useMemo(() => assets.filter(asset => {
    const matchRisk = riskFilter === 'All' || asset.riskLevel === riskFilter;
    const matchStrategy = stratFilter === 'All' || asset.maintenanceStrategy === stratFilter;
    return matchRisk && matchStrategy;
  }), [assets, riskFilter, stratFilter]);

  const handleCreateWorkOrder = async () => {
    if (!selected) return;
    await api.createWorkOrder({
      asset_id: selected.assetId,
      title: `${selected.recommendedAction} for ${selected.assetId}`,
      description: `Generated from recommendation workflow. Strategy: ${selected.maintenanceStrategy}. Key drivers: ${(selected.explainability?.factors || []).join(', ')}` ,
      priority: selected.riskLevel === 'High' ? 'High' : 'Medium',
      status: 'Open',
      assignee: '',
      due_date: '',
      source: 'recommendation',
    });
    addNotification(`Work order created for ${selected.assetId}`);
  };

  const handleDecision = async payload => {
    if (!selected) return;
    const result = await addAuditEntry({ assetId: selected.assetId, ...payload });
    if (result.ok) {
      addNotification(`Recommendation decision saved for ${selected.assetId}`);
      await Promise.all([loadAssets(), refreshAudit(), refreshAlerts({ status_filter: 'Open' })]);
    }
  };

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Recommendations</h2>
              <p className="mt-1 text-sm text-slate-500">Live backend recommendations with explainability and human review controls.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select className="input min-w-[180px]" value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
                {['All', ...new Set(assets.map(a => a.site)), currentUser?.site].filter(Boolean).filter((value, index, arr) => arr.indexOf(value) === index).map(site => <option key={site}>{site}</option>)}
              </select>
              <select className="input min-w-[140px]" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
                {['All', 'Low', 'Medium', 'High'].map(r => <option key={r}>{r}</option>)}
              </select>
              <select className="input min-w-[180px]" value={stratFilter} onChange={e => setStratFilter(e.target.value)}>
                {strategies.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              {visible.map(asset => (
                <button key={asset.assetId} type="button" onClick={() => setSelected(asset)} className={`card w-full p-5 text-left transition ${selected?.assetId === asset.assetId ? 'border-brand-500 ring-2 ring-brand-100' : 'hover:border-slate-300'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{asset.assetName}</h3>
                      <p className="mt-1 text-xs text-slate-500">{asset.assetId} · {asset.site} · {asset.maintenanceStrategy}</p>
                    </div>
                    <StatusBadge text={asset.riskLevel} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <span className="text-xs text-slate-400 block">Recommended Action</span>
                      <span className="font-semibold text-slate-900">{asset.recommendedAction}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <span className="text-xs text-slate-400 block">Review Status</span>
                      <span className="font-semibold text-slate-900">{asset.reviewStatus}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <span className="text-xs text-slate-400 block flex items-center gap-1"><Clock size={12} /> Days to Failure</span>
                      <span className="font-semibold text-slate-900">{asset.prediction.daysToFailure}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <span className="text-xs text-slate-400 block">Confidence</span>
                      <span className="font-semibold text-slate-900">{asset.confidenceScore}%</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    {(asset.explainability?.factors || []).slice(0, 3).map(factor => (
                      <div key={factor} className="flex items-start gap-2">
                        {factor.toLowerCase().includes('overdue') || factor.toLowerCase().includes('fault') ? <AlertTriangle size={14} className="mt-0.5 text-amber-500" /> : <CheckCircle size={14} className="mt-0.5 text-emerald-500" />}
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {selected ? (
                <>
                  <RecommendationPanel asset={selected} />
                  <ExplainabilityPanel asset={selected} />
                  <div className="flex flex-wrap justify-end gap-3">
                    <button onClick={handleCreateWorkOrder} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      <BriefcaseBusiness size={15} /> Create Work Order
                    </button>
                    <button onClick={() => navigate(`/assets/${selected.assetId}`)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      <ExternalLink size={15} /> Open Asset Detail
                    </button>
                  </div>
                  <ReviewActions asset={selected} userRole={currentUser?.role} onDecision={handleDecision} />
                </>
              ) : (
                <div className="card p-6 text-sm text-slate-500">No recommendations match the current filters.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import AssetTable from '../components/AssetTable';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import KPIcard from '../components/KPIcard';
import Navbar from '../components/Navbar';
import RecommendationPanel from '../components/RecommendationPanel';
import ReviewActions from '../components/ReviewActions';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const chartColors = ['#16a34a', '#f59e0b', '#e11d48'];

const roleDescriptions = {
  Admin: 'Full control — users, approvals, roles, review actions, and all fleet data.',
  'Engineer / Operator': 'Can review recommendations and approve or modify field-level decisions.',
  'Maintenance Planner': 'Can coordinate maintenance actions and escalate high-risk issues.',
  Executive: 'Can review fleet risk, summaries, and escalated decisions.',
  'Regulator / Auditor': 'Can inspect audit-ready records and approved decisions.',
  'Sustainability / Transition Lead': 'Can review trend data and transition-related insights.',
};

export default function Dashboard() {
  const { currentUser, auditLog, addAuditEntry, addNotification, sites, refreshAudit, refreshAlerts } = useAuth();
  const [site, setSite] = useState(currentUser?.site || '');
  const [filterRisk, setFilterRisk] = useState('All');
  const [dashboard, setDashboard] = useState({ metrics: [], chartData: [], assets: [], openAlerts: 0, openWorkOrders: 0 });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!site && sites.length) setSite(currentUser?.site || sites[0].name);
  }, [sites, site, currentUser]);

  useEffect(() => {
    if (!site) return;
    let mounted = true;
    setLoading(true);
    api.getDashboard(site)
      .then(data => {
        if (!mounted) return;
        setDashboard(data);
        setSelectedAsset(prev => data.assets.find(asset => asset.assetId === prev?.assetId) || data.assets[0] || null);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [site]);

  const filteredAssets = useMemo(() => {
    if (filterRisk === 'All') return dashboard.assets;
    return dashboard.assets.filter(asset => asset.riskLevel === filterRisk);
  }, [dashboard.assets, filterRisk]);

  const metrics = useMemo(() => {
    const mapped = (dashboard.metrics || []).map(m => ({
      label: m.label,
      value: m.value,
      helper: m.subtitle || m.helper,
      trend: 'Live',
    }));
    return [
      ...mapped,
      { label: 'Open Alerts', value: dashboard.openAlerts, helper: 'Backend-generated alerts awaiting action', trend: 'Live' },
      { label: 'Open Work Orders', value: dashboard.openWorkOrders, helper: 'Persistent work orders currently open', trend: 'Live' },
    ];
  }, [dashboard]);

  const barData = useMemo(() => dashboard.assets.map(a => ({ name: a.assetId, health: a.healthScore, efficiency: a.efficiencyScore })), [dashboard.assets]);

  const handleDecision = async ({ decision, comment, standard, compliant }) => {
    if (!selectedAsset) return;
    const result = await addAuditEntry({ assetId: selectedAsset.assetId, decision, comment, standard, compliant });
    if (result.ok) {
      addNotification(`Decision recorded for ${selectedAsset.assetId}: ${decision}`);
      const next = await api.getDashboard(site);
      setDashboard(next);
      setSelectedAsset(next.assets.find(asset => asset.assetId === selectedAsset.assetId) || next.assets[0] || null);
      await Promise.all([refreshAudit(), refreshAlerts({ status_filter: 'Open' })]);
    }
  };

  const handleExport = () => {
    const rows = filteredAssets.map(a => `${a.assetId},${a.assetName},${a.riskLevel},${a.healthScore},${a.recommendedAction},${a.reviewStatus}`);
    const csv = ['Asset ID,Asset Name,Risk Level,Health Score,Recommended Action,Review Status', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-summary-${site.replace(/ /g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Fleet Overview Dashboard</h2>
              <p className="mt-1 text-sm text-slate-500">Health scores, risk levels, AI recommendations, backend alerts, and review status across thermal assets.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select className="input min-w-[220px]" value={site} onChange={e => setSite(e.target.value)}>
                {sites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <select className="input min-w-[140px]" value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                {['All', 'Low', 'Medium', 'High'].map(r => <option key={r}>{r}</option>)}
              </select>
              <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-8">
            {metrics.map((m, i) => (
              <KPIcard key={m.label} {...m} color={i === 3 ? 'rose' : i === 2 ? 'amber' : i === 1 ? 'emerald' : 'brand'} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="card p-5">
              <h3 className="card-title">Access Profile · {currentUser?.role}</h3>
              <p className="muted mt-1">{roleDescriptions[currentUser?.role]}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4 text-sm">User: <strong>{currentUser?.name}</strong></div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm">Site: <strong>{currentUser?.site}</strong></div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm">Role: <strong>{currentUser?.role}</strong></div>
              </div>
              <div className="mt-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="health" name="Health Score" fill="#cf2e2e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="efficiency" name="Efficiency" fill="#64748b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="card-title">Risk Distribution – {site}</h3>
              <p className="muted">Live breakdown by risk category.</p>
              <div className="mt-4 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dashboard.chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
                      {(dashboard.chartData || []).map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {(dashboard.chartData || []).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[i] }} />
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6">
            <AssetTable assets={filteredAssets} onSelect={setSelectedAsset} selectedId={selectedAsset?.assetId} />
          </section>

          {loading ? (
            <div className="mt-6 card p-6 text-sm text-slate-500">Loading dashboard data…</div>
          ) : (
            <>
              <section className="mt-6 grid gap-6 xl:grid-cols-2">
                <RecommendationPanel asset={selectedAsset} />
                <ExplainabilityPanel asset={selectedAsset} />
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <ReviewActions asset={selectedAsset} userRole={currentUser?.role} onDecision={handleDecision} />
                <div className="card p-5">
                  <h3 className="card-title">Audit Snapshot</h3>
                  <p className="muted">Last 5 recorded decisions.</p>
                  <div className="mt-4 space-y-3">
                    {auditLog.slice(0, 5).map(e => (
                      <div key={e.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                        <div className="flex justify-between"><span className="font-semibold">{e.id}</span><span className="text-xs text-slate-400">{e.timestamp}</span></div>
                        <p className="text-slate-600 mt-1">Asset: {e.assetId} · {e.decision}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{e.reviewer} — {e.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import Navbar from '../components/Navbar';
import RecommendationPanel from '../components/RecommendationPanel';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function AssetDetail() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getAssetDetail(assetId).then(data => mounted && setDetail(data));
    return () => {
      mounted = false;
    };
  }, [assetId]);

  const asset = detail?.asset;

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6 space-y-6">
          {!detail ? <div className="card p-6 text-sm text-slate-500">Loading asset detail…</div> : (
            <>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <Link to={currentUser?.role === 'Admin' ? '/fleet-assets' : '/recommendations'} className="text-sm font-medium text-brand-600">← Back</Link>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{asset.assetName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{asset.assetId} · {asset.assetType} · {asset.site}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge text={asset.riskLevel} />
                  <StatusBadge text={asset.reviewStatus} />
                </div>
              </div>

              <section className="grid gap-4 md:grid-cols-6">
                {[['Health', `${asset.healthScore}/100`], ['Efficiency', `${asset.efficiencyScore}%`], ['Days to Failure', asset.prediction.daysToFailure], ['Recent Faults', asset.recentFaults], ['Overdue Days', asset.overdueDays], ['Confidence', `${asset.confidenceScore}%`]].map(([label, value]) => (
                  <div key={label} className="card p-5"><p className="text-sm font-semibold text-slate-900">{label}</p><p className="mt-3 text-3xl font-bold text-brand-600">{value}</p></div>
                ))}
              </section>

              <section className="card p-5">
                <h3 className="card-title">Condition Trend</h3>
                <div className="mt-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detail.conditionHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="observation_date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="temperature" stroke="#cf2e2e" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="vibration" stroke="#64748b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="efficiency_score" stroke="#16a34a" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <RecommendationPanel asset={asset} />
                <ExplainabilityPanel asset={asset} />
              </section>

              <section className="card p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h3 className="card-title">Projected Failure Trend</h3>
                    <p className="muted">Forecast generated from historical health trajectory, current risk, recent faults, and overdue maintenance.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">30-day health: {detail.forecast?.projectedHealth30d}</span>
                    <button onClick={() => navigate('/work-orders')} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Work Orders</button>
                  </div>
                </div>
                <div className="mt-5 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detail.forecast?.weeklyProjection || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#cf2e2e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-4 text-sm text-slate-600">{detail.forecast?.narrative}</p>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="card p-5">
                  <h3 className="card-title">Maintenance History</h3>
                  <div className="mt-4 space-y-3">
                    {detail.maintenanceHistory.slice(0, 8).map(row => <div key={row.history_id} className="rounded-xl border border-slate-200 p-3"><p className="font-semibold text-slate-900">{row.service_type} · {row.service_date}</p><p className="text-sm text-slate-600">{row.technician} · {row.downtime_hours}h downtime</p><p className="text-xs text-slate-400">{row.notes}</p></div>)}
                  </div>
                </div>
                <div className="card p-5">
                  <h3 className="card-title">Audit Trail</h3>
                  <div className="mt-4 space-y-3">
                    {detail.auditTrail.slice(0, 8).map(row => <div key={row.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-900">{row.id}</p><StatusBadge text={row.decision} /></div><p className="mt-1 text-sm text-slate-600">{row.reviewer} · {row.standard}</p><p className="text-xs text-slate-400">{row.comment}</p></div>)}
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-3">
                <div className="card p-5"><h3 className="card-title">Training Record</h3><div className="mt-4 space-y-2 text-sm text-slate-600"><p>Certified: <strong>{detail.trainingRecord?.worker_certified ? 'Yes' : 'No'}</strong></p><p>Experience: <strong>{detail.trainingRecord?.worker_experience_years} years</strong></p><p>Fatigue: <strong>{detail.trainingRecord?.worker_fatigue}</strong></p><p>Compliance: <strong>{detail.trainingRecord?.training_compliance_flag ? 'Compliant' : 'Flagged'}</strong></p></div></div>
                <div className="card p-5"><h3 className="card-title">Open Work Orders</h3><div className="mt-4 space-y-3">{detail.workOrders.length ? detail.workOrders.map(row => <div key={row.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-900">{row.id}</p><StatusBadge text={row.status} /></div><p className="mt-1 text-sm text-slate-600">{row.title}</p></div>) : <p className="text-sm text-slate-500">No work orders for this asset.</p>}</div></div>
                <div className="card p-5"><h3 className="card-title">Alerts</h3><div className="mt-4 space-y-3">{detail.alerts.length ? detail.alerts.map(row => <div key={row.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-900">{row.title}</p><StatusBadge text={row.severity} /></div><p className="mt-1 text-sm text-slate-600">{row.message}</p></div>) : <p className="text-sm text-slate-500">No alerts for this asset.</p>}</div></div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

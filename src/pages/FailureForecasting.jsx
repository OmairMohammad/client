import { AlertTriangle, ArrowRightCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function FailureForecasting() {
  const { currentUser } = useAuth();
  const [data, setData] = useState({ summary: {}, forecasts: [], watchlist: [] });
  const [selected, setSelected] = useState(null);
  const [siteFilter, setSiteFilter] = useState('All');

  useEffect(() => {
    let mounted = true;
    api.getForecasting(siteFilter === 'All' ? '' : siteFilter).then(result => {
      if (!mounted) return;
      setData(result);
      setSelected(prev => result.forecasts.find(item => item.assetId === prev?.assetId) || result.forecasts[0] || null);
    });
    return () => {
      mounted = false;
    };
  }, [siteFilter]);

  const sites = useMemo(() => ['All', ...new Set((data.forecasts || []).map(item => item.site))], [data.forecasts]);

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6 space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Predictive Failure Forecasting</h2>
              <p className="mt-1 text-sm text-slate-500">Portfolio watchlist with projected 30-day health decline, days-to-failure, and explainable degradation drivers.</p>
            </div>
            <select className="input max-w-[220px]" value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
              {sites.map(site => <option key={site}>{site}</option>)}
            </select>
          </div>

          <section className="grid gap-4 md:grid-cols-4">
            {[
              ['Monitored Assets', data.summary.monitoredAssets || 0],
              ['Critical Within 30 Days', data.summary.criticalWithin30Days || 0],
              ['Intervention Within 60 Days', data.summary.interventionWithin60Days || 0],
              ['Avg. 30-Day Decline', data.summary.avgProjectedDecline30d || 0],
            ].map(([label, value]) => (
              <div key={label} className="card p-5">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-3 text-3xl font-bold text-brand-600">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              {data.watchlist.map(item => (
                <button key={item.assetId} type="button" onClick={() => setSelected(item)} className={`card w-full p-5 text-left transition ${selected?.assetId === item.assetId ? 'border-brand-500 ring-2 ring-brand-100' : 'hover:border-slate-300'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{item.assetName}</h3>
                      <p className="mt-1 text-xs text-slate-500">{item.assetId} · {item.site}</p>
                    </div>
                    <StatusBadge text={item.projectedRisk30d} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <span className="text-xs text-slate-400 block">Days to Failure</span>
                      <span className="font-semibold text-slate-900">{item.daysToFailure}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <span className="text-xs text-slate-400 block">Projected 30-Day Health</span>
                      <span className="font-semibold text-slate-900">{item.projectedHealth30d}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{item.narrative}</p>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {!selected ? <div className="card p-6 text-sm text-slate-500">No forecasting data available.</div> : (
                <>
                  <div className="card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="card-title">Selected Asset Forecast</h3>
                        <p className="mt-1 text-sm text-slate-500">{selected.assetName} · {selected.assetId} · {selected.site}</p>
                      </div>
                      <StatusBadge text={selected.currentRisk} />
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                      {[['Current Health', selected.currentHealth], ['30-Day Health', selected.projectedHealth30d], ['Confidence', `${selected.confidence}%`], ['Degradation / Week', selected.degradationPerWeek]].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selected.weeklyProjection}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="score" name="Projected health" stroke="#cf2e2e" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card p-5">
                    <h3 className="card-title">Forecast Interpretation</h3>
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                        <p>{selected.narrative}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {selected.drivers.map(driver => (
                        <div key={driver} className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">{driver}</div>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link to={`/assets/${selected.assetId}`} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                        <ArrowRightCircle size={16} /> Open Asset Detail
                      </Link>
                      <Link to="/work-orders" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Create / review work orders
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function EnergyEmissions() {
  const { currentUser } = useAuth();
  const [data, setData] = useState({ summary: {}, siteBreakdown: [], topEmitters: [], efficiencyWatchlist: [], rows: [] });
  const [siteFilter, setSiteFilter] = useState('All');

  useEffect(() => {
    let mounted = true;
    api.getEnergyEmissions(siteFilter === 'All' ? '' : siteFilter).then(result => mounted && setData(result));
    return () => {
      mounted = false;
    };
  }, [siteFilter]);

  const sites = useMemo(() => ['All', ...new Set((data.rows || []).map(row => row.site))], [data.rows]);

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6 space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Energy & Emissions Dashboard</h2>
              <p className="mt-1 text-sm text-slate-500">Operational energy performance and emissions visibility aligned to the NGER-style compliance view already used by the platform.</p>
            </div>
            <select className="input max-w-[220px]" value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
              {sites.map(site => <option key={site}>{site}</option>)}
            </select>
          </div>

          <section className="grid gap-4 md:grid-cols-5">
            {[
              ['Assets Monitored', data.summary.monitoredAssets || 0],
              ['Compliant Assets', data.summary.compliantAssets || 0],
              ['Non-Compliant Assets', data.summary.nonCompliantAssets || 0],
              ['Total CO₂', data.summary.totalCO2 || 0],
              ['Avg Efficiency', `${data.summary.avgThermalEfficiency || 0}%`],
            ].map(([label, value]) => (
              <div key={label} className="card p-5">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-3 text-3xl font-bold text-brand-600">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="card p-5">
              <h3 className="card-title">CO₂ by Site</h3>
              <div className="mt-4 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.siteBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="site" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="co2" name="CO₂" fill="#cf2e2e" />
                    <Bar dataKey="avgEfficiency" name="Avg. efficiency" fill="#64748b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card p-5">
              <h3 className="card-title">Top Emitters</h3>
              <div className="mt-4 space-y-3">
                {data.topEmitters.map(row => (
                  <div key={row.asset_id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{row.asset_id} · {row.asset_name}</p>
                        <p className="text-xs text-slate-500">{row.site}</p>
                      </div>
                      <StatusBadge text={row.emission_compliant ? 'Approved' : 'Escalated'} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3"><span className="text-xs text-slate-400 block">CO₂</span><span className="font-semibold text-slate-900">{row.co2_emissions}</span></div>
                      <div className="rounded-xl bg-slate-50 p-3"><span className="text-xs text-slate-400 block">NOx</span><span className="font-semibold text-slate-900">{row.nox_level}</span></div>
                      <div className="rounded-xl bg-slate-50 p-3"><span className="text-xs text-slate-400 block">Efficiency</span><span className="font-semibold text-slate-900">{row.thermal_efficiency}%</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="card p-5 overflow-hidden">
              <h3 className="card-title">Efficiency Watchlist</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">Site</th>
                      <th className="px-4 py-3">Efficiency</th>
                      <th className="px-4 py-3">Risk</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.efficiencyWatchlist.map(row => (
                      <tr key={row.asset_id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.asset_id}</td>
                        <td className="px-4 py-3">{row.site}</td>
                        <td className="px-4 py-3">{row.thermal_efficiency}%</td>
                        <td className="px-4 py-3"><StatusBadge text={row.risk_level} /></td>
                        <td className="px-4 py-3">{row.recommended_action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card p-5 overflow-hidden">
              <h3 className="card-title">Full Energy Register</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">CO₂</th>
                      <th className="px-4 py-3">NOx</th>
                      <th className="px-4 py-3">Efficiency</th>
                      <th className="px-4 py-3">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.rows.map(row => (
                      <tr key={row.asset_id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{row.asset_id}</p>
                          <p className="text-xs text-slate-400">{row.site}</p>
                        </td>
                        <td className="px-4 py-3">{row.co2_emissions}</td>
                        <td className="px-4 py-3">{row.nox_level}</td>
                        <td className="px-4 py-3">{row.thermal_efficiency}%</td>
                        <td className="px-4 py-3"><StatusBadge text={row.emission_compliant ? 'Approved' : 'Escalated'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

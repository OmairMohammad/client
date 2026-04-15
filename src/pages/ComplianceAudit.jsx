import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function ComplianceAudit() {
  const { currentUser } = useAuth();
  const [data, setData] = useState({ summary: {}, standards: [], energy: [], training: [], audit: [], alerts: [] });
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('All');
  const [standardFilter, setStandardFilter] = useState('All');

  useEffect(() => {
    let mounted = true;
    api.getCompliance().then(result => mounted && setData(result));
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAudit = useMemo(() => data.audit.filter(row => {
    const query = search.toLowerCase();
    const matchSearch = !search || row.assetId?.toLowerCase().includes(query) || row.reviewer?.toLowerCase().includes(query) || row.comment?.toLowerCase().includes(query);
    const matchDecision = decisionFilter === 'All' || row.decision === decisionFilter;
    const matchStandard = standardFilter === 'All' || row.standard === standardFilter;
    return matchSearch && matchDecision && matchStandard;
  }), [data.audit, search, decisionFilter, standardFilter]);

  const standards = ['All', ...new Set(data.audit.map(row => row.standard))];

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Compliance & Audit</h2>
            <p className="mt-1 text-sm text-slate-500">Compliance standards, energy records, training flags, audit decisions, and backend-generated alerts.</p>
          </div>

          <section className="grid gap-4 md:grid-cols-5">
            {[
              ['Compliant Assets', data.summary.compliantAssets || 0],
              ['Non-Compliant Assets', data.summary.nonCompliantAssets || 0],
              ['Training Flags', data.summary.trainingFlags || 0],
              ['Open Audit Actions', data.summary.openAuditActions || 0],
              ['Open Alerts', data.summary.openAlerts || 0],
            ].map(([label, value]) => (
              <div key={label} className="card p-5">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-3 text-3xl font-bold text-brand-600">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="card p-5">
              <h3 className="card-title">Compliance Standards</h3>
              <div className="mt-4 space-y-3">
                {data.standards.map(row => (
                  <div key={row.standard_id || row.standard} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{row.standard}</p>
                      <StatusBadge text={row.mandatory ? 'Approved' : 'Pending Review'} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{row.requirement || row.description || 'Compliance requirement record available.'}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="card-title">Open Alerts</h3>
              <div className="mt-4 space-y-3">
                {data.alerts.slice(0, 8).map(alert => (
                  <div key={alert.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{alert.title}</p>
                        <p className="text-xs text-slate-500">{alert.asset_id} · {alert.site}</p>
                      </div>
                      <StatusBadge text={alert.severity} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="card p-5 overflow-hidden">
              <h3 className="card-title">Energy & Emissions Snapshot</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">CO₂</th>
                      <th className="px-4 py-3">NOx</th>
                      <th className="px-4 py-3">Efficiency</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.energy.slice(0, 12).map(row => (
                      <tr key={row.asset_id}>
                        <td className="px-4 py-3">{row.asset_id}</td>
                        <td className="px-4 py-3">{row.co2_emissions}</td>
                        <td className="px-4 py-3">{row.nox_level}</td>
                        <td className="px-4 py-3">{row.thermal_efficiency}%</td>
                        <td className="px-4 py-3"><StatusBadge text={String(row.emission_compliant).toLowerCase() === 'true' ? 'Approved' : 'Escalated'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card p-5 overflow-hidden">
              <h3 className="card-title">Training Compliance Snapshot</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">Certified</th>
                      <th className="px-4 py-3">Experience</th>
                      <th className="px-4 py-3">Fatigue</th>
                      <th className="px-4 py-3">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.training.slice(0, 12).map(row => (
                      <tr key={row.asset_id}>
                        <td className="px-4 py-3">{row.asset_id}</td>
                        <td className="px-4 py-3">{row.worker_certified ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3">{row.worker_experience_years} yrs</td>
                        <td className="px-4 py-3">{row.worker_fatigue}</td>
                        <td className="px-4 py-3"><StatusBadge text={row.training_compliance_flag ? 'Approved' : 'Escalated'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="card p-5 overflow-hidden">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="card-title">Audit Log</h3>
                <p className="muted">Search and filter human review decisions.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <input className="input min-w-[240px]" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search asset, reviewer, comment" />
                <select className="input min-w-[160px]" value={decisionFilter} onChange={e => setDecisionFilter(e.target.value)}>
                  {['All', 'Approved', 'Modified with Comment', 'Escalated'].map(item => <option key={item}>{item}</option>)}
                </select>
                <select className="input min-w-[160px]" value={standardFilter} onChange={e => setStandardFilter(e.target.value)}>
                  {standards.map(item => <option key={item}>{item}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Audit ID</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Reviewer</th>
                    <th className="px-4 py-3">Decision</th>
                    <th className="px-4 py-3">Standard</th>
                    <th className="px-4 py-3">Comment</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAudit.map(row => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.id}</td>
                      <td className="px-4 py-3">{row.assetId}</td>
                      <td className="px-4 py-3">{row.reviewer}</td>
                      <td className="px-4 py-3"><StatusBadge text={row.decision} /></td>
                      <td className="px-4 py-3">{row.standard}</td>
                      <td className="px-4 py-3">{row.comment}</td>
                      <td className="px-4 py-3 text-slate-500">{row.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

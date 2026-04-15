import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function FatigueTraining() {
  const { currentUser, sites } = useAuth();
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('All');
  const [fatigueFilter, setFatigueFilter] = useState('All');
  const [complianceFilter, setComplianceFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [trainingData, assetData] = await Promise.all([api.getTrainingCompliance(), api.getAssets()]);
    setRecords(trainingData);
    setAssets(assetData);
    if (!editing && trainingData[0]) {
      setEditing({ ...trainingData[0] });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const merged = useMemo(() => records.map(record => ({ ...record, assetName: assets.find(asset => asset.assetId === record.asset_id)?.assetName || record.asset_id })), [records, assets]);
  const filtered = useMemo(() => merged.filter(row => {
    const query = search.toLowerCase();
    const matchSearch = !search || row.asset_id.toLowerCase().includes(query) || row.assetName.toLowerCase().includes(query) || row.site.toLowerCase().includes(query);
    const matchSite = siteFilter === 'All' || row.site === siteFilter;
    const matchFatigue = fatigueFilter === 'All' || row.worker_fatigue === fatigueFilter;
    const compliantText = row.training_compliance_flag ? 'Compliant' : 'Flagged';
    const matchCompliance = complianceFilter === 'All' || compliantText === complianceFilter;
    return matchSearch && matchSite && matchFatigue && matchCompliance;
  }), [merged, search, siteFilter, fatigueFilter, complianceFilter]);

  const total = records.length;
  const compliantCount = records.filter(r => r.training_compliance_flag).length;
  const highFatigueCount = records.filter(r => r.worker_fatigue === 'High').length;
  const uncertifiedCount = records.filter(r => !r.worker_certified).length;

  const saveRecord = async e => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    await api.updateTrainingCompliance(editing.asset_id, {
      site: editing.site,
      worker_certified: !!editing.worker_certified,
      worker_experience_years: Number(editing.worker_experience_years),
      worker_fatigue: editing.worker_fatigue,
      training_compliance_flag: !!editing.training_compliance_flag,
    });
    await loadData();
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Fatigue & Training</h2>
            <p className="mt-1 text-sm text-slate-500">Persistent training records that now update both compliance data and asset operator risk fields.</p>
          </div>

          <section className="grid gap-4 md:grid-cols-4">
            {[
              ['Total Workers Assessed', total],
              ['Compliant Records', compliantCount],
              ['High Fatigue Flags', highFatigueCount],
              ['Uncertified Workers', uncertifiedCount],
            ].map(([label, value]) => (
              <div key={label} className="card p-5">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-3 text-3xl font-bold text-brand-600">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="card p-5 overflow-hidden">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="card-title">Training Compliance Register</h3>
                  <p className="muted mt-0.5">{total} workers across all sites.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input className="input min-w-[220px]" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search asset or site" />
                  <select className="input min-w-[160px]" value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
                    {['All', ...sites.map(site => site.name)].map(site => <option key={site}>{site}</option>)}
                  </select>
                  <select className="input min-w-[140px]" value={fatigueFilter} onChange={e => setFatigueFilter(e.target.value)}>
                    {['All', 'Low', 'Medium', 'High'].map(item => <option key={item}>{item}</option>)}
                  </select>
                  <select className="input min-w-[160px]" value={complianceFilter} onChange={e => setComplianceFilter(e.target.value)}>
                    {['All', 'Compliant', 'Flagged'].map(item => <option key={item}>{item}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">Site</th>
                      <th className="px-4 py-3">Certified</th>
                      <th className="px-4 py-3">Experience</th>
                      <th className="px-4 py-3">Fatigue</th>
                      <th className="px-4 py-3">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(row => (
                      <tr key={row.asset_id} className={`cursor-pointer ${editing?.asset_id === row.asset_id ? 'bg-brand-50' : ''}`} onClick={() => setEditing({ ...row })}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{row.assetName}</p>
                          <p className="text-xs text-slate-400">{row.asset_id}</p>
                        </td>
                        <td className="px-4 py-3">{row.site}</td>
                        <td className="px-4 py-3">{row.worker_certified ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3">{row.worker_experience_years} yrs</td>
                        <td className="px-4 py-3"><StatusBadge text={row.worker_fatigue} /></td>
                        <td className="px-4 py-3"><StatusBadge text={row.training_compliance_flag ? 'Approved' : 'Escalated'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <form onSubmit={saveRecord} className="card p-5 space-y-4">
              <h3 className="card-title">Update Training Record</h3>
              <div>
                <label className="label">Asset</label>
                <select className="input" value={editing?.asset_id || ''} onChange={e => setEditing(merged.find(row => row.asset_id === e.target.value) || null)}>
                  {merged.map(row => <option key={row.asset_id} value={row.asset_id}>{row.asset_id} – {row.assetName}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Site</label>
                <select className="input" value={editing?.site || ''} onChange={e => setEditing(prev => ({ ...prev, site: e.target.value }))}>
                  {sites.map(site => <option key={site.id} value={site.name}>{site.name}</option>)}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Certified</label>
                  <select className="input" value={editing?.worker_certified ? 'true' : 'false'} onChange={e => setEditing(prev => ({ ...prev, worker_certified: e.target.value === 'true' }))}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="label">Experience (years)</label>
                  <input className="input" type="number" min="0" value={editing?.worker_experience_years || 0} onChange={e => setEditing(prev => ({ ...prev, worker_experience_years: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Fatigue Level</label>
                  <select className="input" value={editing?.worker_fatigue || 'Low'} onChange={e => setEditing(prev => ({ ...prev, worker_fatigue: e.target.value }))}>
                    {['Low', 'Medium', 'High'].map(item => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Compliance Flag</label>
                  <select className="input" value={editing?.training_compliance_flag ? 'true' : 'false'} onChange={e => setEditing(prev => ({ ...prev, training_compliance_flag: e.target.value === 'true' }))}>
                    <option value="true">Compliant</option>
                    <option value="false">Flagged</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={!editing || saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
                {saving ? 'Saving…' : 'Save Training Record'}
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

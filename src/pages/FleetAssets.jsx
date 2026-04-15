import { Download, ExternalLink, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function FleetAssets() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getAssets().then(data => mounted && setAssets(data));
    return () => {
      mounted = false;
    };
  }, []);

  const types = useMemo(() => ['All', ...new Set(assets.map(a => a.assetType))], [assets]);
  const filtered = useMemo(() => assets.filter(a => {
    const query = search.toLowerCase();
    const matchSearch = !search || a.assetName.toLowerCase().includes(query) || a.assetId.toLowerCase().includes(query) || a.site.toLowerCase().includes(query);
    const matchType = typeFilter === 'All' || a.assetType === typeFilter;
    return matchSearch && matchType;
  }), [assets, search, typeFilter]);

  const handleExport = () => {
    const rows = filtered.map(a => [a.assetId, a.assetName, a.assetType, a.site, a.healthScore, a.riskLevel, a.recommendedAction, a.efficiencyScore, a.vibration, a.temperature, a.recentFaults, a.overdueDays].join(','));
    const csv = ['Asset ID,Name,Type,Site,Health,Risk,Action,Efficiency,Vibration,Temperature,Faults,Overdue Days', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fleet-assets.csv';
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
              <h2 className="text-2xl font-bold text-slate-900">Fleet Assets</h2>
              <p className="mt-1 text-sm text-slate-500">Detailed live asset profiles from the backend database. Click any card to expand full data.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, name, site…" className="border-none bg-transparent text-sm outline-none w-48" />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input min-w-[160px]">
                {types.map(t => <option key={t}>{t}</option>)}
              </select>
              <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {filtered.map(asset => (
              <div key={asset.assetId} className="card p-5">
                <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpanded(expanded === asset.assetId ? null : asset.assetId)}>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{asset.assetName}</h3>
                    <p className="mt-1 text-xs text-slate-500">{asset.assetId} · {asset.assetType} · {asset.manufacturer} {asset.model} · {asset.site}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge text={asset.riskLevel} />
                    <span className="text-slate-400 text-sm">{expanded === asset.assetId ? '▲' : '▼'}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[['Health Score', `${asset.healthScore}/100`], ['Efficiency', `${asset.efficiencyScore}%`], ['Action', asset.recommendedAction], ['Temperature', `${asset.temperature}°C`], ['Pressure', `${asset.pressure} bar`], ['Vibration', `${asset.vibration} mm/s`]].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-slate-50 p-3 text-sm">
                      <span className="text-slate-500 text-xs block">{k}</span>
                      <span className="font-semibold text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>

                {expanded === asset.assetId && (
                  <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[['Install Year', asset.installYear], ['Asset Age', `${asset.assetAge} yrs`], ['Operating Hours', `${asset.operatingHours.toLocaleString()} h`], ['Fault Events', asset.recentFaults], ['Overdue Days', asset.overdueDays], ['Criticality', asset.criticality], ['Bearing Temp', `${asset.bearingTemp}°C`], ['Water Hardness', asset.waterHardness > 0 ? `${asset.waterHardness} mg/L` : 'N/A'], ['Stack Temp', asset.stackTemp > 0 ? `${asset.stackTemp}°C` : 'N/A'], ['Worker Certified', asset.workerCertified ? 'Yes' : 'No'], ['Worker Fatigue', asset.workerFatigue], ['Experience', `${asset.workerExperience} yrs`], ['CO₂ Emissions', asset.co2Emissions > 0 ? `${asset.co2Emissions} kg/h` : 'N/A'], ['NOx Level', asset.noxLevel > 0 ? `${asset.noxLevel} mg/m³` : 'N/A'], ['Emission Compliant', asset.emissionCompliant ? 'Yes ✓' : 'No ✗']].map(([k, v]) => (
                        <div key={k} className="rounded-xl bg-slate-50 p-3 text-sm">
                          <span className="text-slate-400 text-xs block">{k}</span>
                          <span className="font-semibold text-slate-900">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Maintenance History</p>
                      <p className="mt-2 text-sm text-slate-700">{asset.maintenanceHistory}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Predicted Days to Failure</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{asset.prediction.daysToFailure} <span className="text-sm font-normal text-slate-500">days</span></p>
                      <p className="text-xs text-slate-400 mt-1">Model confidence: {asset.prediction.confidence}%</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => navigate(`/assets/${asset.assetId}`)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <ExternalLink size={15} /> Open Asset Detail
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operator Observation</p>
                  <p className="mt-2 text-sm text-slate-700">{asset.operatorObservation}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Reports() {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState({ totalAssets: 0, highRiskAssets: 0, approvedReviews: 0, openAlerts: 0, openWorkOrders: 0, siteBreakdown: [] });
  const [alerts, setAlerts] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.getReportSummary(), api.getAlerts({ status_filter: 'Open' }), api.getWorkOrders({ status_filter: 'Open' })]).then(([summaryData, alertsData, workOrdersData]) => {
      if (!mounted) return;
      setSummary(summaryData);
      setAlerts(alertsData);
      setWorkOrders(workOrdersData);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const exportCsv = () => {
    const rows = summary.siteBreakdown.map(row => `${row.site},${row.low},${row.medium},${row.high},${row.avgHealth}`);
    const csv = ['Site,Low Risk,Medium Risk,High Risk,Average Health', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-risk-summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const siteSummaryText = useMemo(() => summary.siteBreakdown.map(row => `${row.site}: ${row.high} high-risk assets`).join(' · '), [summary.siteBreakdown]);

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6 space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
              <p className="mt-1 text-sm text-slate-500">Management-ready reporting fed directly from backend assets, audit logs, alerts, and work orders.</p>
            </div>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">
              <Download size={16} /> Export Site Summary
            </button>
          </div>

          <section className="grid gap-4 md:grid-cols-5">
            {[
              ['Total Assets', summary.totalAssets],
              ['High Risk Assets', summary.highRiskAssets],
              ['Approved Reviews', summary.approvedReviews],
              ['Open Alerts', summary.openAlerts],
              ['Open Work Orders', summary.openWorkOrders],
            ].map(([label, value]) => (
              <div key={label} className="card p-5">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-3 text-3xl font-bold text-brand-600">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="card p-5 overflow-hidden">
              <h3 className="card-title">Site Breakdown</h3>
              <p className="muted mt-1">{siteSummaryText || 'No site summary available.'}</p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Site</th>
                      <th className="px-4 py-3">Low</th>
                      <th className="px-4 py-3">Medium</th>
                      <th className="px-4 py-3">High</th>
                      <th className="px-4 py-3">Avg Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.siteBreakdown.map(row => (
                      <tr key={row.site}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.site}</td>
                        <td className="px-4 py-3">{row.low}</td>
                        <td className="px-4 py-3">{row.medium}</td>
                        <td className="px-4 py-3">{row.high}</td>
                        <td className="px-4 py-3">{row.avgHealth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-5">
                <h3 className="card-title">Alert Highlights</h3>
                <div className="mt-4 space-y-3">
                  {alerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{alert.asset_id}</p>
                        <StatusBadge text={alert.severity} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{alert.title}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="card-title">Open Work Orders</h3>
                <div className="mt-4 space-y-3">
                  {workOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{order.id}</p>
                        <StatusBadge text={order.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{order.asset_id} · {order.title}</p>
                      <p className="text-xs text-slate-400">Due: {order.due_date || 'Not set'} · {order.assignee || 'Unassigned'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

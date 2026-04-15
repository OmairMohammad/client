import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const emptyMaintenance = { asset_id: '', service_date: '', service_type: 'Inspection', technician: '', downtime_hours: 0, notes: '', overdue_days_snapshot: 0 };
const emptyWorkOrder = { asset_id: '', title: '', description: '', priority: 'Medium', assignee: '', due_date: '' };

export default function MaintenanceLog() {
  const { currentUser, refreshAlerts } = useAuth();
  const [maintenance, setMaintenance] = useState([]);
  const [assets, setAssets] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [assetFilter, setAssetFilter] = useState('All');
  const [maintenanceForm, setMaintenanceForm] = useState(emptyMaintenance);
  const [workOrderForm, setWorkOrderForm] = useState(emptyWorkOrder);
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    const [maintenanceData, assetData, workOrderData, alertData] = await Promise.all([
      api.getMaintenance(),
      api.getAssets(),
      api.getWorkOrders({ status_filter: 'All' }),
      api.getAlerts({ status_filter: 'Open' }),
    ]);
    setMaintenance(maintenanceData);
    setAssets(assetData);
    setWorkOrders(workOrderData);
    setAlerts(alertData);
    const defaultAsset = assetData[0]?.assetId || '';
    setMaintenanceForm(prev => ({ ...prev, asset_id: prev.asset_id || defaultAsset }));
    setWorkOrderForm(prev => ({ ...prev, asset_id: prev.asset_id || defaultAsset }));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMaintenance = useMemo(() => maintenance.filter(row => {
    const query = search.toLowerCase();
    const matchSearch = !search || row.asset_id.toLowerCase().includes(query) || row.technician.toLowerCase().includes(query) || row.notes.toLowerCase().includes(query);
    const matchType = typeFilter === 'All' || row.service_type === typeFilter;
    const matchAsset = assetFilter === 'All' || row.asset_id === assetFilter;
    return matchSearch && matchType && matchAsset;
  }), [maintenance, search, typeFilter, assetFilter]);

  const serviceTypes = ['All', ...new Set(maintenance.map(row => row.service_type)), 'Inspection', 'Preventive Maintenance', 'Condition Review', 'Calibration', 'Cleaning'];
  const assetOptions = ['All', ...assets.map(asset => asset.assetId)];

  const submitMaintenance = async e => {
    e.preventDefault();
    await api.createMaintenance({ ...maintenanceForm, downtime_hours: Number(maintenanceForm.downtime_hours), overdue_days_snapshot: Number(maintenanceForm.overdue_days_snapshot) });
    setFeedback('Maintenance entry saved and linked to the backend.');
    setMaintenanceForm(prev => ({ ...emptyMaintenance, asset_id: prev.asset_id }));
    await Promise.all([loadData(), refreshAlerts({ status_filter: 'Open' })]);
  };

  const submitWorkOrder = async e => {
    e.preventDefault();
    await api.createWorkOrder(workOrderForm);
    setFeedback('Work order created successfully.');
    setWorkOrderForm(prev => ({ ...emptyWorkOrder, asset_id: prev.asset_id }));
    await Promise.all([loadData(), refreshAlerts({ status_filter: 'Open' })]);
  };

  const updateWorkOrderStatus = async (orderId, status) => {
    await api.updateWorkOrder(orderId, { status });
    setFeedback(`Work order ${orderId} moved to ${status}.`);
    await Promise.all([loadData(), refreshAlerts({ status_filter: 'Open' })]);
  };

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Maintenance Log</h2>
            <p className="mt-1 text-sm text-slate-500">Persistent maintenance history, real work orders, and backend-generated alert visibility.</p>
          </div>

          {feedback && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="card p-5 overflow-hidden">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="card-title">Maintenance History</h3>
                  <p className="muted">Persistent service records from the backend.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input className="input min-w-[220px]" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search asset or technician" />
                  <select className="input min-w-[160px]" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    {serviceTypes.filter((item, index, arr) => arr.indexOf(item) === index).map(item => <option key={item}>{item}</option>)}
                  </select>
                  <select className="input min-w-[160px]" value={assetFilter} onChange={e => setAssetFilter(e.target.value)}>
                    {assetOptions.map(item => <option key={item}>{item}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">History ID</th>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Technician</th>
                      <th className="px-4 py-3">Downtime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMaintenance.slice(0, 40).map(row => (
                      <tr key={row.history_id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.history_id}</td>
                        <td className="px-4 py-3">{row.asset_id}</td>
                        <td className="px-4 py-3">{row.service_date}</td>
                        <td className="px-4 py-3">{row.service_type}</td>
                        <td className="px-4 py-3">{row.technician}</td>
                        <td className="px-4 py-3">{row.downtime_hours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <form onSubmit={submitMaintenance} className="card p-5 space-y-4">
                <h3 className="card-title">Add Maintenance Entry</h3>
                <div>
                  <label className="label">Asset</label>
                  <select className="input" value={maintenanceForm.asset_id} onChange={e => setMaintenanceForm(prev => ({ ...prev, asset_id: e.target.value }))}>
                    {assets.map(asset => <option key={asset.assetId} value={asset.assetId}>{asset.assetId} – {asset.assetName}</option>)}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label">Service Date</label><input className="input" type="date" value={maintenanceForm.service_date} onChange={e => setMaintenanceForm(prev => ({ ...prev, service_date: e.target.value }))} required /></div>
                  <div><label className="label">Service Type</label><select className="input" value={maintenanceForm.service_type} onChange={e => setMaintenanceForm(prev => ({ ...prev, service_type: e.target.value }))}>{['Inspection', 'Preventive Maintenance', 'Condition Review', 'Calibration', 'Cleaning'].map(item => <option key={item}>{item}</option>)}</select></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label">Technician</label><input className="input" value={maintenanceForm.technician} onChange={e => setMaintenanceForm(prev => ({ ...prev, technician: e.target.value }))} required /></div>
                  <div><label className="label">Downtime Hours</label><input className="input" type="number" min="0" step="0.1" value={maintenanceForm.downtime_hours} onChange={e => setMaintenanceForm(prev => ({ ...prev, downtime_hours: e.target.value }))} /></div>
                </div>
                <div><label className="label">Notes</label><textarea className="input min-h-[96px]" value={maintenanceForm.notes} onChange={e => setMaintenanceForm(prev => ({ ...prev, notes: e.target.value }))} /></div>
                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">Save Maintenance Entry</button>
              </form>

              <div className="card p-5">
                <h3 className="card-title">Active Alerts</h3>
                <div className="mt-4 space-y-3">
                  {alerts.slice(0, 6).map(alert => (
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
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={submitWorkOrder} className="card p-5 space-y-4">
              <h3 className="card-title">Create Work Order</h3>
              <div>
                <label className="label">Asset</label>
                <select className="input" value={workOrderForm.asset_id} onChange={e => setWorkOrderForm(prev => ({ ...prev, asset_id: e.target.value }))}>
                  {assets.map(asset => <option key={asset.assetId} value={asset.assetId}>{asset.assetId} – {asset.assetName}</option>)}
                </select>
              </div>
              <div><label className="label">Title</label><input className="input" value={workOrderForm.title} onChange={e => setWorkOrderForm(prev => ({ ...prev, title: e.target.value }))} required /></div>
              <div><label className="label">Description</label><textarea className="input min-h-[90px]" value={workOrderForm.description} onChange={e => setWorkOrderForm(prev => ({ ...prev, description: e.target.value }))} /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="label">Priority</label><select className="input" value={workOrderForm.priority} onChange={e => setWorkOrderForm(prev => ({ ...prev, priority: e.target.value }))}>{['Low', 'Medium', 'High'].map(item => <option key={item}>{item}</option>)}</select></div>
                <div><label className="label">Assignee</label><input className="input" value={workOrderForm.assignee} onChange={e => setWorkOrderForm(prev => ({ ...prev, assignee: e.target.value }))} /></div>
                <div><label className="label">Due Date</label><input className="input" type="date" value={workOrderForm.due_date} onChange={e => setWorkOrderForm(prev => ({ ...prev, due_date: e.target.value }))} /></div>
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">Create Work Order</button>
            </form>

            <div className="card p-5 overflow-hidden">
              <h3 className="card-title">Work Orders</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workOrders.map(order => (
                      <tr key={order.id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{order.id}</td>
                        <td className="px-4 py-3">{order.asset_id}</td>
                        <td className="px-4 py-3">{order.title}</td>
                        <td className="px-4 py-3"><StatusBadge text={order.priority} /></td>
                        <td className="px-4 py-3"><StatusBadge text={order.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {order.status !== 'In Progress' && <button onClick={() => updateWorkOrderStatus(order.id, 'In Progress')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Start</button>}
                            {order.status !== 'Completed' && <button onClick={() => updateWorkOrderStatus(order.id, 'Completed')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Complete</button>}
                            {order.status !== 'Open' && order.status !== 'Completed' && <button onClick={() => updateWorkOrderStatus(order.id, 'Open')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Reopen</button>}
                          </div>
                        </td>
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

import { ExternalLink, PlusCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const emptyForm = {
  asset_id: '',
  title: '',
  description: '',
  priority: 'Medium',
  status: 'Open',
  assignee: '',
  due_date: '',
  source: 'manual',
};

export default function WorkOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState('All');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [nextOrders, nextAssets] = await Promise.all([api.getWorkOrders(statusFilter === 'All' ? {} : { status_filter: statusFilter }), api.getAssets()]);
    setOrders(nextOrders);
    setAssets(nextAssets);
    const defaultAsset = nextAssets[0]?.assetId || '';
    setSelected(prev => nextOrders.find(order => order.id === prev?.id) || nextOrders[0] || null);
    setForm(prev => ({ ...prev, asset_id: prev.asset_id || defaultAsset }));
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const metrics = useMemo(() => {
    const total = orders.length;
    const open = orders.filter(order => order.status === 'Open').length;
    const inProgress = orders.filter(order => order.status === 'In Progress').length;
    const completed = orders.filter(order => order.status === 'Completed').length;
    const overdue = orders.filter(order => order.status !== 'Completed' && order.due_date && new Date(order.due_date) < new Date()).length;
    return { total, open, inProgress, completed, overdue };
  }, [orders]);

  const createOrder = async e => {
    e.preventDefault();
    setSaving(true);
    await api.createWorkOrder(form);
    setForm(prev => ({ ...emptyForm, asset_id: prev.asset_id }));
    await load();
    setSaving(false);
  };

  const updateOrder = async updates => {
    if (!selected) return;
    setSaving(true);
    await api.updateWorkOrder(selected.id, updates);
    await load();
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6 space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Work Order Management</h2>
              <p className="mt-1 text-sm text-slate-500">Close the loop from recommendation to execution with persistent maintenance work orders.</p>
            </div>
            <select className="input max-w-[220px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {['All', 'Open', 'In Progress', 'Completed'].map(item => <option key={item}>{item}</option>)}
            </select>
          </div>

          <section className="grid gap-4 md:grid-cols-5">
            {[
              ['Total Orders', metrics.total],
              ['Open', metrics.open],
              ['In Progress', metrics.inProgress],
              ['Completed', metrics.completed],
              ['Overdue', metrics.overdue],
            ].map(([label, value]) => (
              <div key={label} className="card p-5">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-3 text-3xl font-bold text-brand-600">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <div className="card p-5 overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="card-title">Active Work Orders</h3>
                  <p className="muted">Select a work order to update status, ownership, or due date.</p>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Assignee</th>
                      <th className="px-4 py-3">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(order => (
                      <tr key={order.id} className={`cursor-pointer ${selected?.id === order.id ? 'bg-brand-50' : ''}`} onClick={() => setSelected(order)}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{order.id}</p>
                          <p className="text-xs text-slate-400">{order.title}</p>
                        </td>
                        <td className="px-4 py-3">{order.asset_id}</td>
                        <td className="px-4 py-3"><StatusBadge text={order.priority} /></td>
                        <td className="px-4 py-3"><StatusBadge text={order.status} /></td>
                        <td className="px-4 py-3">{order.assignee || 'Unassigned'}</td>
                        <td className="px-4 py-3">{order.due_date || 'TBD'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <form onSubmit={createOrder} className="card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-600"><PlusCircle size={18} /></div>
                  <div>
                    <h3 className="card-title">Create Work Order</h3>
                    <p className="muted">Turn a recommendation into a tracked maintenance action.</p>
                  </div>
                </div>
                <div>
                  <label className="label">Asset</label>
                  <select className="input" value={form.asset_id} onChange={e => setForm(prev => ({ ...prev, asset_id: e.target.value }))}>
                    {assets.map(asset => <option key={asset.assetId} value={asset.assetId}>{asset.assetId} – {asset.assetName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Title</label>
                  <input className="input" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Example: Bearing inspection and vibration review" />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input min-h-[110px] resize-none" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the work to be completed and why." />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Priority</label>
                    <select className="input" value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}>
                      {['Low', 'Medium', 'High', 'Critical'].map(item => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Due date</label>
                    <input className="input" type="date" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Assignee</label>
                  <input className="input" value={form.assignee} onChange={e => setForm(prev => ({ ...prev, assignee: e.target.value }))} placeholder="Technician or owner" />
                </div>
                <button type="submit" disabled={saving || !form.asset_id || !form.title.trim()} className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? 'Saving…' : 'Create work order'}
                </button>
              </form>

              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="card-title">Selected Work Order</h3>
                    <p className="muted">Update the currently selected work order.</p>
                  </div>
                  {selected?.asset_id ? <Link to={`/assets/${selected.asset_id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600"><ExternalLink size={14} /> Asset</Link> : null}
                </div>
                {!selected ? <p className="text-sm text-slate-500">Select a work order from the table.</p> : (
                  <>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">{selected.id} · {selected.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{selected.description || 'No description provided.'}</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <button onClick={() => updateOrder({ status: 'In Progress' })} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Move to In Progress</button>
                      <button onClick={() => updateOrder({ status: 'Completed' })} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Mark Completed</button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label">Reassign</label>
                        <input className="input" defaultValue={selected.assignee || ''} onBlur={e => e.target.value !== selected.assignee && updateOrder({ assignee: e.target.value })} placeholder="Owner" />
                      </div>
                      <div>
                        <label className="label">Update due date</label>
                        <input className="input" type="date" defaultValue={selected.due_date || ''} onBlur={e => e.target.value !== selected.due_date && updateOrder({ due_date: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

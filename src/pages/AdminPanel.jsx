import { RefreshCcw, ShieldCheck, UserRoundCog } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const PRIMARY_ADMIN_ID = 'USR-ADMIN-001';

export default function AdminPanel() {
  const { currentUser, users, roleOptions, approveUser, assignRole, toggleUserActive, refreshUsers, resetDemoData } = useAuth();
  const [pendingRoleSelections, setPendingRoleSelections] = useState({});
  const [feedback, setFeedback] = useState(null);

  const pending = useMemo(() => users.filter(u => !u.approved), [users]);
  const approved = useMemo(() => users.filter(u => u.approved), [users]);

  useEffect(() => {
    refreshUsers('Admin');
  }, []);

  useEffect(() => {
    setPendingRoleSelections(prev => {
      const next = { ...prev };
      pending.forEach(user => {
        if (!next[user.id]) next[user.id] = user.role === 'Pending Approval' ? user.desiredRole : user.role;
      });
      Object.keys(next).forEach(id => {
        if (!pending.some(user => user.id === id)) delete next[id];
      });
      return next;
    });
  }, [pending]);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const handleResetDemo = async () => {
    const result = await resetDemoData();
    showFeedback(result.ok ? 'success' : 'error', result.message);
  };

  const handlePendingRoleChange = async (userId, role) => {
    setPendingRoleSelections(prev => ({ ...prev, [userId]: role }));
    const result = await assignRole(userId, role);
    if (!result.ok) showFeedback('error', result.message);
  };

  const handleApprove = async user => {
    const selectedRole = pendingRoleSelections[user.id] || user.role || user.desiredRole || 'Engineer / Operator';
    const finalRole = selectedRole === 'Pending Approval' ? 'Engineer / Operator' : selectedRole;
    const result = await approveUser(user.id, finalRole);
    showFeedback(result.ok ? 'success' : 'error', result.ok ? `${user.name} approved as ${finalRole}.` : result.message);
  };

  const handleRoleUpdate = async (userId, role) => {
    const result = await assignRole(userId, role);
    showFeedback(result.ok ? 'success' : 'error', result.ok ? 'Role updated successfully.' : result.message);
  };

  const handleToggleActive = async user => {
    const result = await toggleUserActive(user.id);
    showFeedback(result.ok ? 'success' : 'error', result.ok ? `${user.name} has been ${user.isActive ? 'deactivated' : 'reactivated'}.` : result.message);
  };

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
              <p className="mt-1 text-sm text-slate-500">Approve requests, assign roles, and manage all user accounts with server-side security enforced.</p>
            </div>
            <button onClick={handleResetDemo} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <RefreshCcw size={16} /> Reset Demo Data
            </button>
          </div>

          {feedback && <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{feedback.message}</div>}

          <section className="grid gap-4 md:grid-cols-3">
            {[['Total Users', users.length, 'text-brand-600'], ['Approved Accounts', approved.length, 'text-emerald-600'], ['Pending Approval', pending.length, 'text-amber-600']].map(([label, val, colorClass]) => (
              <div key={label} className="card p-5">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className={`mt-3 text-3xl font-bold ${colorClass}`}>{val}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-brand-600" />
                <div>
                  <h3 className="card-title">Pending Requests</h3>
                  <p className="muted">Approve and assign roles for access.</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {pending.length === 0 ? <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No pending requests.</div> : pending.map(user => (
                  <div key={user.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email} · {user.site}</p>
                        <p className="mt-1 text-xs text-slate-500">Requested: {user.desiredRole}</p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{user.notes || 'No justification provided.'}</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <select value={pendingRoleSelections[user.id] || user.desiredRole || 'Engineer / Operator'} onChange={e => handlePendingRoleChange(user.id, e.target.value)} className="input text-xs py-2">
                        {roleOptions.map(r => <option key={r}>{r}</option>)}
                      </select>
                      <button onClick={() => handleApprove(user)} className="whitespace-nowrap rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700">Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3">
                <UserRoundCog size={18} className="text-brand-600" />
                <div>
                  <h3 className="card-title">User & Role Management</h3>
                  <p className="muted">Full control over roles and account status.</p>
                </div>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => {
                      const isProtectedAdmin = user.id === PRIMARY_ADMIN_ID;
                      return (
                        <tr key={user.id}>
                          <td className="px-4 py-3"><p className="font-semibold text-slate-900">{user.name}</p><p className="text-xs text-slate-400">{user.email}</p></td>
                          <td className="px-4 py-3"><select value={user.role} onChange={e => handleRoleUpdate(user.id, e.target.value)} disabled={isProtectedAdmin} className="input min-w-[160px] py-2 text-xs disabled:cursor-not-allowed disabled:bg-slate-100">{roleOptions.map(r => <option key={r}>{r}</option>)}</select></td>
                          <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{user.approved ? (user.isActive ? 'Active' : 'Inactive') : 'Pending'}</span></td>
                          <td className="px-4 py-3"><div className="flex flex-wrap gap-2">{!user.approved && <button onClick={() => handleApprove(user)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Approve</button>}<button onClick={() => handleToggleActive(user)} disabled={isProtectedAdmin} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">{isProtectedAdmin ? 'Protected' : user.isActive ? 'Deactivate' : 'Reactivate'}</button></div></td>
                        </tr>
                      );
                    })}
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

import { Bell, LogOut, Search, Shield } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/obrien-logo.svg';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const { logout, notifications, markNotifRead } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [search, setSearch] = useState('');
  const unread = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="relative z-50 flex flex-col gap-4 border-b border-slate-300 bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <img src={logo} alt="O'Brien Energy" className="h-12 w-auto rounded-xl border border-slate-200 bg-white p-1" />
        <div>
          <h1 className="text-lg font-bold text-black">Industrial Decision Intelligence Platform</h1>
          <p className="text-sm text-slate-600">O&apos;Brien Energy – Explainable Maintenance Decision Support</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="w-40 border-none bg-transparent text-sm text-bodytext outline-none" placeholder="Search asset or site" />
        </div>

        <div className="relative">
          <button onClick={() => setShowNotif(p => !p)} className="relative inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white p-3 text-slate-600 transition hover:bg-slate-50">
            <Bell size={18} />
            {unread > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">{unread}</span>}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white shadow-soft">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</div>
              ) : (
                notifications.slice(0, 6).map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotifRead(n.id);
                      setShowNotif(false);
                    }}
                    className={`cursor-pointer border-b border-slate-100 px-4 py-3 text-sm hover:bg-slate-50 ${n.read ? 'text-slate-500' : 'font-medium text-slate-900'}`}
                  >
                    <p>{n.msg}</p>
                    <p className="mt-1 text-xs text-slate-400">{n.time}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-300 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-black">{user?.name}</p>
            {user?.role === 'Admin' ? <Shield size={14} className="text-brand-600" /> : null}
          </div>
          <p className="text-xs text-slate-600">{user?.role} • {user?.site}</p>
        </div>

        <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </header>
  );
}

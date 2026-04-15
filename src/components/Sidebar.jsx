import { BarChart3, Bot, BriefcaseBusiness, ClipboardList, FileSpreadsheet, FolderKanban, Gauge, LineChart, Settings, ShieldCheck, Users, UserCheck, Wrench, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ user }) {
  const isAdmin = user?.role === 'Admin';

  const allItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Gauge, adminOnly: true },
    { name: 'Fleet Assets', path: '/fleet-assets', icon: ClipboardList, adminOnly: true },
    { name: 'Admin Panel', path: '/admin', icon: Users, adminOnly: true },
    { name: 'Recommendations', path: '/recommendations', icon: FolderKanban, adminOnly: false },
    { name: 'Compliance & Audit', path: '/compliance', icon: ShieldCheck, adminOnly: false },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet, adminOnly: false },
    { name: 'Transition Comparison', path: '/transition', icon: BarChart3, adminOnly: false },
    { name: 'Fatigue & Training', path: '/fatigue-training', icon: UserCheck, adminOnly: false },
    { name: 'Maintenance Log', path: '/maintenance-log', icon: Wrench, adminOnly: false },
    { name: 'Work Orders', path: '/work-orders', icon: BriefcaseBusiness, adminOnly: false },
    { name: 'Failure Forecasting', path: '/failure-forecasting', icon: Zap, adminOnly: false },
    { name: 'Energy & Emissions', path: '/energy-emissions', icon: BarChart3, adminOnly: false },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot, adminOnly: false },
    { name: 'Benchmark Models', path: '/benchmark-models', icon: LineChart, adminOnly: false },
    { name: 'Settings', path: '/settings', icon: Settings, adminOnly: false },
  ];

  const items = allItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="min-h-full border-r border-slate-200 bg-white px-4 py-6">
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Navigation</p>
      <nav className="mt-4 space-y-1">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition ${isActive ? 'border-l-4 border-brand-600 bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-8 px-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">Signed in as</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate">{user?.role}</p>
          <p className="text-xs text-slate-400 truncate mt-1">{user?.site}</p>
        </div>
      </div>
    </aside>
  );
}

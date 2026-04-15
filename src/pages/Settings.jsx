import { Bell, Lock, MonitorCog, Save, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { id: 'profile', label: 'Profile', icon: UserCog },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'display', label: 'Display', icon: MonitorCog },
  { id: 'security', label: 'Security', icon: Lock },
];

export default function Settings() {
  const { currentUser, preferences, sites, updateProfile, updatePreferenceSettings, changePassword } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState('');
  const [profile, setProfile] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', site: currentUser?.site || '', role: currentUser?.role || '' });
  const [notifSettings, setNotifSettings] = useState({ highRiskAlerts: true, maintenanceDue: true, auditUpdates: false, weeklyDigest: true, escalationAlerts: true });
  const [display, setDisplay] = useState({ compactView: false, showPredictions: true, showConfidence: true, showAnomaly: true, defaultRiskFilter: 'All', defaultSite: currentUser?.site || '' });
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    setProfile({ name: currentUser?.name || '', email: currentUser?.email || '', site: currentUser?.site || '', role: currentUser?.role || '' });
  }, [currentUser]);

  useEffect(() => {
    if (preferences) {
      setNotifSettings({
        highRiskAlerts: preferences.highRiskAlerts,
        maintenanceDue: preferences.maintenanceDue,
        auditUpdates: preferences.auditUpdates,
        weeklyDigest: preferences.weeklyDigest,
        escalationAlerts: preferences.escalationAlerts,
      });
      setDisplay({
        compactView: preferences.compactView,
        showPredictions: preferences.showPredictions,
        showConfidence: preferences.showConfidence,
        showAnomaly: preferences.showAnomaly,
        defaultRiskFilter: preferences.defaultRiskFilter,
        defaultSite: preferences.defaultSite || currentUser?.site || '',
      });
    }
  }, [preferences, currentUser]);

  const flashSaved = label => {
    setSaved(label);
    setTimeout(() => setSaved(''), 2400);
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile({ name: profile.name, site: profile.site });
    if (result.ok) flashSaved('Profile');
  };

  const handleSaveNotifications = async () => {
    const result = await updatePreferenceSettings(notifSettings);
    if (result.ok) flashSaved('Notifications');
  };

  const handleSaveDisplay = async () => {
    const result = await updatePreferenceSettings(display);
    if (result.ok) flashSaved('Display');
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    setPwError('');
    if (!pw.current_password || !pw.new_password || !pw.confirm) {
      setPwError('Please complete all password fields.');
      return;
    }
    if (pw.new_password !== pw.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pw.new_password.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    const result = await changePassword({ current_password: pw.current_password, new_password: pw.new_password });
    if (!result.ok) {
      setPwError(result.message);
      return;
    }
    setPw({ current_password: '', new_password: '', confirm: '' });
    flashSaved('Password');
  };

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Profile, notification, display, and password settings now persist through the backend.</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
            <nav className="card p-3 h-fit">
              {tabs.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition ${tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <Icon size={16} />{t.label}
                  </button>
                );
              })}
            </nav>

            <div>
              {tab === 'profile' && (
                <div className="card p-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-900">Profile Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className="label">Full Name</label><input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input" /></div>
                    <div><label className="label">Email</label><input value={profile.email} disabled className="input bg-slate-50 text-slate-400 cursor-not-allowed" /></div>
                    <div><label className="label">Assigned Site</label><select value={profile.site} onChange={e => setProfile(p => ({ ...p, site: e.target.value }))} className="input">{sites.map(site => <option key={site.id} value={site.name}>{site.name}</option>)}</select></div>
                    <div><label className="label">Role</label><input value={profile.role} disabled className="input bg-slate-50 text-slate-400 cursor-not-allowed" /></div>
                  </div>
                  {saved === 'Profile' && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✓ Profile settings saved.</div>}
                  <button onClick={handleSaveProfile} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"><Save size={15} /> Save Profile</button>
                </div>
              )}

              {tab === 'notifications' && (
                <div className="card p-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'highRiskAlerts', label: 'High Risk Asset Alerts', desc: 'Notify when an asset reaches High risk level.' },
                      { key: 'maintenanceDue', label: 'Maintenance Due Reminders', desc: 'Notify when maintenance becomes overdue.' },
                      { key: 'auditUpdates', label: 'Audit Log Updates', desc: 'Notify when a new decision is recorded in the audit log.' },
                      { key: 'weeklyDigest', label: 'Weekly Fleet Digest', desc: 'Receive a weekly summary of fleet health and open recommendations.' },
                      { key: 'escalationAlerts', label: 'Escalation Alerts', desc: 'Notify when any asset is escalated for manager review.' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                        </div>
                        <button onClick={() => setNotifSettings(p => ({ ...p, [key]: !p[key] }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notifSettings[key] ? 'bg-brand-600' : 'bg-slate-200'}`}>
                          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${notifSettings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {saved === 'Notifications' && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✓ Notification preferences saved.</div>}
                  <button onClick={handleSaveNotifications} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"><Save size={15} /> Save Preferences</button>
                </div>
              )}

              {tab === 'display' && (
                <div className="card p-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-900">Display Settings</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'showPredictions', label: 'Show Failure Predictions', desc: 'Display AI days-to-failure predictions on asset cards.' },
                      { key: 'showConfidence', label: 'Show AI Confidence Scores', desc: 'Display model confidence percentage on recommendations.' },
                      { key: 'showAnomaly', label: 'Show Anomaly Indicators', desc: 'Display anomaly detection level on all asset views.' },
                      { key: 'compactView', label: 'Compact Asset Cards', desc: 'Use condensed layout for asset lists and recommendation cards.' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                        </div>
                        <button onClick={() => setDisplay(p => ({ ...p, [key]: !p[key] }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${display[key] ? 'bg-brand-600' : 'bg-slate-200'}`}>
                          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${display[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                    <div><label className="label">Default Risk Filter</label><select value={display.defaultRiskFilter} onChange={e => setDisplay(p => ({ ...p, defaultRiskFilter: e.target.value }))} className="input max-w-xs">{['All', 'High', 'Medium', 'Low'].map(r => <option key={r}>{r}</option>)}</select></div>
                    <div><label className="label">Default Site</label><select value={display.defaultSite} onChange={e => setDisplay(p => ({ ...p, defaultSite: e.target.value }))} className="input max-w-xs">{sites.map(site => <option key={site.id} value={site.name}>{site.name}</option>)}</select></div>
                  </div>
                  {saved === 'Display' && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✓ Display settings saved.</div>}
                  <button onClick={handleSaveDisplay} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"><Save size={15} /> Save Display Settings</button>
                </div>
              )}

              {tab === 'security' && (
                <div className="card p-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-900">Security</h3>
                  <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Signed in as</p>
                    <p className="mt-1">{currentUser?.name} · {currentUser?.email}</p>
                    <p className="text-xs text-slate-400 mt-1">Role: {currentUser?.role} · Site: {currentUser?.site}</p>
                  </div>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Change Password</h4>
                    <div><label className="label">Current Password</label><input type="password" value={pw.current_password} onChange={e => setPw(p => ({ ...p, current_password: e.target.value }))} className="input max-w-md" /></div>
                    <div><label className="label">New Password</label><input type="password" value={pw.new_password} onChange={e => setPw(p => ({ ...p, new_password: e.target.value }))} className="input max-w-md" /></div>
                    <div><label className="label">Confirm New Password</label><input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} className="input max-w-md" /></div>
                    {pwError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pwError}</div>}
                    {saved === 'Password' && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✓ Password updated successfully.</div>}
                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"><Lock size={15} /> Update Password</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

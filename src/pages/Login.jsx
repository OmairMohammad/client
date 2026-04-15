import { ArrowRight, Eye, EyeOff, ServerCrash, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import logo from '../assets/obrien-logo.svg';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, currentUser, apiOnline } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demos = useMemo(
    () => [
      { label: 'Admin (Full Access)', email: 'admin@obrienenergy.com.au', password: 'Admin123!', badge: 'Admin' },
      { label: 'Engineer / Operator', email: 'ali.ahmad@obrienenergy.com.au', password: 'User123!', badge: 'Engineer' },
      { label: 'Maintenance Planner', email: 'planner@obrienenergy.com.au', password: 'User123!', badge: 'Planner' },
      { label: 'Executive', email: 'executive@obrienenergy.com.au', password: 'User123!', badge: 'Executive' },
      { label: 'Regulator / Auditor', email: 'auditor@obrienenergy.com.au', password: 'User123!', badge: 'Auditor' },
      { label: 'Sustainability Lead', email: 'transition@obrienenergy.com.au', password: 'User123!', badge: 'Transition' },
    ],
    [],
  );

  if (currentUser) return <Navigate to={currentUser.role === 'Admin' ? '/dashboard' : '/recommendations'} replace />;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate(result.role === 'Admin' ? '/dashboard' : '/recommendations');
  };

  return (
    <div className="grid min-h-screen bg-[#f3f3f3] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-brand-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.08),rgba(255,255,255,0.02))]" />
        <div className="relative">
          <div className="inline-flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg">
            <img src={logo} alt="O'Brien Energy" className="h-10 w-auto" />
          </div>
        </div>
        <div className="relative max-w-xl">
          <span className="inline-flex rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            IDI PLATFORM · TEAM 26
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white">
            Explainable maintenance decisions for boilers, burners, pumps, and thermal assets.
          </h1>
          <p className="mt-4 text-base leading-7 text-white/90">
            AI-assisted, human-reviewed, audit-ready decision support for O&apos;Brien Energy&apos;s industrial fleet.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              'Human-in-the-loop review',
              'Audit-ready decision logging',
              'Rules-based explainable AI',
              'Role-based access control',
            ].map(item => (
              <div key={item} className="rounded-2xl border border-white/20 bg-black/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-white" />
                  <p className="text-sm text-white">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-white/85">O&apos;Brien Energy · Capstone 2026 · Team 26 · MBIS5015</p>
      </section>

      <section className="flex items-center justify-center bg-[#f3f3f3] px-6 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black">Sign in</h2>
            <p className="mt-2 text-sm text-slate-600">Access the maintenance decision-support dashboard.</p>
          </div>

          {!apiOnline && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <div className="flex items-start gap-2">
                <ServerCrash size={18} className="mt-0.5 shrink-0" />
                <div>
                  Backend API is not running. Start the FastAPI server first, then sign in.
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Demo Accounts</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {demos.map(d => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => {
                    setError('');
                    setForm({ email: d.email, password: d.password });
                  }}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs transition hover:bg-brand-50"
                >
                  <span className="font-medium text-slate-800">{d.badge}</span>
                  <span className="text-slate-400">Use demo</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Work email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="name@obrienenergy.com.au"
                className="input"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-4 py-3 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full border-none bg-transparent text-sm text-slate-800 outline-none"
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="ml-3 text-slate-500 hover:text-slate-700">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !apiOnline}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Need an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-600">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

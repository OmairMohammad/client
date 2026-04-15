import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import logo from '../assets/obrien-logo.svg';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup, currentUser, sites, roleOptions } = useAuth();
  const selectableRoles = roleOptions.filter(r => r !== 'Admin' && r !== 'Pending Approval');
  const [form, setForm] = useState({ name: '', email: '', desiredRole: '', site: '', password: '', confirmPassword: '', notes: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!form.site && sites.length) {
      setForm(prev => ({ ...prev, site: sites[0].name }));
    }
  }, [sites, form.site]);

  if (currentUser) return <Navigate to="/recommendations" replace />;

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!form.name || !form.email || !form.desiredRole || !form.password || !form.site) {
      setError('Please complete all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const result = await signup(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessage(result.message);
    setForm({ name: '', email: '', desiredRole: '', site: sites[0]?.name || '', password: '', confirmPassword: '', notes: '' });
  };

  return (
    <div className="grid min-h-screen bg-[#f3f3f3] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-brand-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.08),rgba(255,255,255,0.02))]" />
        <div className="relative inline-flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg">
          <img src={logo} alt="O'Brien Energy" className="h-10 w-auto" />
        </div>
        <div className="relative max-w-xl">
          <span className="inline-flex rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">IDI PLATFORM · REQUEST ACCESS</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white">Create a secure access request for the O'Brien Energy IDI platform.</h1>
          <p className="mt-4 text-base leading-7 text-white/90">Accounts are reviewed by an Admin before activation. Passwords are now stored securely and roles are enforced server-side.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {['Server-side role checks', 'Secure password hashing', 'Persistent training and maintenance data', 'Audit-ready decision controls'].map(item => (
              <div key={item} className="rounded-2xl border border-white/20 bg-black/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-white" />
                  <p className="text-sm text-white">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-white/85">O'Brien Energy · Capstone 2026 · Team 26 · MBIS5015</p>
      </section>

      <section className="flex items-center justify-center bg-[#f3f3f3] px-6 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"><ArrowLeft size={16} /> Back to sign in</Link>
          <div className="mb-8 mt-4">
            <h2 className="text-2xl font-bold text-black">Request access</h2>
            <p className="mt-2 text-sm text-slate-600">Submit your details for admin approval.</p>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Full name</label><input name="name" value={form.name} onChange={handleChange} className="input" /></div>
            <div><label className="label">Work email</label><input name="email" type="email" value={form.email} onChange={handleChange} className="input" /></div>
            <div><label className="label">Desired role</label><select name="desiredRole" value={form.desiredRole} onChange={handleChange} className="input"><option value="">Select role</option>{selectableRoles.map(role => <option key={role}>{role}</option>)}</select></div>
            <div><label className="label">Site</label><select name="site" value={form.site} onChange={handleChange} className="input">{sites.map(site => <option key={site.id} value={site.name}>{site.name}</option>)}</select></div>
            <div><label className="label">Password</label><input name="password" type="password" value={form.password} onChange={handleChange} className="input" /></div>
            <div><label className="label">Confirm password</label><input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="input" /></div>
            <div><label className="label">Access justification</label><textarea name="notes" value={form.notes} onChange={handleChange} className="input min-h-[90px]" /></div>
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">Submit Request <ArrowRight size={16} /></button>
          </form>
        </div>
      </section>
    </div>
  );
}

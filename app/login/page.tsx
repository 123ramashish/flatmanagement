'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Home, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', loginAs: 'user' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Login failed'); return; }
      toast.success(`Welcome back, ${data.name}!`);
      router.push('/work');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4">
            <Home size={28} className="text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">FlatWork</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to manage your flat</p>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-xl">
          {/* Toggle */}
          <div className="flex bg-surface-elevated rounded-xl p-1 mb-6">
            {['user', 'flat'].map(type => (
              <button
                key={type}
                onClick={() => setForm(f => ({ ...f, loginAs: type }))}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                  form.loginAs === type
                    ? 'bg-brand-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'flat' ? 'Flat Admin' : 'Member'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                className="input-field text-black"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                className="input-field text-black"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-2" disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <LogIn size={16} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <a href="/work"> Work Page</a>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          New flat?{' '}
          <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium">
            Register your flat
          </Link>
        </p>
        {/* <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-brand-400">
  Forgot password?
</Link> */}
      </div>
    </div>
  );
}

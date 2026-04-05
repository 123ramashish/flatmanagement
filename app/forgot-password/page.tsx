// app/forgot-password/page.tsx
// ─────────────────────────────────────
// Drop this file into:  app/forgot-password/page.tsx
// Also add a link on your login page:
//   <Link href="/forgot-password">Forgot password?</Link>
// ─────────────────────────────────────

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSent(true);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative">

        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to login
        </Link>

        {/* Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-7 shadow-2xl">

          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/25 mb-5 mx-auto">
            <Mail size={26} className="text-brand-400" />
          </div>

          {!sent ? (
            <>
              <h1 className="text-xl font-bold text-white text-center mb-1">Forgot your password?</h1>
              <p className="text-slate-400 text-sm text-center mb-7 leading-relaxed">
                Enter your account email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field pl-9"
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
                    <p className="text-red-300 text-sm leading-snug">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p className="text-center text-slate-500 text-xs mt-6 leading-relaxed">
                Works for both flat admins and members.
                <br />The link will expire in <span className="text-slate-400">1 hour</span>.
              </p>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-500/15 border border-brand-500/30 mx-auto mb-5">
                <CheckCircle size={30} className="text-brand-400" />
              </div>

              <h2 className="text-lg font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-2">
                If <span className="text-white font-medium">{email}</span> is registered, you'll
                receive a password reset link shortly.
              </p>
              <p className="text-slate-500 text-xs mb-7">
                Don't see it? Check your spam or junk folder.
              </p>

              {/* Resend */}
              <button
                onClick={() => { setSent(false); setError(''); }}
                className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors underline underline-offset-2"
              >
                Try a different email
              </button>

              <div className="border-t border-surface-border mt-6 pt-5">
                <Link
                  href="/login"
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={15} />
                  Return to login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help text */}
        {!sent && (
          <p className="text-center text-slate-600 text-xs mt-5">
            Remember your password?{' '}
            <Link href="/login" className="text-slate-400 hover:text-brand-400 transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
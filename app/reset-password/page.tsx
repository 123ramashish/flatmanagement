// app/reset-password/page.tsx
// ─────────────────────────────────────
// Drop this file into:  app/reset-password/page.tsx
// This page is reached via the link in the reset email:
//   /reset-password?token=<token>
// ─────────────────────────────────────

'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowLeft, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';

// ── Password strength helper ──────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 3) return { score, label: 'Fair', color: '#f59e0b' };
  return { score, label: 'Strong', color: '#22c55e' };
}

// ── Inner component (uses useSearchParams) ────────────────────
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = getStrength(password);
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 6 && password === confirm && !loading;

  // If no token in URL, show an error immediately
  useEffect(() => {
    if (!token) setError('No reset token found. Please request a new reset link.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Reset failed. The link may have expired.');
        return;
      }

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setError('Network error. Please check your connection and try again.');
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

        <div className="bg-surface-card border border-surface-border rounded-2xl p-7 shadow-2xl">

          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/25 mb-5 mx-auto">
            <KeyRound size={26} className="text-brand-400" />
          </div>

          {/* ── Success state ── */}
          {success ? (
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-500/15 border border-brand-500/30 mx-auto mb-5">
                <CheckCircle size={30} className="text-brand-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Password updated!</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Your password has been changed successfully.
                <br />Redirecting you to login…
              </p>
              <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full animate-[shrink_3s_linear_forwards]" style={{ width: '100%' }} />
              </div>
              <Link href="/login" className="btn-primary w-full flex items-center justify-center gap-2 mt-5">
                Go to login now
              </Link>
            </div>

          ) : (
            /* ── Form state ── */
            <>
              <h1 className="text-xl font-bold text-white text-center mb-1">Set new password</h1>
              <p className="text-slate-400 text-sm text-center mb-7">
                Choose a strong password for your FlatWork account.
              </p>

              {/* No-token error */}
              {!token && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-5">
                  <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 text-sm font-medium">Invalid link</p>
                    <p className="text-red-400/70 text-xs mt-0.5">
                      Please{' '}
                      <Link href="/forgot-password" className="underline hover:text-red-300">
                        request a new reset link
                      </Link>.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* New password */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="input-field pr-10"
                      autoFocus={!!token}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: i <= strength.score ? strength.color : '#334155',
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: strength.color }}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`input-field pr-10 ${mismatch ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {mismatch && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* API Error */}
                {error && (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                    <AlertTriangle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-300 text-sm leading-snug">{error}</p>
                      {error.toLowerCase().includes('expired') && (
                        <Link
                          href="/forgot-password"
                          className="text-red-400 underline text-xs mt-1 inline-block hover:text-red-300"
                        >
                          Request a new link →
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || !token}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <KeyRound size={15} />
                  )}
                  {loading ? 'Updating password…' : 'Update password'}
                </button>
              </form>

              <p className="text-center text-slate-600 text-xs mt-5">
                Didn't ask for this?{' '}
                <Link href="/login" className="text-slate-400 hover:text-brand-400 transition-colors">
                  Go back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper (Suspense required for useSearchParams) ──────
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard, { authInputCls, authLabelCls } from '@/components/auth/AuthCard';
import { resetPassword } from '@/lib/auth';

export function ResetPasswordForm() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') ?? '');
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      setError('Those passwords do not match — please check both fields.');
      return;
    }
    if (!token) {
      setError('This reset link is missing its token. Please request a new link.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await resetPassword(token, password);
    if (result.ok) {
      setMessage(result.message ?? 'Your password has been reset. Redirecting to sign in…');
      setTimeout(() => router.push('/login'), 1200);
    } else {
      setError(result.message ?? 'We could not reset your password.');
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Use at least eight characters. Your new password will be active immediately."
    >
      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-coral/30 bg-peach/30 px-4 py-2.5 text-sm text-charcoal">
          {error}
        </div>
      )}
      {message && (
        <div role="status" className="mb-5 rounded-xl border border-primary/30 bg-primary-soft px-4 py-2.5 text-sm text-charcoal">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={authLabelCls} htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputCls}
          />
        </div>
        <div>
          <label className={authLabelCls} htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputCls}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Updating password…' : 'Update password'}
        </button>
      </form>
    </AuthCard>
  );
}

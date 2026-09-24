'use client';

import { useState } from 'react';
import AuthCard, { authInputCls, authLabelCls } from '@/components/auth/AuthCard';
import { requestPasswordReset } from '@/lib/auth';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const result = await requestPasswordReset(email);
    if (result.ok) {
      setMessage(result.message ?? 'Check your email for reset instructions.');
    } else {
      setError(result.message ?? 'We could not process that request.');
    }
    setLoading(false);
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email address linked to your customer account and we’ll send you a secure reset link."
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
          <label className={authLabelCls} htmlFor="forgot-email">Email address</label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className={authInputCls}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Sending instructions…' : 'Send reset link'}
        </button>
      </form>
    </AuthCard>
  );
}

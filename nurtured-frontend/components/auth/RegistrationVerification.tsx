'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard, { authInputCls, authLabelCls } from '@/components/auth/AuthCard';
import {
  destinationFor,
  resendVerification,
  verifyEmail,
  type RegisterStart,
} from '@/lib/auth';

export function RegistrationVerification({
  verification,
  next,
}: {
  verification: RegisterStart;
  next: string | null;
}) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the six-digit code from your email.');
      return;
    }
    setLoading(true);
    const result = await verifyEmail(verification.challenge_token, otp);
    if (result.ok && result.session) {
      setMessage('Email verified. Taking you back…');
      router.push(destinationFor(result.session, next));
      router.refresh();
      return;
    }
    setError(result.message ?? 'That verification code is not valid.');
    setLoading(false);
  }

  async function handleResend() {
    setResending(true);
    setError('');
    const result = await resendVerification(verification.challenge_token);
    setMessage(result.ok ? result.message ?? 'A new code has been sent.' : '');
    if (!result.ok) setError(result.message ?? 'Could not resend the code.');
    setResending(false);
  }

  return (
    <AuthCard
      title="Check your email"
      subtitle={`We sent a six-digit verification code to ${verification.email}. Enter it below to finish creating your account.`}
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
          <label className={authLabelCls} htmlFor="registration-otp">Six-digit verification code</label>
          <input
            id="registration-otp"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            className={`${authInputCls} text-center text-lg tracking-[0.5em]`}
          />
          <p className="mt-1 text-xs text-charcoal/55">The code expires in ten minutes.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Verifying…' : 'Verify email and continue'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="mt-5 w-full text-center text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {resending ? 'Sending a new code…' : 'Didn’t receive a code? Send another'}
      </button>
    </AuthCard>
  );
}

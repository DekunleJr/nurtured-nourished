'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const inputCls =
  'w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/40 focus:border-primary focus:ring-2 focus:ring-primary/25';

/**
 * Admin accounts: create, rename, reset a password, deactivate or archive.
 *
 * The backend refuses to deactivate/archive your own account or the last active
 * admin, so those buttons are disabled for the signed-in row and any remaining
 * refusal is surfaced verbatim from the API's `detail` message.
 */
export default function AdminUsers() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Add-admin form state.
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  // Per-row edit state (rename / password reset).
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ name: '', password: '' });
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (!res.ok) {
        setError('Failed to load admin accounts');
        return;
      }
      setAdmins((await res.json()) as AdminUser[]);

      // Who am I? Needed to disable self-deactivation/archiving in the UI.
      const verify = await fetch('/api/admin/verify', { credentials: 'include' });
      if (verify.ok) {
        const me = (await verify.json()) as { username?: string };
        setCurrentEmail(me.username ?? '');
      }
    } catch {
      setError('Network error loading admin accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Deferred by one tick so load's synchronous setLoading runs outside the
    // effect body (react-hooks/set-state-in-effect).
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  /** PATCH one admin; the API's own `detail` message is shown on refusal. */
  async function patchAdmin(admin: AdminUser, body: Record<string, unknown>, okMessage: string) {
    setBusyId(admin.id);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/admin/users/${admin.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail || data.error || 'Update failed');
        return;
      }
      setNotice(okMessage);
      setEditingId(null);
      await load();
    } catch {
      setError('Network error updating admin');
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail || data.error || 'Could not create admin');
        return;
      }
      setNotice(`Admin account created for ${data.email}`);
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      await load();
    } catch {
      setError('Network error creating admin');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveDetails(admin: AdminUser) {
    const body: Record<string, unknown> = { name: draft.name };
    if (draft.password) body.password = draft.password;
    const summary = draft.password
      ? `${admin.email} updated and password reset`
      : `${admin.email} renamed`;
    await patchAdmin(admin, body, summary);
  }

  async function archive(admin: AdminUser) {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `Archive ${admin.email}? They lose dashboard access immediately. The record is kept and can be restored later.`,
    );
    if (!confirmed) return;
    await patchAdmin(admin, { is_deleted: true }, `${admin.email} archived`);
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-charcoal">Manage admins</h2>
          <p className="mt-0.5 text-sm text-charcoal/60">
            Accounts that can sign in to this dashboard.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          {showForm ? 'Cancel' : 'Add admin'}
        </button>
      </div>

      {(error || notice) && (
        <div
          className={`mt-4 rounded-xl px-4 py-2 text-sm ${
            error
              ? 'border border-coral/30 bg-peach/30 text-coral'
              : 'border border-primary/30 bg-primary-soft text-primary'
          }`}
          role="status"
        >
          {error || notice}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            className={inputCls}
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoComplete="off"
          />
          <input
            className={inputCls}
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="off"
          />
          <input
            className={inputCls}
            type="password"
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create admin'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-charcoal/10 p-3 font-bold text-charcoal">Name</th>
              <th className="border-b border-charcoal/10 p-3 font-bold text-charcoal">Email</th>
              <th className="border-b border-charcoal/10 p-3 font-bold text-charcoal">Status</th>
              <th className="border-b border-charcoal/10 p-3 font-bold text-charcoal">Created</th>
              <th className="border-b border-charcoal/10 p-3 text-right font-bold text-charcoal">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-charcoal/50">
                  Loading…
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-charcoal/50">
                  No admin accounts found.
                </td>
              </tr>
            ) : (
              admins.map((admin) => {
                const isSelf = currentEmail !== '' && admin.email === currentEmail;
                const isEditing = editingId === admin.id;
                return (
                  <Fragment key={admin.id}>
                    <tr>
                      <td className="border-b border-charcoal/5 p-3 font-medium text-charcoal">
                        {admin.name}
                        {isSelf && (
                          <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                            You
                          </span>
                        )}
                      </td>
                      <td className="border-b border-charcoal/5 p-3 text-charcoal">{admin.email}</td>
                      <td className="border-b border-charcoal/5 p-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            admin.is_active
                              ? 'bg-primary-soft text-primary'
                              : 'bg-charcoal/10 text-charcoal/60'
                          }`}
                        >
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="border-b border-charcoal/5 p-3 text-charcoal/60">
                        {admin.created_at
                          ? new Date(admin.created_at).toLocaleDateString('en-GB')
                          : '—'}
                      </td>
                      <td className="border-b border-charcoal/5 p-3">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setEditingId(isEditing ? null : admin.id);
                              setDraft({ name: admin.name, password: '' });
                              setError('');
                              setNotice('');
                            }}
                            className="text-sm font-semibold text-charcoal/70 transition-colors hover:text-primary"
                          >
                            {isEditing ? 'Close' : 'Edit'}
                          </button>
                          <button
                            onClick={() =>
                              patchAdmin(
                                admin,
                                { is_active: !admin.is_active },
                                `${admin.email} ${admin.is_active ? 'deactivated' : 'reactivated'}`,
                              )
                            }
                            disabled={busyId === admin.id}
                            title={isSelf ? 'You cannot deactivate your own account' : undefined}
                            className="text-sm font-semibold text-coral transition-colors hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {admin.is_active ? 'Deactivate' : 'Reactivate'}
                          </button>
                          <button
                            onClick={() => archive(admin)}
                            disabled={busyId === admin.id}
                            title={isSelf ? 'You cannot archive your own account' : undefined}
                            className="text-sm font-semibold text-charcoal/50 transition-colors hover:text-coral disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isEditing && (
                      <tr className="bg-primary-soft/20">
                        <td colSpan={5} className="border-b border-charcoal/5 p-4">
                          <div className="flex flex-wrap items-end gap-3">
                            <label className="text-sm font-medium text-charcoal/70">
                              Name
                              <input
                                className={`${inputCls} mt-1`}
                                value={draft.name}
                                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                              />
                            </label>
                            <label className="text-sm font-medium text-charcoal/70">
                              New password{' '}
                              <span className="font-normal text-charcoal/40">
                                (leave blank to keep)
                              </span>
                              <input
                                className={`${inputCls} mt-1`}
                                type="password"
                                minLength={8}
                                autoComplete="new-password"
                                value={draft.password}
                                onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                              />
                            </label>
                            <button
                              onClick={() => saveDetails(admin)}
                              disabled={busyId === admin.id}
                              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

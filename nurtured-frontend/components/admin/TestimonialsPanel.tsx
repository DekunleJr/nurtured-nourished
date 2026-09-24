'use client';

import { useState } from 'react';
import {
  adminPatch,
  adminPost,
  adminPut,
  isAuthFailure,
  useAdminList,
  type TestimonialRecord,
} from '@/lib/admin-api';

const inputCls =
  'w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/40 focus:border-primary focus:ring-2 focus:ring-primary/25';

interface Draft {
  name: string;
  location: string;
  package: string;
  quote: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}

const emptyDraft: Draft = {
  name: '',
  location: '',
  package: '',
  quote: '',
  is_featured: false,
  is_published: false,
  sort_order: 0,
};

/** A PUT replaces the whole record, so every toggle must resend all fields. */
function toDraft(t: TestimonialRecord): Draft {
  return {
    name: t.name,
    location: t.location,
    package: t.package,
    quote: t.quote,
    is_featured: t.is_featured,
    is_published: t.is_published,
    sort_order: t.sort_order,
  };
}

/**
 * Testimonials: admin-authored quotes with an explicit publish step. New quotes
 * start as drafts so nothing appears on the public site unreviewed, and
 * archiving hides a quote everywhere without destroying the wording.
 */
export default function TestimonialsPanel() {
  const { items, loading, error, setError, includeDeleted, setIncludeDeleted, refresh } =
    useAdminList<TestimonialRecord>('testimonials');

  const [editorId, setEditorId] = useState<number | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  function startNew() {
    setDraft(emptyDraft);
    setEditorId('new');
    setNotice('');
    setError('');
  }

  function startEdit(t: TestimonialRecord) {
    setDraft(toDraft(t));
    setEditorId(t.id);
    setNotice('');
    setError('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editorId === 'new') {
        await adminPost<TestimonialRecord>('testimonials', draft);
        setNotice('Testimonial saved as a draft — publish it when you are ready.');
      } else {
        await adminPut<TestimonialRecord>(`testimonials/${editorId}`, draft);
        setNotice('Testimonial updated');
      }
      setEditorId(null);
      await refresh();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not save the testimonial');
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchived(t: TestimonialRecord) {
    setError('');
    setNotice('');
    try {
      await adminPatch(`testimonials/${t.id}/${t.is_deleted ? 'restore' : 'archive'}`);
      setNotice(t.is_deleted ? 'Testimonial restored' : 'Testimonial archived');
      await refresh();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not update the testimonial');
      }
    }
  }

  async function togglePublished(t: TestimonialRecord) {
    setError('');
    setNotice('');
    try {
      await adminPut<TestimonialRecord>(`testimonials/${t.id}`, {
        ...toDraft(t),
        is_published: !t.is_published,
      });
      setNotice(t.is_published ? 'Removed from the public site' : 'Published to the public site');
      await refresh();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not update the testimonial');
      }
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-charcoal/70">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={() => setIncludeDeleted(!includeDeleted)}
            className="h-4 w-4 accent-primary"
          />
          Show archived
        </label>
        <div className="flex-1" />
        <button
          onClick={startNew}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          Add testimonial
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-coral/30 bg-peach/30 px-4 py-3 text-sm text-coral">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-primary/20 bg-primary-soft/40 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      {editorId !== null && (
        <TestimonialForm
          heading={editorId === 'new' ? 'New testimonial' : 'Edit testimonial'}
          draft={draft}
          saving={saving}
          onChange={setDraft}
          onSubmit={submit}
          onCancel={() => setEditorId(null)}
        />
      )}

      {loading && items.length === 0 ? (
        <div className="h-24 animate-pulse rounded-2xl bg-charcoal/5" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-charcoal">No testimonials yet</p>
          <p className="mt-1 text-sm text-charcoal/60">
            Add a quote, then publish it to show it on the homepage.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-cream/60">
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Client</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Quote</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Visibility</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Order</th>
                  <th className="px-5 py-3 text-right font-semibold text-charcoal/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-b border-charcoal/5 transition-colors ${
                      t.is_deleted ? 'bg-cream/40 text-charcoal/50' : 'hover:bg-primary-soft/30'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {t.is_deleted && (
                          <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-charcoal/60">
                            Archived
                          </span>
                        )}
                        <span className="font-semibold text-charcoal">{t.name}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-charcoal/50">
                        {[t.location, t.package].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </td>
                    <td className="max-w-[320px] px-5 py-4 text-charcoal/70">
                      <p className="line-clamp-2">{t.quote}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            t.is_published
                              ? 'bg-primary-soft text-primary'
                              : 'bg-charcoal/10 text-charcoal/60'
                          }`}
                        >
                          {t.is_published ? 'Published' : 'Draft'}
                        </span>
                        {t.is_featured && (
                          <span className="rounded-full bg-peach/40 px-2.5 py-0.5 text-xs font-semibold text-coral">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-charcoal/70">{t.sort_order}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(t)}
                          className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-primary hover:text-primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => togglePublished(t)}
                          className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-primary hover:text-primary"
                        >
                          {t.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => toggleArchived(t)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                            t.is_deleted
                              ? 'bg-primary-soft text-primary hover:bg-primary hover:text-white'
                              : 'bg-peach/40 text-coral hover:bg-coral hover:text-white'
                          }`}
                        >
                          {t.is_deleted ? 'Restore' : 'Archive'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function TestimonialForm({
  heading,
  draft,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: {
  heading: string;
  draft: Draft;
  saving: boolean;
  onChange: (draft: Draft) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-charcoal">{heading}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm font-medium text-charcoal/70">
          Client name *
          <input
            className={`${inputCls} mt-1`}
            value={draft.name}
            required
            maxLength={255}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Location
          <input
            className={`${inputCls} mt-1`}
            value={draft.location}
            maxLength={255}
            onChange={(e) => onChange({ ...draft, location: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Programme
          <input
            className={`${inputCls} mt-1`}
            value={draft.package}
            maxLength={255}
            onChange={(e) => onChange({ ...draft, package: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70 md:col-span-3">
          Quote *
          <textarea
            className={`${inputCls} mt-1 min-h-[110px]`}
            value={draft.quote}
            required
            maxLength={4000}
            onChange={(e) => onChange({ ...draft, quote: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Display order
          <input
            type="number"
            min={0}
            className={`${inputCls} mt-1`}
            value={draft.sort_order}
            onChange={(e) => onChange({ ...draft, sort_order: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-charcoal/70">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={draft.is_featured}
            onChange={(e) => onChange({ ...draft, is_featured: e.target.checked })}
          />
          Feature on the homepage
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-charcoal/70">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={draft.is_published}
            onChange={(e) => onChange({ ...draft, is_published: e.target.checked })}
          />
          Published (visible on the site)
        </label>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save testimonial'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-charcoal/60 transition-colors hover:text-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

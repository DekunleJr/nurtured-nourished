/**
 * Live client testimonials served by the backend.
 *
 * Rendered exclusively from the admin-managed content API
 * (fetchDynamicTestimonials) — there is intentionally no static list any
 * more. Returns `null` when the API is unreachable, or an empty array when
 * nothing is published. Callers must render their own empty state so the
 * page can never show outdated words.
 */
export type DynamicTestimonial = {
  id: number;
  name: string;
  location: string;
  package: string;
  quote: string;
  is_featured: boolean;
  sort_order: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dynamicFromApi(row: unknown): DynamicTestimonial | null {
  if (!isRecord(row)) return null;
  const id = Number(row.id);
  const name = String(row.name ?? "").trim();
  const quote = String(row.quote ?? "").trim();
  if (!Number.isFinite(id) || name === "" || quote === "") return null;
  const sortOrder = Number(row.sort_order ?? 0);
  return {
    id,
    name,
    location: String(row.location ?? ""),
    package: String(row.package ?? ""),
    quote,
    is_featured: Boolean(row.is_featured),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

/**
 * Fetch published testimonials (featured first, then sort order — the API's
 * own ordering). `null` on failure, `[]` when nothing is published. Rows
 * missing a usable id/name/quote are dropped so callers never render
 * duplicate `NaN` React keys.
 *
 * Same-origin call: the Next.js proxy at /api/testimonials relays to the
 * FastAPI backend, so pages never depend on NEXT_PUBLIC_API_URL or direct
 * backend egress. The base URL is resolved for server components (absolute
 * URL required) and browser callers (relative URL).
 */
export async function fetchDynamicTestimonials(): Promise<DynamicTestimonial[] | null> {
  const base =
    typeof window === 'undefined'
      ? (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
      : '';
  if (!base && typeof window === 'undefined') return null;

  try {
    const res = await fetch(`${base}/api/testimonials`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: unknown };
    if (!Array.isArray(data.items)) return null;
    return data.items
      .map(dynamicFromApi)
      .filter((t): t is DynamicTestimonial => t !== null);
  } catch {
    return null;
  }
}

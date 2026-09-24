/**
 * Shared programme copy and the dynamic catalogue client.
 *
 * The package cards on /packages are rendered exclusively from the live,
 * admin-managed catalogue (fetchDynamicPackages) — there is intentionally no
 * static tier list any more, so prices always come from the backend.
 */

export const PROGRAMME_NAME = "The Favour Oloye Birth Confidence Programme™";
export const PROGRAMME_SHORT = "FOBCP™";
export const cohortSize = "Five women per cohort";

/** Pay-as-you-go session available to existing Maternal clients. */
export const additionalSession = {
  name: "Additional 45-minute Postnatal Support Session",
  price: "£60",
  availability: "Available to existing Maternal clients.",
  cta: "Book an additional support session",
};

/**
 * Programme names/slugs for choice-only dropdowns (e.g. the discovery-call
 * intake form's "which package are you most interested in?"). Name/slug only —
 * deliberately no prices: any price shown to customers must come from the
 * live catalogue (fetchDynamicPackages) so it can never drift from the
 * backend.
 */
export const packageOptions: { slug: string; name: string }[] = [
  { slug: "foundation", name: "Maternal Foundation" },
  { slug: "continuity", name: "Maternal Continuity" },
  { slug: "extended", name: "Maternal Extended" },
];

export const getPackageOptionBySlug = (slug: string | null) =>
  packageOptions.find((p) => p.slug === slug);

/**
 * Reconstruct the bold-emphasis flags for catalogue feature strings.
 *
 * Catalogue features arrive as plain strings (no emphasis flag). The
 * session-count and availability-window lines are rendered bold so the three
 * tiers stay visually scannable — without requiring the admin to set per-
 * feature flags. Shared by every page that renders catalogue features.
 */
export function describeFeatures(
  features: string[],
): { text: string; emphasis?: boolean }[] {
  return features.map((text) => {
    const sessionCount =
      /^(\d+)\s*×\s*45-minute private online postnatal support session/i.test(text);
    const window = /available within your first/i.test(text);
    return { text, emphasis: sessionCount || window ? true : undefined };
  });
}

/* ------------------------------------------------------------------ */
/*  Dynamic catalogue (admin-managed)                                 */
/* ------------------------------------------------------------------ */

export type DynamicPackage = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  price_pence: number;
  currency: string;
  blurb: string;
  features: string[];
  price_note: string;
  cta_label: string;
  is_featured: boolean;
};

export type DynamicCohort = {
  id: number;
  label: string;
  start_date: string | null;
  session_time: string;
  capacity: number;
  status: string;
  seats_taken: number;
  seats_left: number;
};

export function formatPrice(pence: number, currency = "gbp"): string {
  const symbol = currency.toLowerCase() === "gbp" ? "£" : currency === "eur" ? "€" : "$";
  return `${symbol}${(pence / 100).toFixed(0)}`;
}

function dynamicFromApi(row: unknown): DynamicPackage | null {
  if (typeof row !== "object" || row === null || Array.isArray(row)) return null;
  const record = row as Record<string, unknown>;
  const id = Number(record.id);
  const slug = String(record.slug ?? "").trim();
  const name = String(record.name ?? "").trim();
  if (!Number.isFinite(id) || slug === "" || name === "") return null;
  const price = Number(record.price_pence ?? 0);
  return {
    id,
    slug,
    name,
    tagline: String(record.tagline ?? ""),
    price_pence: Number.isFinite(price) ? price : 0,
    currency: String(record.currency ?? "gbp"),
    blurb: String(record.blurb ?? ""),
    features: Array.isArray(record.features) ? (record.features as string[]) : [],
    price_note: String(record.price_note ?? ""),
    cta_label: String(record.cta_label ?? "Book your place"),
    is_featured: Boolean(record.is_featured),
  };
}

/**
 * Fetch the admin-managed package catalogue.
 *
 * Returns `null` when the API is unreachable, or an empty array when nothing
 * is published. There is no static fallback — callers must render their own
 * empty/error state, so the page can never show outdated prices. Rows
 * missing a usable id/slug/name are dropped so callers never render
 * duplicate `NaN` React keys.
 */
export async function fetchDynamicPackages(): Promise<DynamicPackage[] | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/packages`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: unknown };
    if (!Array.isArray(data.items)) return null;
    return data.items
      .map(dynamicFromApi)
      .filter((p): p is DynamicPackage => p !== null);
  } catch {
    return null;
  }
}

/** Fetch cohorts with free places; null on API failure (callers fall back). */
export async function fetchCohorts(): Promise<DynamicCohort[] | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cohorts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: DynamicCohort[] };
    return Array.isArray(data.items) ? data.items : null;
  } catch {
    return null;
  }
}

const formatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatCohortDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return formatter.format(new Date(`${iso}T00:00:00`));
  } catch {
    return iso;
  }
}
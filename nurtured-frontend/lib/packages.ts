export type PackageFeature = {
  text: string;
  /** Rendered in bold — used for the session count and its availability window. */
  emphasis?: boolean;
};

export type PackageTier = {
  slug: string;
  name: string;
  /** Short positioning line shown above the fee. */
  tagline: string;
  /** Published programme fee. */
  price: string;
  /** Payment-position line shown beneath the fee. */
  priceNote: string;
  blurb: string;
  features: PackageFeature[];
  cta: string;
};

/**
 * Every Maternal option delivers the same complete six-week FOBCP™ experience.
 * The tiers differ only in the private postnatal support that follows, so the
 * programme name and shared inclusions live here once and are composed into each
 * tier below.
 */
export const PROGRAMME_NAME = "The Favour Oloye Birth Confidence Programme™";
export const PROGRAMME_SHORT = "FOBCP™";
export const cohortSize = "Five women per cohort";

/** Inclusions that are identical across all three Maternal options. */
export const coreIncludes: PackageFeature[] = [
  { text: "Complete six-week live online FOBCP™" },
  { text: "Maximum of five women per cohort" },
  { text: "Birth partner or chosen supporter welcome" },
  { text: "Premium FOBCP™ programme resources" },
  { text: "WhatsApp Programme Support during the six-week programme" },
];

/** Optional cohort reunion, listed last on every tier. */
const reunionInclude: PackageFeature = {
  text: "Invitation to the optional cohort Postnatal Reunion, where scheduled",
};

export const INSTALMENT_NOTE =
  "Pay in full or spread the cost with interest-free instalments where available.";

/** Pay-as-you-go session available to existing Maternal clients. */
export const additionalSession = {
  name: "Additional 45-minute Postnatal Support Session",
  price: "£60",
  availability: "Available to existing Maternal clients.",
  cta: "Book an additional support session",
};

export const packages: PackageTier[] = [
  {
    slug: "foundation",
    name: "Maternal Foundation",
    tagline: "A strong beginning.",
    price: "£295",
    priceNote: INSTALMENT_NOTE,
    blurb:
      "The complete FOBCP™ experience, followed by a private postnatal support session during your first six weeks after birth.",
    features: [
      ...coreIncludes,
      { text: "1 × 45-minute private online postnatal support session", emphasis: true },
      { text: "Postnatal session available within your first 6 weeks after birth", emphasis: true },
      reunionInclude,
    ],
    cta: "Choose Maternal Foundation",
  },
  {
    slug: "continuity",
    name: "Maternal Continuity",
    tagline: "More time for individual support.",
    price: "£345",
    priceNote: INSTALMENT_NOTE,
    blurb:
      "The complete FOBCP™ experience with two private postnatal support sessions available across your first 12 weeks after birth.",
    features: [
      ...coreIncludes,
      { text: "2 × 45-minute private online postnatal support sessions", emphasis: true },
      { text: "Postnatal sessions available within your first 12 weeks after birth", emphasis: true },
      reunionInclude,
    ],
    cta: "Choose Maternal Continuity",
  },
  {
    slug: "extended",
    name: "Maternal Extended",
    tagline: "Support that stays with you for longer.",
    price: "£395",
    priceNote: INSTALMENT_NOTE,
    blurb:
      "The complete FOBCP™ experience with three private postnatal support sessions that can be used across your first six months after birth.",
    features: [
      ...coreIncludes,
      { text: "3 × 45-minute private online postnatal support sessions", emphasis: true },
      { text: "Postnatal sessions available within your first 6 months after birth", emphasis: true },
      reunionInclude,
    ],
    cta: "Choose Maternal Extended",
  },
];

export const getPackageBySlug = (slug: string | null) =>
  packages.find((p) => p.slug === slug);
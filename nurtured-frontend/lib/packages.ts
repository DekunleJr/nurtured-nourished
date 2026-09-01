export type PackageTier = {
  slug: string;
  name: string;
  price: string;
  blurb: string;
  features: string[];
  cta: string;
  flagship?: boolean;
};

/**
 * The three B2C maternity packages, arranged left-to-right:
 * Essential -> Confidence (flagship) -> Premium.
 */
export const packages: PackageTier[] = [
  {
    slug: "essential",
    name: "Maternal Essential",
    price: "£299",
    blurb:
      "Our six-week live online group programme with a dedicated partner session and postnatal support in the early weeks.",
    features: [
      "Six-week live online group programme",
      "Dedicated partner session",
      "One 45-minute postnatal support session within six weeks of birth",
      "Email updates throughout your journey",
      "Active WhatsApp support throughout the programme",
    ],
    cta: "Book Consultation",
  },
  {
    slug: "confidence",
    name: "Maternal Confidence",
    price: "£349",
    flagship: true,
    blurb:
      "Everything in Essential, plus two additional one-to-one sessions giving you three postnatal support sessions from birth to 12 weeks.",
    features: [
      "Everything included in the Maternal Essential package",
      "Two additional 45-minute one-to-one support sessions",
      "Three postnatal support sessions in total, from birth to 12 weeks",
      "Email updates throughout your journey",
      "Active WhatsApp support throughout the programme",
    ],
    cta: "Secure Your Spot",
  },
  {
    slug: "premium",
    name: "Maternal Premium",
    price: "£449",
    blurb:
      "Our premium tier: individualised one-to-one preparation with the longest runway of dedicated postnatal support.",
    features: [
      "Individualised six-week one-to-one birth preparation programme",
      "Four 45-minute postnatal support sessions from birth to six months",
      "Email updates throughout your journey",
      "Ongoing WhatsApp support throughout programme delivery",
    ],
    cta: "Apply for Premium",
  },
];

export const getPackageBySlug = (slug: string | null) =>
  packages.find((p) => p.slug === slug);
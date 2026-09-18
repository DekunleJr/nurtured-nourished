import type { ReactNode } from "react";

type SectionTone = "cream" | "white" | "soft" | "charcoal";

const tones: Record<SectionTone, string> = {
  cream: "bg-cream",
  white: "bg-white",
  soft: "bg-primary-soft/60",
  charcoal: "bg-charcoal text-white",
};

type SectionProps = {
  children: ReactNode;
  tone?: SectionTone;
  id?: string;
  narrow?: boolean;
  className?: string;
};

/**
 * Standard page section: shared rhythm, container and background alternation.
 * Adds scroll margin automatically when an anchor id is provided.
 */
export default function Section({
  children,
  tone = "white",
  id,
  narrow = false,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${id ? "scroll-mt-28 " : ""}${tones[tone]} ${className}`.trim()}
    >
      <div
        className={`mx-auto ${
          narrow ? "max-w-4xl" : "max-w-7xl"
        } px-4 py-20 sm:px-6 md:py-28`}
      >
        {children}
      </div>
    </section>
  );
}

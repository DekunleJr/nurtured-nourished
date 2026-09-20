import type { ReactNode } from "react";

/** Shared field styling so the sign-in and sign-up screens stay consistent. */
export const authInputCls =
  "w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/40 focus:border-primary focus:ring-2 focus:ring-primary/25";

export const authLabelCls = "mb-1 block text-sm font-semibold text-charcoal";

type Props = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Rendered below the card — e.g. the "create an account" link. */
  footer?: ReactNode;
};

/**
 * Chrome shared by every account screen (sign in, sign up).
 *
 * One card, one heading, the site's own type and colours — so the unified login
 * reads as part of the public site rather than the old admin-only screen.
 */
export default function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-screen bg-cream px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-md">
        <p className="text-center font-serif text-2xl font-bold text-primary">
          Nurtured &amp; Nourished
        </p>

        <div className="mt-6 rounded-[2rem] border border-charcoal/10 bg-white p-8 shadow-lg sm:p-9">
          <h1 className="font-serif text-2xl font-semibold text-charcoal">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-6 text-charcoal/65">{subtitle}</p>
          )}
          <div className="mt-7">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-charcoal/70">{footer}</div>}
      </div>
    </div>
  );
}

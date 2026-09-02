"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="bg-cream">
      <ol className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-sm">
        <li>
          <Link href="/" className="text-charcoal/60 hover:text-primary">
            Home
          </Link>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-2">
            <span className="text-charcoal/30">/</span>
            {i < crumbs.length - 1 ? (
              <Link href={crumb.href} className="text-charcoal/60 hover:text-primary">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-charcoal">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

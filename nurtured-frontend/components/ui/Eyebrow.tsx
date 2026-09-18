import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  /** "light" renders teal on light grounds; "dark" renders soft-teal on charcoal. */
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
};

/** Single section-eyebrow style used across every page. */
export default function Eyebrow({
  children,
  tone = "light",
  align = "left",
  className = "",
}: EyebrowProps) {
  return (
    <p
      className={`text-[0.7rem] font-semibold uppercase tracking-[0.22em] ${
        tone === "dark" ? "text-primary-soft" : "text-primary"
      } ${align === "center" ? "text-center" : "text-left"} ${className}`.trim()}
    >
      {children}
    </p>
  );
}

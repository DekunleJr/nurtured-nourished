type CheckDotProps = {
  size?: "sm" | "md";
  /** "muted" renders a low-contrast dot for dark "future vision" lists. */
  variant?: "brand" | "muted";
};

/** Single brand check-dot for feature lists, replacing ad-hoc dots and checks. */
export default function CheckDot({ size = "md", variant = "brand" }: CheckDotProps) {
  const box = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const icon = size === "sm" ? 11 : 12;
  return (
    <span
      className={`flex ${box} shrink-0 items-center justify-center rounded-full ${
        variant === "muted" ? "bg-white/20 text-white/60" : "bg-primary text-white"
      }`}
      aria-hidden="true"
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

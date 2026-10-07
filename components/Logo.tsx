export function Logo({ size = 24 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-extrabold tracking-tight" style={{ fontSize: size * 0.75 }} aria-label="Hub">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="8" fill="#6366f1" />
        <circle cx="16" cy="16" r="3" fill="#fff" />
        <g stroke="#fff" strokeWidth="1.8" fill="none"><circle cx="8" cy="9" r="2.5" /><circle cx="24" cy="9" r="2.5" /><circle cx="8" cy="23" r="2.5" /><circle cx="24" cy="23" r="2.5" /></g>
      </svg>
      <span>Hub<span style={{ color: "#818cf8" }}>.</span></span>
    </span>
  );
}

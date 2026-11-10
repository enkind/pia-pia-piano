/** Three keys of a keyboard on a lacquer tile, the middle one lit. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="var(--mark-tile, #121317)" />
      <rect x="12" y="14" width="12.5" height="36" rx="2.5" fill="#ffffff" />
      <rect x="25.75" y="14" width="12.5" height="36" rx="2.5" fill="#ffc531" />
      <rect x="39.5" y="14" width="12.5" height="36" rx="2.5" fill="#ffffff" />
      <rect x="20.5" y="11" width="8" height="23" rx="2" fill="var(--mark-tile, #121317)" />
      <rect x="35.5" y="11" width="8" height="23" rx="2" fill="var(--mark-tile, #121317)" />
    </svg>
  );
}

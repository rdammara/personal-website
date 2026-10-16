// The hexagon mark, redrawn from the brand sheet. `cutColor` must match the
// background behind the mark, because the "A" is drawn in that colour.
export function LogoMark({
  className,
  cutColor = 'var(--bg)',
}: {
  className?: string;
  cutColor?: string;
}) {
  return (
    <svg viewBox="352 237 364 420" aria-hidden="true" className={className}>
      <polygon points="534,237 716,342 716,552 534,657 352,552 352,342" style={{ fill: 'var(--ink)' }} />
      <polygon
        points="534,318 668.7,579.3 639.2,596.4 534,390 428.8,596.4 399.3,579.3"
        style={{ fill: cutColor }}
      />
      <rect x="484" y="508" width="25" height="46" rx="2" style={{ fill: 'var(--logo-orange)' }} />
      <rect x="522" y="442" width="25" height="112" rx="2" style={{ fill: 'var(--logo-orange)' }} />
      <rect x="559" y="489" width="25" height="65" rx="2" style={{ fill: 'var(--logo-orange)' }} />
    </svg>
  );
}

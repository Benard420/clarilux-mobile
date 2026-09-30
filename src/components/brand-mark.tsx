export function BrandMark({ size = 22 }: { size?: number }) {
  const rays = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="text-brand">
      {rays.map((deg) => (
        <line
          key={deg}
          x1="12"
          y1="12"
          x2="12"
          y2={deg % 90 === 0 ? 1.5 : 3.5}
          stroke="currentColor"
          strokeWidth={deg % 90 === 0 ? 1.9 : 1.2}
          strokeLinecap="round"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <BrandMark size={size} />
      <span className="text-[17px] font-bold tracking-[-0.02em] text-brand">Clarilux</span>
    </span>
  );
}

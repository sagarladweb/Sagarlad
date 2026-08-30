export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

export function ShimmerCircle({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-full bg-muted ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

export function ShimmerCard({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-muted ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

export function ShimmerImage({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-muted ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-10 h-10 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
      </div>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

/* ── Skeleton layout primitives ────────────────────────────────────── */

/** PageHeader skeleton: eyebrow chip → title → subtitle. Matches <PageHeader>. */
export function SkeletonHeader({
  eyebrowW = 96,
  titleW = 224,
  subtitleW = 288,
  dark = false,
}: {
  eyebrowW?: number;
  titleW?: number;
  subtitleW?: number;
  dark?: boolean;
}) {
  const d = dark ? " dark" : "";
  return (
    <div className="space-y-3">
      <div className={`sk-item sk-circle h-6${d}`} style={{ width: eyebrowW }} />
      <div className={`sk-item h-10 sm:h-12${d}`} style={{ width: titleW }} />
      <div className={`sk-item h-5 max-w-full${d}`} style={{ width: subtitleW }} />
    </div>
  );
}

/** Table/list skeleton: N rows, each with optional avatar, text, badge. */
export function SkeletonList({
  rows = 5,
  avatar = false,
  badge = false,
  dark = false,
}: {
  rows?: number;
  avatar?: boolean;
  badge?: boolean;
  dark?: boolean;
}) {
  const d = dark ? " dark" : "";
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          {avatar && <div className={`sk-item sk-circle h-9 w-9 shrink-0${d}`} />}
          <div className="flex-1 space-y-1.5">
            <div className={`sk-item h-3.5${d}`} style={{ width: 140 + (i % 3) * 32 }} />
            <div className={`sk-item h-2.5${d}`} style={{ width: 100 + (i % 2) * 48 }} />
          </div>
          {badge && <div className={`sk-item sk-circle h-6 w-16 shrink-0${d}`} />}
        </div>
      ))}
    </div>
  );
}

/** Form skeleton: title → N labeled fields → textarea → submit button. */
export function SkeletonForm({
  fields = 3,
  hasTextarea = true,
  dark = false,
}: {
  fields?: number;
  hasTextarea?: boolean;
  dark?: boolean;
}) {
  const d = dark ? " dark" : "";
  return (
    <div className="space-y-5">
      <div className={`sk-item h-7 w-40${d}`} />
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className={`sk-item h-3.5 w-20${d}`} />
          <div className={`sk-item sk-card h-12 w-full${d}`} />
        </div>
      ))}
      {hasTextarea && (
        <div className="space-y-2">
          <div className={`sk-item h-3.5 w-16${d}`} />
          <div className={`sk-item sk-card h-28 w-full${d}`} />
        </div>
      )}
      <div className={`sk-item sk-circle h-12 w-32${d}`} />
    </div>
  );
}

/** Card grid skeleton: responsive columns of cards with image + text. */
export function SkeletonCardGrid({
  count = 6,
  cols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  aspect = "aspect-[2/3]",
  imageOnly = false,
  dark = false,
}: {
  count?: number;
  cols?: string;
  aspect?: string;
  imageOnly?: boolean;
  dark?: boolean;
}) {
  const d = dark ? " dark" : "";
  return (
    <div className={`grid ${cols} gap-4 sm:gap-5`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className={`sk-item sk-full ${aspect}${d}`} />
          {!imageOnly && (
            <div className="p-4 space-y-2">
              <div className={`sk-item h-4 w-full${d}`} />
              <div className={`sk-item h-3 w-2/3${d}`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

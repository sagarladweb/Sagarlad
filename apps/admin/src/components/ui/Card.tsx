export function Card({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 ease-out hover:border-accent/25 hover:bg-accent/[0.015] ${className}`}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
          )}
          {Icon && <Icon className="w-4 h-4 text-accent/70" />}
        </div>
      )}
      {children}
    </div>
  );
}

export function KPICard({
  label,
  value,
  sub,
  tip,
  icon: Icon,
  sparkline,
  details,
}: {
  label: string;
  value: string;
  sub: string;
  tip?: string;
  icon: React.ComponentType<{ className?: string }>;
  sparkline?: React.ReactNode;
  details?: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-border/50 bg-card p-5 flex flex-col group transition-all duration-300 ease-out hover:border-accent/25 hover:bg-accent/[0.015]">
      {/* Tooltip on hover */}
      {tip && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-foreground text-background text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          {tip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
          {label}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/8 text-accent/60 transition-all duration-300 group-hover:bg-accent/15 group-hover:text-accent group-hover:scale-105">
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tabular-nums leading-none tracking-tight">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground/60">{sub}</p>
      {sparkline && <div className="mt-auto pt-3">{sparkline}</div>}
      {/* Hover details — shows after 3s */}
      {details && (
        <div className="absolute inset-0 z-20 rounded-2xl border border-accent/30 bg-card/95 backdrop-blur-sm p-5 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Details</span>
          </div>
          {details}
        </div>
      )}
    </div>
  );
}

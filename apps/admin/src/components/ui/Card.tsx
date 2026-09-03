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
      className={`rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 ease-out hover:border-accent/25 hover:bg-accent/[0.015] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.02)] ${className}`}
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
  icon: Icon,
  sparkline,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  sparkline?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col group transition-all duration-300 ease-out hover:border-accent/25 hover:bg-accent/[0.015]">
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
    </div>
  );
}

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
      className={`rounded-2xl border border-border bg-card card-grad p-5 ${className}`}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="font-display text-lg font-bold">{title}</h2>
          )}
          {Icon && <Icon className="w-4 h-4 text-accent" />}
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
    <div className="rounded-2xl border border-border bg-card card-grad p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-accent">
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tabular-nums leading-none">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
      {sparkline && <div className="mt-auto pt-3">{sparkline}</div>}
    </div>
  );
}

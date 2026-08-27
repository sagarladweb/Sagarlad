export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        {eyebrow && (
          <p className="btn-premium inline-block text-xs font-semibold uppercase tracking-[0.2em] text-brand bg-brand-light/10 rounded-full px-3.5 py-1">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

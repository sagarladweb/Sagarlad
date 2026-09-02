type BadgeVariant = "success" | "warning" | "danger" | "muted" | "accent";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/15",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/15",
  danger: "bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-red-500/15",
  muted: "bg-muted text-muted-foreground ring-1 ring-border/50",
  accent: "bg-accent/10 text-accent ring-1 ring-accent/15",
};

export function Badge({
  variant = "muted",
  className = "",
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors duration-150 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  active,
  activeLabel = "Active",
  inactiveLabel = "Hidden",
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <Badge variant={active ? "success" : "muted"}>
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <Badge variant={published ? "success" : "muted"}>
      {published ? "Published" : "Draft"}
    </Badge>
  );
}

export function CountBadge({
  count,
  active,
}: {
  count: number;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${
        active ? "bg-accent text-accent-foreground ring-accent/20" : "bg-muted text-muted-foreground ring-border/50"
      }`}
    >
      {count}
    </span>
  );
}

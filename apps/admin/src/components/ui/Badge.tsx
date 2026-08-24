type BadgeVariant = "success" | "warning" | "danger" | "muted" | "accent";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-600 dark:text-red-400",
  muted: "bg-muted text-muted-foreground",
  accent: "bg-accent/15 text-accent",
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
      className={`inline-flex items-center w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${variantStyles[variant]} ${className}`}
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
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
        active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
      }`}
    >
      {count}
    </span>
  );
}

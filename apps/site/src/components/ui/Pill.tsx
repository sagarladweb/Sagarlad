type PillProps = {
  children: React.ReactNode;
  className?: string;
};

export function Pill({ children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-brand border border-brand/20 rounded-full px-5 py-1.5 bg-brand/5 ${className}`}
    >
      {children}
    </span>
  );
}

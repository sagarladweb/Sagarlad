"use client";

type AnnouncementBarProps = {
  text: string;
  link?: string | null;
  barStyle: string;
  speed: number;
  bgColor?: string | null;
  textColor?: string | null;
};

export function AnnouncementBar({
  text,
  link,
  barStyle,
  speed,
  bgColor,
  textColor,
}: AnnouncementBarProps) {
  const duration = Math.max(8, 60 / speed);
  const bg = bgColor || "#dbeafe";
  const fg = textColor || "#1e3a5f";
  const isScrolling = barStyle === "scrolling";

  const inner = isScrolling ? (
    <div className="nl-marquee flex items-center" style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}>
      <span className="nl-marquee-text" style={{ color: fg }}>{text}</span>
      <span className="nl-marquee-text" style={{ color: fg }} aria-hidden>{text}</span>
    </div>
  ) : (
    <div className="flex items-center justify-center py-2">
      <span className="whitespace-nowrap px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide" style={{ color: fg }}>
        {text}
      </span>
    </div>
  );

  return (
    <div
      className="relative z-50 overflow-hidden border-b border-border"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-center min-h-[36px]">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 overflow-hidden">
            {inner}
          </a>
        ) : (
          <div className="flex-1 overflow-hidden">{inner}</div>
        )}
      </div>
    </div>
  );
}

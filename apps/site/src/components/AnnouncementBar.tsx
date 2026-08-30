"use client";

type AnnouncementBarProps = {
  text: string;
  link?: string | null;
  style: string;
  speed: number;
};

export function AnnouncementBar({
  text,
  link,
  style,
  speed,
}: AnnouncementBarProps) {
  const barStyle = { background: "#e8f4fd" };
  const textStyle = { color: "#1a1a2e" };
  const dotStyle = { background: "#3f88c5" };
  const duration = Math.max(8, 60 / speed);

  const scrollingText = (
    <div className="flex whitespace-nowrap" style={{ animation: `marquee ${duration}s linear infinite` }}>
      <span className="whitespace-nowrap px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide" style={textStyle}>
        {text}
      </span>
      <span className="whitespace-nowrap px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide" style={textStyle}>
        {text}
      </span>
    </div>
  );

  const staticText = (
    <div className="flex items-center justify-center py-2">
      <span className="whitespace-nowrap px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide" style={textStyle}>
        {text}
      </span>
    </div>
  );

  const content = style === "scrolling" ? scrollingText : staticText;

  return (
    <div className="relative z-50 overflow-hidden" style={barStyle}>
      <div className="flex items-center min-h-[36px]">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 overflow-hidden flex items-center gap-2"
          >
            <span className="shrink-0 ml-3 w-1.5 h-1.5 rounded-full" style={dotStyle} />
            {content}
          </a>
        ) : (
          <div className="flex-1 overflow-hidden flex items-center gap-2">
            <span className="shrink-0 ml-3 w-1.5 h-1.5 rounded-full" style={dotStyle} />
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

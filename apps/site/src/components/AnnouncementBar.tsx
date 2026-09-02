"use client";

type AnnouncementBarProps = {
  text: string;
  link?: string | null;
  style: string;
  speed: number;
  bgColor?: string | null;
  textColor?: string | null;
};

export function AnnouncementBar({
  text,
  link,
  style,
  speed,
  bgColor,
  textColor,
}: AnnouncementBarProps) {
  const duration = Math.max(8, 60 / speed);
  const bg = bgColor || "#dbeafe";
  const fg = textColor || "#1e3a5f";

  const scrollingText = (
    <div className="flex-1 overflow-hidden flex items-center min-w-0">
      <div
        className="whitespace-nowrap flex items-center"
        style={{
          animation: `marquee-right-to-left ${duration}s linear infinite`,
          width: "max-content",
        }}
      >
        <span
          className="px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide"
          style={{ color: fg }}
        >
          {text}
        </span>
        <span
          className="px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide"
          style={{ color: fg }}
          aria-hidden
        >
          {text}
        </span>
      </div>
    </div>
  );

  const staticText = (
    <div className="flex-1 flex items-center justify-center py-2">
      <span
        className="whitespace-nowrap px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide"
        style={{ color: fg }}
      >
        {text}
      </span>
    </div>
  );

  const content = style === "scrolling" ? scrollingText : staticText;

  return (
    <div
      className="relative z-50 overflow-hidden border-b border-border"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-center min-h-[36px]">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 overflow-hidden flex items-center"
          >
            {content}
          </a>
        ) : (
          <div className="flex-1 overflow-hidden flex items-center">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

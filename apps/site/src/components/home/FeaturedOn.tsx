const PRESS = [
  { name: "Packt", src: "/images/featured/packt_logo.png" },
  { name: "Apress", src: "/images/featured/apress.png" },
  { name: "BPB", src: "/images/featured/BPB.png" },
  {
    name: "Medium",
    src: "/images/featured/medium-logo-png.png",
  },
  {
    name: "YouTube",
    src: "/images/featured/YouTube_Logo.png",
  },
  { name: "C# Corner", src: "/images/featured/c%23corner.png" },
  { name: "Amazon Kindle", src: "/images/featured/amazon-kindle.png" },
];

export function FeaturedOn() {
  return (
    <section
      className="py-12 border-b border-border bg-card/40"
      aria-label="Featured in the press"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Featured on
        </p>
        <div
          data-animate-group
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-6 sm:gap-x-8"
        >
          {PRESS.map((logo) => (
            <span
              key={logo.name}
              data-animate-item
              className="flex h-10 w-24 items-center justify-center sm:h-12 sm:w-28"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.src}
                alt={logo.name}
                title={logo.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
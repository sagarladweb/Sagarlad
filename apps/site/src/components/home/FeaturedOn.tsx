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

function Logo({ name, src }: { name: string; src: string }) {
  return (
    <span className="flex h-10 w-24 items-center justify-center sm:h-12 sm:w-28">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        title={name}
        className="h-full w-full object-contain"
        loading="lazy"
      />
    </span>
  );
}

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

        {/* Mobile — seamless marquee, always scrolls left (forward) */}
        <div className="mt-8 sm:hidden marquee-mask overflow-hidden">
          <div
            className="flex w-max gap-6 animate-marquee py-2 hover:[animation-play-state:paused]"
            style={{ animationDuration: "30s" }}
          >
            {[...PRESS, ...PRESS].map((logo, i) => (
              <Logo key={`${logo.name}-${i}`} name={logo.name} src={logo.src} />
            ))}
          </div>
        </div>

        {/* Desktop — static wrap grid */}
        <div className="mt-8 hidden sm:flex flex-wrap items-center justify-center gap-x-6 gap-y-6 sm:gap-x-8">
          {PRESS.map((logo) => (
            <Logo key={logo.name} name={logo.name} src={logo.src} />
          ))}
        </div>
      </div>
    </section>
  );
}
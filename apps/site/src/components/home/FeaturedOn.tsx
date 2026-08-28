import { Pill } from "@/components/ui/Pill";

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
    <span className="flex h-10 w-24 items-center justify-center sm:h-12 sm:w-28 shrink-0">
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
      className="py-16 md:py-24 border-b border-border bg-card/40"
      aria-label="Featured in the press"
    >
      <div className="text-center">
        <Pill data-animate="blur">Featured on</Pill>

        {/* Marquee on all viewports */}
        <div className="mt-10 marquee-mask overflow-hidden">
          <div
            className="flex w-max gap-10 animate-marquee py-2 hover:[animation-play-state:paused]"
            style={{ animationDuration: "30s" }}
          >
            {[...PRESS, ...PRESS].map((logo, i) => (
              <Logo key={`${logo.name}-${i}`} name={logo.name} src={logo.src} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

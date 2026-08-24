"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { DotPagination } from "@/components/ui/CarouselNav";

const images = [
  { src: "/images/speaking/main full width image.webp", alt: "Sagar Lad delivering a keynote" },
  { src: "/images/speaking/candid.webp", alt: "Sagar Lad candid" },
  { src: "/images/speaking/candid speaking.webp", alt: "Sagar Lad speaking" },
  { src: "/images/speaking/candid presetation.webp", alt: "Sagar Lad presenting" },
  { src: "/images/speaking/too close.webp", alt: "Sagar Lad portrait" },
  { src: "/images/heroes/tedx.webp", alt: "Sagar Lad at TEDx" },
];

export function GalleryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.children[0]?.getBoundingClientRect().width ?? 1;
    const gap = 12;
    const idx = Math.round(scrollLeft / (cardWidth + gap));
    setCurrent(Math.min(idx, images.length - 1));
  }, []);

  const goTo = useCallback((i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.children[0]?.getBoundingClientRect().width ?? 1;
    const gap = 12;
    el.scrollTo({ left: i * (cardWidth + gap), behavior: "smooth" });
    setCurrent(i);
  }, []);

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 no-scrollbar"
      >
        {images.map((img) => (
          <div
            key={img.src}
            className="snap-center [scroll-snap-stop:always] shrink-0 w-[85vw] max-w-[360px] aspect-[4/3] rounded-2xl overflow-hidden relative"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="85vw"
            />
          </div>
        ))}
      </div>
      <DotPagination
        total={images.length}
        current={current}
        onChange={goTo}
        label="photo"
        className="mt-4"
      />
    </div>
  );
}

"use client";

import { Star, Quote } from "lucide-react";

const TESTIMONIALS_ROW1 = [
  {
    name: "Scottish Summit",
    role: "Summit organizer",
    stars: 5,
    quote:
      "Sagar could go deep on engineering and still keep a packed room on their feet. His session scored highest in our post-event survey.",
  },
  {
    name: "University Event Lead",
    role: "Academic organizer",
    stars: 5,
    quote:
      "He didn't just give a talk — our students left with a framework they started using the same week. Exactly why we booked him.",
  },
  {
    name: "Azure Wales Group",
    role: "Community meetup host",
    stars: 5,
    quote:
      "From the prep call to the final Q&A it was effortless. He read the room perfectly and adapted on the fly.",
  },
  {
    name: "Tech Conference Org",
    role: "Event director",
    stars: 5,
    quote:
      "Sagar's keynote was the highlight of our conference. Attendees are still talking about his practical AI framework weeks later.",
  },
  {
    name: "Corporate L&D Head",
    role: "Enterprise training lead",
    stars: 5,
    quote:
      "We've hosted dozens of speakers. Sagar was the first where people asked for a repeat session before he'd even left the building.",
  },
];

const TESTIMONIALS_ROW2 = [
  {
    name: "Startup Founder",
    role: "SaaS company CEO",
    stars: 5,
    quote:
      "Booked Sagar for our all-hands. His financial mindset talk gave the team a shared language for making smarter spending decisions.",
  },
  {
    name: "Dev Community Lead",
    role: "Regional tech community",
    stars: 5,
    quote:
      "Most speakers talk at the audience. Sagar talked with them. The energy in the room was completely different — people stayed 30 minutes after to ask questions.",
  },
  {
    name: "University Professor",
    role: "Computer Science dept.",
    stars: 5,
    quote:
      "I've invited many industry speakers. Sagar was the rare one who balanced technical depth with genuine accessibility for students at every level.",
  },
  {
    name: "HR Director",
    role: "Fortune 500 company",
    stars: 5,
    quote:
      "Sagar's session on career growth gave our team actionable steps they implemented the next day. No fluff, just real guidance.",
  },
  {
    name: "Conference Chair",
    role: "International summit",
    stars: 5,
    quote:
      "He delivered exactly what we needed — a keynote that was both inspiring and practical. Our highest-rated session of the entire event.",
  },
];

function StarRating({ stars, size = "w-3 h-3" }: { stars: number; size?: string }) {
  const full = Math.floor(stars);
  const empty = 5 - full;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className={`${size} fill-accent text-accent`} />
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className={`${size} text-muted-foreground/25`} />
      ))}
    </div>
  );
}

function TestimonialCard({
  t,
}: {
  t: { name: string; role: string; stars: number; quote: string };
}) {
  return (
    <div className="w-[260px] sm:w-[300px] shrink-0 flex flex-col p-4 sm:p-5 rounded-2xl border border-border bg-card card-hover">
      <div className="mb-2.5">
        <StarRating stars={t.stars} />
      </div>
      <blockquote className="font-display text-[12px] sm:text-[13px] font-medium leading-relaxed text-foreground/80 line-clamp-4 flex-1">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="font-display text-xs font-bold text-foreground truncate">
          {t.name}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">{t.role}</p>
      </div>
    </div>
  );
}

export function SpeakingTestimonials() {
  return (
    <>
      {/* Mobile — marquee */}
      <div className="md:hidden space-y-4 overflow-hidden">
        <div className="marquee-mask marquee-pauser mb-4">
          <div
            className="flex w-max gap-4 animate-marquee"
            style={{ animationDuration: "40s", animationDelay: "-12s" }}
          >
            {[...TESTIMONIALS_ROW1, ...TESTIMONIALS_ROW1].map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>
        <div className="marquee-mask marquee-pauser">
          <div
            className="flex w-max gap-4 animate-marquee-reverse"
            style={{ animationDuration: "44s", animationDelay: "-18s" }}
          >
            {[...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2].map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop — grid */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-5">
        <blockquote className="card-hover rounded-lg border border-border bg-card p-7 sm:p-9 flex flex-col justify-between gap-6 lg:col-span-6 lg:row-span-2">
          <Quote className="w-6 h-6 text-accent-strong" aria-hidden="true" />
          <p className="text-foreground/85 leading-relaxed text-lg">
            &ldquo;Sagar could go deep on engineering and still keep a packed
            room on their feet. His session scored highest in our post-event
            survey.&rdquo;
          </p>
          <footer className="border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
            Summit organizer · Scottish Summit
          </footer>
        </blockquote>
        <blockquote className="card-hover rounded-lg border border-border bg-card p-7 sm:p-9 flex flex-col justify-between gap-6 lg:col-span-6">
          <Quote className="w-6 h-6 text-accent-strong" aria-hidden="true" />
          <p className="text-foreground/85 leading-relaxed text-sm">
            &ldquo;He didn&apos;t just give a talk — our students left with a
            framework they started using the same week. Exactly why we booked
            him.&rdquo;
          </p>
          <footer className="border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
            University event lead
          </footer>
        </blockquote>
        <blockquote className="card-hover rounded-lg border border-border bg-card p-7 sm:p-9 flex flex-col justify-between gap-6 lg:col-span-6">
          <Quote className="w-6 h-6 text-accent-strong" aria-hidden="true" />
          <p className="text-foreground/85 leading-relaxed text-sm">
            &ldquo;From the prep call to the final Q&A it was effortless. He
            read the room perfectly and adapted on the fly.&rdquo;
          </p>
          <footer className="border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
            Community meetup host
          </footer>
        </blockquote>
      </div>
    </>
  );
}

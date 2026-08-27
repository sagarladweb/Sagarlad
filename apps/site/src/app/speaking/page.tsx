import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Mic,
  Globe,
  Award,
  Calendar,
  CheckCircle2,
  Quote,
  Cloud,
  GraduationCap,
  BadgeCheck,
  Trophy,
  HeartHandshake,
} from "lucide-react";
import { SITE, pageMetadata } from "@/lib/site";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { GalleryCarousel } from "@/components/speaking/GalleryCarousel";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Public Speaking & Keynotes",
  description:
    "Sagar Lad delivers high-impact keynotes on AI & Data Leadership, Financial Mindset, and Career Growth at summits, tech conferences, and campuses worldwide.",
  path: "/speaking",
  ogImage: "/images/heroes/speaking.webp",
});

// Trust-ladder ordering: hook → see him speak (video) → who has trusted him
// (stages) → credentials → what the room gets (delivery) → how it works
// (process + booking) → proof from organizers (testimonials) → ask.
// Video sits high because watching the speaker is the #1 deciding factor for
// event organizers; testimonials sit last so the final impression before the
// booking ask is other people vouching for the result.

const eventsHosted = [
  {
    title: "Scottish Summit",
    place: "Scotland",
    role: "Tech conference",
    icon: Cloud,
  },
  {
    title: "Azure Wales Group",
    place: "Wales",
    role: "Community meetup",
    icon: Globe,
  },
  {
    title: "Indian Institute of Chemical Engineers",
    place: "Centre of Excellence",
    role: "Academic",
    icon: GraduationCap,
  },
  {
    title: "Azure Summit",
    place: "Global",
    role: "International summit",
    icon: Award,
  },
];

const memberships = [
  {
    title: "Microsoft Certified Trainer",
    desc: "Certified to deliver Azure, AI & data training",
    icon: BadgeCheck,
  },
  {
    title: "C# Corner MVP",
    desc: "Recognized community leader & contributor",
    icon: Trophy,
  },
  {
    title: "Toastmasters",
    desc: "Trained in communication & leadership",
    icon: Mic,
  },
  {
    title: "Lions Club Member",
    desc: "Serving communities beyond the stage",
    icon: HeartHandshake,
  },
];

const processSteps = [
  {
    n: "01",
    title: "Reach out & align",
    text: "Share your event's theme, audience, and goals — I'll map the right talk, format, and length.",
    bullets: ["Kick-off call", "Theme & goals scoped"],
  },
  {
    n: "02",
    title: "We co-create",
    text: "A planning call shapes the narrative, then I deliver polished decks, bio, and media assets on day one.",
    bullets: ["Planning call", "Decks, bio & media ready"],
  },
  {
    n: "03",
    title: "Deliver & follow up",
    text: "An energetic session with live Q&A, plus a one-page takeaway sheet attendees can keep.",
    bullets: ["Live session + Q&A", "Takeaway sheet"],
  },
];

const testimonials = [
  {
    quote:
      "Sagar could go deep on engineering and still keep a packed room on their feet. His session scored highest in our post-event survey.",
    attribution: "Summit organizer · Scottish Summit",
  },
  {
    quote:
      "He didn't just give a talk — our students left with a framework they started using the same week. Exactly why we booked him.",
    attribution: "University event lead",
  },
  {
    quote:
      "From the prep call to the final Q&A it was effortless. He read the room perfectly and adapted on the fly.",
    attribution: "Community meetup host",
  },
];

export default function SpeakingPage() {
  return (
    <div className="bg-background overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Speaking", item: `${SITE.url}/speaking` },
          ],
        }}
      />
      {/* Stage Hero — full-bleed landscape, copy overlaid on the dark left zone */}
      <section className="relative -mt-16 min-h-[calc(100svh+4rem)] bg-foreground text-background overflow-hidden border-b border-border">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/images/heroes/speaking.webp"
            alt=""
            fill
            priority
            className="object-cover object-center hero-drift"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end pb-20 sm:pb-28 pt-32">
          <div className="max-w-2xl space-y-5 text-center sm:text-left mx-auto sm:mx-0">
            <span className="btn-premium inline-flex items-center justify-center sm:justify-start rounded-full bg-accent px-4 py-1.5 text-xs font-semibold tracking-wide text-accent-foreground shadow-md">
              Speaking
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-md">
              Ideas that ignite rooms and transform mindsets.
            </h1>
            <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-2xl drop-shadow-sm font-medium">
              Delivering story-driven, actionable keynotes on AI leadership, financial freedom, and career momentum for summits, universities, and enterprise events worldwide.
            </p>
            <div className="pt-2 flex flex-col gap-4 items-center sm:flex-row sm:items-center">
              <Link
                href="/speaking/contact"
                className="btn-premium inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3.5 text-sm font-semibold hover:opacity-95 shadow-xl w-full sm:w-auto"
              >
                Inquire about speaking <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://sessionize.com/sagar-lad/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium inline-flex items-center justify-center gap-2 rounded-full border border-white/40 backdrop-blur-xl bg-black/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-black/50 w-full sm:w-auto"
              >
                View Sessionize profile ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TEDx Spotlight — the strongest proof, right after the hook */}
      <section className="card-hover relative py-20 md:py-28 border-b border-border bg-card/60 overflow-hidden" aria-label="Sagar's TEDx talk">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 text-center lg:text-left" data-animate="left">
              <span className="btn-premium inline-flex items-center justify-center lg:justify-start rounded-full bg-brand-light/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand">
                Watch
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold leading-tight text-accent-strong">
                The AI talk he gives on every stage
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                From TEDx to AI keynotes, Sagar turns artificial intelligence
                into something a room can actually use — cutting through the hype
                to the decisions leaders, teams, and students face today.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "AI without the hype — what's real, what's noise",
                  "Leading with AI without losing the human touch",
                  "A practical playbook you can apply the same day",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-accent-strong shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7" data-animate="right">
              <VideoPlayer
                title="TEDx — The MIND UP message"
                src="https://www.youtube.com/embed/G5F3kJ-lsYk"
                thumb="/images/heroes/tedx.webp"
                platform="youtube"
                pauseOnLeave
                overlay={
                  <div
                    className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                    aria-hidden="true"
                  >
                    <span className="absolute bottom-4 left-5 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                      Sagar Lad · Keynote &amp; Educator
                    </span>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Videos & Photos — bento on desktop, horizontal snap carousel on mobile */}
      <section className="border-b border-border bg-muted/30 py-20 md:py-24 overflow-hidden" aria-label="Videos and photos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile: horizontal snap carousel */}
          <div className="lg:hidden">
            <GalleryCarousel />
          </div>

          {/* Desktop: bento grid */}
          <div className="hidden lg:grid grid-cols-12 gap-3 sm:gap-4">
            {/* Large feature — left, spans 2 rows on desktop */}
            <div className="sm:col-span-2 lg:col-span-7 lg:row-span-2 rounded-xl overflow-hidden relative group min-h-[280px] sm:min-h-[400px] lg:min-h-0">
              <Image
                src="/images/speaking/main full width image.webp"
                alt="Sagar Lad delivering a keynote"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 58vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* Top right */}
            <div className="sm:col-span-1 lg:col-span-5 rounded-xl overflow-hidden relative group aspect-[4/3] min-h-[200px]">
              <Image
                src="/images/speaking/candid.webp"
                alt="Sagar Lad candid"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* Bottom right */}
            <div className="sm:col-span-1 lg:col-span-5 rounded-xl overflow-hidden relative group aspect-[4/3] min-h-[200px]">
              <Image
                src="/images/speaking/candid speaking.webp"
                alt="Sagar Lad speaking"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* Bottom row — 3 equal cards on desktop */}
            <div className="sm:col-span-2 lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { src: "/images/speaking/candid presetation.webp", alt: "Sagar Lad presenting" },
                { src: "/images/speaking/too close.webp", alt: "Sagar Lad portrait" },
                { src: "/images/heroes/tedx.webp", alt: "Sagar Lad at TEDx" },
              ].map((img) => (
                <div
                  key={img.src}
                  className="rounded-xl overflow-hidden relative group aspect-[4/3] min-h-[160px]"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 26vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stages & Credentials — visually rich unified grid section */}
      <section className="border-b border-border bg-background py-20 md:py-24" aria-label="Stages and Credentials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          {/* Events Hosted — divided list */}
          <div data-animate>
            <div className="max-w-2xl mb-10 text-center sm:text-left mx-auto sm:mx-0">
              <span className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">Where I've spoken</span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-accent-strong">Stages he&apos;s graced</h2>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                Keynotes delivered across regional tech groups, academic institutions, and international summits.
              </p>
            </div>
            <div className="card-hover rounded-lg border border-border divide-y divide-border overflow-hidden bg-card">
              {eventsHosted.map((e, i) => {
                const Icon = e.icon;
                return (
                  <div
                    key={e.title}
                    className="group flex items-center gap-4 sm:gap-6 px-6 sm:px-8 py-5 transition-colors hover:bg-muted/40"
                  >
                    <span className="w-8 shrink-0 font-display text-lg sm:text-xl font-extrabold text-muted-foreground/35 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent/10 text-accent-strong transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base sm:text-lg font-bold leading-snug group-hover:text-accent-strong transition-colors">
                        {e.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{e.role}</p>
                      <span className="mt-1.5 inline-flex rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:hidden">
                        {e.place}
                      </span>
                    </div>
                    <span className="hidden sm:inline-flex shrink-0 rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {e.place}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Memberships & Certifications — 2-col hairline grid */}
          <div data-animate>
            <div className="max-w-2xl mb-10 text-center sm:text-left mx-auto sm:mx-0">
              <span className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">Background</span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-accent-strong">Certifications &amp; Memberships</h2>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                Trained in public speaking, certified in enterprise AI, and actively serving global technical communities.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
              {memberships.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.title}
                    className="card-hover group bg-card p-6 sm:p-7 flex flex-col justify-between min-h-[150px] transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Icon className="w-5 h-5 text-accent-strong" />
                      <span className="btn-premium inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-strong">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="font-display text-base font-bold leading-snug group-hover:text-accent-strong transition-colors">
                        {m.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Professional Experience — how the engagement works, then the ask */}
      <section className="card-hover py-20 md:py-28 border-b border-border bg-card/40" aria-label="Professional experience">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl text-center sm:text-left mx-auto sm:mx-0" data-animate>
            <span className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">How it works</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-accent-strong">A calm, three-step process</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              No last-minute scrambles. Every engagement follows the same rhythm, so you know exactly what to expect.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6" data-animate-group>
            {processSteps.map((step, i) => (
              <div
                key={step.n}
                className={`group rounded-lg border border-border bg-card p-7 sm:p-8 transition-all duration-200 hover:border-brand-light/70 hover:shadow-md ${
                  i === 0 ? "lg:col-span-7" : "lg:col-span-5"
                }`}
                data-animate-item
              >
                <span className="inline-grid place-items-center w-12 h-12 rounded-md bg-accent/15 font-display text-lg font-extrabold text-accent-strong">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {step.bullets.map((b) => (
                    <li
                      key={b}
                      className="btn-premium inline-flex items-center gap-1.5 text-xs text-foreground bg-foreground/5 px-3 py-1.5 rounded-full"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Booking card fills the grid */}
            <div className="card-hover lg:col-span-7 relative overflow-hidden rounded-lg border border-border bg-card p-8 sm:p-10 shadow-xl flex flex-col md:flex-row md:items-center gap-8" data-animate-item>
              <span aria-hidden="true" className="pointer-events-none absolute -top-24 -left-10 h-48 w-72 rounded-full bg-accent/15 blur-3xl" />
              <div className="relative shrink-0 mx-auto md:mx-0">
                <div className="w-16 h-16 rounded-md bg-accent grid place-items-center text-accent-foreground">
                  <Calendar className="w-8 h-8" />
                </div>
              </div>
              <div className="relative flex-1 text-center md:text-left space-y-3">
                <h3 className="font-display text-xl sm:text-2xl font-bold">Ready to book Sagar for your next event?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Invite Sagar Lad to speak at your conference, company, university, podcast, or event.
                </p>
                <Link
                  href="/speaking/contact"
                  className="btn-premium mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3.5 text-sm font-semibold hover:opacity-95 shadow-md"
                >
                  Contact For Speaking <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizer voices — final proof before the ask */}
      <section className="py-20 md:py-28 bg-background" aria-label="What organizers say">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center" data-animate>
            <span className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">Kind words</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-accent-strong">Rooms Remember It</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-5" data-animate-group>
            {testimonials.map((t, i) => (
              <blockquote
                key={t.quote}
                className={`rounded-lg border border-border bg-card p-7 sm:p-9 flex flex-col justify-between gap-6 transition-all duration-200 hover:border-brand-light/70 hover:shadow-md ${
                  i === 0 ? "lg:col-span-6 lg:row-span-2" : "lg:col-span-6"
                }`}
                data-animate-item
              >
                <Quote className="w-6 h-6 text-accent-strong" aria-hidden="true" />
                <p className={`text-foreground/85 leading-relaxed ${i === 0 ? "text-lg" : "text-sm"}`}>{t.quote}</p>
                <footer className="border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                  {t.attribution}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
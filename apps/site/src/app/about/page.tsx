"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ArrowRight, Trophy, Medal, Footprints } from "lucide-react";
import { SocialLinks } from "@/components/SocialLinks";
import { SiteLogo } from "@/components/SiteLogo";

import { METRICS } from "@/lib/metrics";

const stats = [
  { value: `${METRICS.yearsExperience}+`, label: "Years in tech & data" },
  { value: `${METRICS.countriesWorked}+`, label: "Countries lived & worked" },
  { value: `${METRICS.booksPublished}+`, label: "Books published" },
  { value: METRICS.communityReached, label: "Community reached" },
];

const plan = [
  {
    n: "01",
    title: "Study computer engineering",
    text: "A first step that a kid from a modest home in India could barely dare to dream of.",
  },
  {
    n: "02",
    title: "Grow in the IT industry",
    text: "Rise fast and learn from global enterprise leaders, working closely with CXOs across Europe.",
  },
  {
    n: "03",
    title: "Give back to society",
    text: "Turn everything learned into published books, mentorship, and free education.",
  },
];

const pageNav = [
  ["belief", "The Belief"],
  ["journey", "My Journey"],
  ["running", "Runner for Life"],
  ["connect", "Connect"],
];

const chapters = [
  {
    period: "2009",
    title: "School education",
    text: "Years of relentless effort pay off — I earn my place at a top university for computer engineering.",
    tag: "Education",
  },
  {
    period: "2009 – 2013",
    title: "B.E. Computer Engineering · BVM College",
    text: "The foundation of my technical career begins in earnest.",
    tag: "Education",
  },
  {
    period: "Oct 2013 – Now",
    title: "TCS",
    text: "My professional journey begins — and soon takes me to Europe.",
    tag: "Career",
  },
  {
    period: "2019 – 2020",
    title: "PG in Data Science · IIIT Bangalore",
    text: "The year that reshaped how I think, learn, and solve problems.",
    tag: "Education",
  },
  {
    period: "2025 – 2026",
    title: "Masters in Gen AI · Purdue University",
    text: "Sharpening the frontier — artificial intelligence, done right.",
    tag: "Education",
  },
  {
    period: "Feb 2022 – Mar 2026",
    title: "Six books published",
    text: "First book in February 2022, sixth in March 2026 — writing alongside a full career.",
    tag: "Author",
  },
  {
    period: "Jun 2026",
    title: "First TEDx speech",
    text: "Give Speech on AI to the TEDx stage.",
    tag: "Speaker",
  },
];

export default function AboutPage() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 36, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, el);

    // ScrollTrigger measured positions before fonts/images settled, which on
    // mobile leaves below-fold sections stuck at opacity 0. Recalibrate once
    // layout is stable so every section reveals correctly on all devices.
    const refresh = () => ScrollTrigger.refresh();
    window.setTimeout(refresh, 0);
    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }
    window.addEventListener("load", refresh, { once: true });

    return () => ctx.revert();
  }, []);

  // Sub-nav scrollspy: highlight the section currently under the sticky bar.
  useEffect(() => {
    const el = root.current;
    const links = Array.from(el?.querySelectorAll<HTMLElement>("[data-subnav]") ?? []);
    const ids = links.map((l) => l.dataset.target as string);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((s): s is HTMLElement => !!s);

    const setActive = (id: string) =>
      links.forEach((l) =>
        l.setAttribute("data-active", l.dataset.target === id ? "true" : "false")
      );

    const onScroll = () => {
      let current = ids[0];
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= 160) current = s.id;
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = ids[ids.length - 1];
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={root} className="bg-background overflow-x-clip">
      {/* ---------- Visual Hero ---------- */}
      <section className="relative overflow-hidden border-b border-border pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="pointer-events-none absolute -top-40 right-10 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" aria-hidden="true" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="order-2 lg:order-none lg:col-span-7 space-y-6 text-center lg:text-left">
              <span
                data-reveal
                className="inline-flex items-center rounded-full bg-brand-light/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand"
              >
                Full Story &amp; Biography
              </span>
              <h1
                data-reveal
                className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-foreground"
              >
                A story of almost nothing,{" "}
                <span className="text-muted-foreground">and everything.</span>
              </h1>
              <p
                data-reveal
                className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl"
              >
                Data &amp; AI Architect by profession, TEDx Speaker, and
                published author of 6+ books. Founder of the MIND UP Framework —
                a system for thinking clearly and acting intentionally.
              </p>
              <p
                data-reveal
                className="mt-4 border-l-2 border-accent pl-4 font-display text-base sm:text-lg font-semibold leading-snug text-foreground text-center lg:text-left"
              >
                People don&apos;t make poor choices — they make the best choices
                they can with the information they have.
              </p>
              <div data-reveal className="mt-2 inline-block">
                <SiteLogo className="h-12 w-auto" />
              </div>
            </div>

            {/* Visual Portrait */}
            <div data-reveal className="order-1 lg:order-none lg:col-span-5 relative">
              <div className="relative max-w-md mx-auto">
                <div aria-hidden="true" className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-brand-light/20 to-brand-light/10 blur-2xl opacity-75" />
                <figure className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-border shadow-2xl bg-card">
                  <Image
                    src="/images/heroes/hero.webp"
                    alt="Sagar Lad"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-top"
                    priority
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <figcaption className="absolute bottom-0 inset-x-0 p-6 text-white">
                    <p className="font-display text-xl font-bold">Sagar Lad</p>
                    <p className="text-xs text-white/80">Author · Investor · Public Speaker</p>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- In-page navigation ---------- */}
      <nav
        aria-label="On this page"
        className="sticky top-16 z-40 border-b border-border bg-background/90 backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="no-scrollbar flex items-center justify-start gap-2 overflow-x-auto px-1 py-3 md:justify-center">
            {pageNav.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                data-subnav
                data-target={id}
                className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[active=true]:bg-brand data-[active=true]:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ---------- Stats Band ---------- */}
      <section
        data-reveal
        className="border-b border-border bg-card/40 py-10"
        aria-label="Quick facts about Sagar"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col text-center md:text-left">
                <dt className="order-2 mt-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="order-1 font-display text-4xl md:text-5xl font-extrabold text-accent-strong">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- The Belief / Philosophy ---------- */}
      <section id="belief" className="scroll-mt-32 py-20 md:py-28 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p data-reveal className="text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">
            What I believe
          </p>
          <h2
            data-reveal
            className="mt-4 font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-snug"
          >
            People don&apos;t make poor choices — they make the best choices
            they can with the information they have.
          </h2>
          <p data-reveal className="mt-6 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-sm sm:text-base">
            My ambition is to expand that information and broaden perspective.
            I create content at the intersection of AI, finance, self-growth,
            and real-life decision-making — translating insights from books,
            data, and everyday experience into practical guidance. So that
            people can make life choices from a place of{" "}
            <span className="text-foreground font-semibold">awareness, not autopilot.</span>
          </p>
          <p data-reveal className="mt-8 font-display text-2xl sm:text-3xl font-bold text-accent-strong">
            Mindset shapes reality. <span className="italic">MIND UP.</span>
          </p>
        </div>
      </section>

      {/* ---------- Rules I live by ---------- */}
      <section className="py-24 md:py-32 border-b border-border bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p data-reveal className="text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">
            A rule I live by
          </p>
          <h2
            data-reveal
            className="mt-8 font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight"
          >
            Be Dumb.{" "}
            <span className="text-accent-strong">
              Don&apos;t worry about what others think.
            </span>
          </h2>
          <p
            data-reveal
            className="mt-7 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            A razor is a rule you cut your life with. Mine is a reminder to stay
            curious, keep asking the &ldquo;dumb&rdquo; questions, and never let
            the noise of other people&apos;s opinions decide my next step.
          </p>
        </div>
      </section>

      {/* ---------- Growing Up ---------- */}
      <section id="journey" className="scroll-mt-32 py-20 md:py-28 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span data-reveal className="text-xs font-bold uppercase tracking-wider text-accent-strong">Modest Beginnings</span>
            <h2 data-reveal className="mt-2 font-display text-3xl sm:text-4xl font-bold">
              I always knew what I wanted
            </h2>
            <p data-reveal className="mt-4 text-muted-foreground leading-relaxed">
              Growing up with almost nothing, money was always tight and
              travelling the world felt borderline impossible. But my parents
              never compromised on education — believing, unwaveringly, that my
              sisters and I would change the trajectory of our family.
            </p>
            <p data-reveal className="mt-4 text-muted-foreground leading-relaxed">
              I had a three-step plan:
            </p>

            <div className="mt-8 space-y-4">
              {plan.map((step) => (
                <div
                  key={step.n}
                  data-reveal
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-brand-light/70 hover:shadow-lg"
                >
                  <span className="font-display text-2xl font-bold text-accent-strong">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal className="relative">
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] max-w-md mx-auto border border-border shadow-2xl">
              <Image
                src="/images/heroes/hero.webp"
                alt="Sagar Lad"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Milestones / Chapters ---------- */}
      <section className="py-20 md:py-28 border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
            <span data-reveal className="text-xs font-bold uppercase tracking-wider text-accent-strong">Milestones</span>
            <h2 data-reveal className="mt-2 font-display text-3xl sm:text-4xl font-bold">
              The story, in dates
            </h2>
            <p data-reveal className="mt-4 text-muted-foreground leading-relaxed">
              Education, career, books, and the first talk — every milestone
              that made today possible.
            </p>
          </div>

          <div className="mt-12">
            {chapters.map((c) => (
              <div
                key={c.title}
                data-reveal
                className="group grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-10 border-b border-border py-7 last:border-b-0 items-start"
              >
                <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-accent-strong">
                  {c.period}
                </span>
                <div>
                  <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-strong">
                    {c.tag}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug group-hover:text-accent-strong transition-colors">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Runner for Life ---------- */}
      <section id="running" className="scroll-mt-32 py-20 md:py-28 border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 text-center lg:text-left">
              <span data-reveal className="text-xs font-bold uppercase tracking-wider text-accent-strong">Beyond The Code</span>
              <h2 data-reveal className="mt-2 font-display text-3xl sm:text-4xl font-bold">
                Runner for life
              </h2>
              <p data-reveal className="mt-4 text-muted-foreground leading-relaxed">
                MIND UP isn&apos;t just something I write about — I live it. Running
                is where I practice the discipline I preach: one step at a time,
                showing up again and again, until the distance becomes part of you.
              </p>
              <div data-reveal className="mt-6 flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                <Footprints className="w-5 h-5 text-accent-strong shrink-0 mt-0.5" />
                <span>
                  Seven races across three distances — every medal a reminder
                  that consistency beats intensity.
                </span>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  {
                    icon: Medal,
                    race: "TCS Amsterdam Half Marathon",
                    distance: "21 km",
                    count: "×3",
                  },
                  {
                    icon: Trophy,
                    race: "TCS Amsterdam Marathon",
                    distance: "8 km",
                    count: "×2",
                  },
                  {
                    icon: Trophy,
                    race: "Amsterdam DAM to DAM",
                    distance: "16 km",
                    count: "×2",
                  },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.race}
                      data-reveal
                      className="rounded-2xl border border-border bg-background p-6 text-center hover:border-brand-light/60 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="mx-auto w-12 h-12 rounded-xl bg-brand-light/15 grid place-items-center text-brand">
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="mt-4 font-display text-3xl font-extrabold text-accent-strong">
                        {r.count}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {r.race}
                      </p>
                      <p className="mt-1 text-sm font-bold">{r.distance}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Connect CTA ---------- */}
      <section id="connect" className="scroll-mt-32 py-20 md:py-28 bg-card/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <h2 data-reveal className="font-display text-3xl sm:text-4xl font-bold">
            Come say hi &amp; connect.
          </h2>
          <p data-reveal className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            I&apos;m active on YouTube, LinkedIn, and C# Corner. Reach out for
            speaking, book discussions, or tech advice.
          </p>
          <div data-reveal className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3.5 text-sm font-semibold hover:opacity-95 transition-opacity shadow-lg"
            >
              Get in touch <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/speaking/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Book for a talk
            </Link>
          </div>
          <div data-reveal className="pt-6 flex justify-center">
            <SocialLinks />
          </div>
        </div>
      </section>
    </div>
  );
}

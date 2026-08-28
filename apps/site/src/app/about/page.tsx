"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ArrowRight, Trophy, Medal, Footprints } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { Timeline } from "@/components/about/Timeline";

import { METRICS } from "@/lib/metrics";

const stats = [
  { value: Number(METRICS.yearsExperience), suffix: "+", label: "Years in tech & data" },
  { value: Number(METRICS.countriesWorked), suffix: "+", label: "Countries lived & worked" },
  { value: Number(METRICS.booksPublished), suffix: "+", label: "Books published" },
  { value: Number(METRICS.communityReached.replace(/[^0-9]/g, "")), suffix: "K+", label: "Community reached" },
];

const pageNav = [
  ["belief", "The Belief"],
  ["journey", "My Journey"],
  ["running", "Runner for Life"],
  ["connect", "Connect"],
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

  // Counting animation for stat numbers
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>("[data-stat]").forEach((card) => {
        const numEl = card.querySelector("[data-stat-num]");
        if (!numEl) return;
        const target = Number(card.dataset.stat || "0");
        const suffix = card.dataset.statSuffix || "";
        numEl.textContent = `${target.toLocaleString("en-US")}${suffix}`;
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((card, i) => {
        const numEl = card.querySelector("[data-stat-num]");
        if (!numEl) return;
        const target = Number(card.dataset.stat || "0");
        const suffix = card.dataset.statSuffix || "";
        const counter = { v: 0 };
        const render = () => {
          numEl.textContent = `${Math.round(counter.v).toLocaleString("en-US")}${suffix}`;
        };
        render();
        gsap.fromTo(
          counter,
          { v: 0 },
          {
            v: target,
            duration: 2,
            delay: i * 0.08,
            ease: "power2.out",
            onUpdate: render,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="bg-background overflow-x-clip">
      {/* ---------- Visual Hero ---------- */}
      <section className="relative -mt-16 min-h-[calc(100svh+4rem)] border-b border-border bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/about me hero.webp"
            alt="About Sagar Lad"
            fill
            priority
            className="object-cover object-[63%_50%] sm:object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end py-12 sm:py-32">
          <div className="max-w-3xl text-center sm:text-left mt-auto" style={{ display: "grid", gap: "0" }}>
            <div data-reveal className="mb-4">
              <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/70 border border-white/20 rounded-full px-5 py-1.5">
                The full story
              </span>
            </div>
            
            <h1 data-reveal className="mb-6 font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-white">
              A story of almost nothing,{" "}
              <span className="text-accent">and everything.</span>
            </h1>

            <p data-reveal className="mb-8 text-base sm:text-lg text-white/75 leading-relaxed max-w-xl">
              Data &amp; AI Architect by profession, TEDx Speaker, and
              published author of 6+ books. Founder of the MIND UP Framework —
              a system for thinking clearly and acting intentionally.
            </p>

            <p data-reveal className="mb-10 border-l-2 border-accent pl-4 font-display text-base sm:text-lg font-semibold leading-snug text-white/90 text-left max-w-xl mx-auto sm:mx-0">
              People don&apos;t make poor choices — they make the best choices
              they can with the information they have.
            </p>

            <div data-reveal className="mt-2">
              <SiteLogo light className="h-12 w-auto mx-auto sm:mx-0" />
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
                className="shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[active=true]:bg-brand data-[active=true]:text-white"
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
        className="card-hover border-b border-border bg-card/40 py-10"
        aria-label="Quick facts about Sagar"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                data-stat={s.value}
                data-stat-suffix={s.suffix}
                className="flex flex-col text-center md:text-left"
              >
                <dt className="order-2 mt-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="order-1 font-display text-4xl md:text-5xl font-extrabold text-accent-strong tabular-nums">
                  <span data-stat-num>0{s.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- The Belief / Philosophy ---------- */}
      <section id="belief" className="scroll-mt-32 py-20 md:py-28 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p data-reveal className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
            What drives me
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
          <p data-reveal className="mt-8 font-display text-2xl sm:text-3xl font-bold">
            Mindset shapes reality.{" "}
            <span className="btn-premium inline-block bg-accent text-black px-3 py-0.5">
              MIND UP.
            </span>
          </p>
        </div>
      </section>

      {/* ---------- Rules I live by ---------- */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p data-reveal className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
            Current Life Razor
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

      {/* ---------- Journey Timeline ---------- */}
      <div id="journey" className="scroll-mt-32">
        <Timeline />
      </div>

      {/* ---------- Runner for Life ---------- */}
      <section id="running" className="card-hover scroll-mt-32 py-16 md:py-28 border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Header — center on mobile, left on desktop */}
          <div className="text-center lg:text-left mb-10 md:mb-14">
            <span data-reveal className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">Off the clock</span>
            <h2 data-reveal className="mt-3 font-display text-3xl sm:text-4xl font-bold">
              Runner for life
            </h2>
            <p data-reveal className="mt-4 text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              MIND UP isn&apos;t just something I write about — I live it. Running
              is where I practice the discipline I preach: one step at a time,
              showing up again and again, until the distance becomes part of you.
            </p>
            <div data-reveal className="mt-5 flex items-start gap-3 text-sm text-muted-foreground leading-relaxed justify-center lg:justify-start">
              <Footprints className="w-5 h-5 text-accent-strong shrink-0 mt-0.5" />
              <span>
                Seven races across three distances — every medal a reminder
                that consistency beats intensity.
              </span>
            </div>
          </div>

          {/* Race cards — horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
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
                  className="snap-center shrink-0 w-[200px] md:w-auto rounded-xl border border-border bg-background p-5 text-center transition-all duration-200 hover:border-brand-light/70 hover:shadow-md"
                >
                  <div className="mx-auto w-10 h-10 rounded-lg bg-brand-light/15 grid place-items-center text-brand">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="mt-3 font-display text-2xl font-extrabold text-accent-strong">
                    {r.count}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    {r.race}
                  </p>
                  <p className="mt-1 text-sm font-bold">{r.distance}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Connect CTA ---------- */}
      <section id="connect" className="card-hover scroll-mt-32 py-20 md:py-28 bg-card/50">
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
              className="btn-premium inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3.5 text-sm font-semibold hover:opacity-95 shadow-lg"
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
        </div>
      </section>
    </div>
  );
}

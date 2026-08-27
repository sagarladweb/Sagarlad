"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  UserCheck,
  Target,
  FileText,
  Brain,
  ChevronDown,
  Star,
  Calendar,
  ArrowDown,
  ShieldCheck,
} from "lucide-react";

// Mentorship Metrics Data
const METRICS = [
  { value: 50, suffix: "+", label: "Mentees Mentored", subtext: "Engineers, leads & creators" },
  { value: 98, suffix: "%", label: "Success Rate", subtext: "5-star direct feedback" },
  { value: 10, suffix: "+", label: "Years Experience", subtext: "Data, Cloud & AI Architecture" },
  { value: 100, suffix: "+", label: "Hours 1:1 Mentored", subtext: "High-impact strategy calls" },
];

// What We Cover Pillars
const PILLARS = [
  {
    icon: Target,
    title: "Career Guidance",
    description:
      "Clear roadmap for promotions, career switches, and long-term growth.",
    highlight: "Clear Career Roadmap",
  },
  {
    icon: FileText,
    title: "Resume & LinkedIn Review",
    description:
      "Improve your profile to get more interview callbacks.",
    highlight: "Double Your Callbacks",
  },
  {
    icon: Brain,
    title: "Personal Development",
    description:
      "Build confidence, communication, focus, and daily discipline.",
    highlight: "Unshakable Focus",
  },
  {
    icon: UserCheck,
    title: "Career Strategy",
    description:
      "Actionable advice to make better career decisions and grow faster.",
    highlight: "Grow Faster",
  },
];

// Text-Based Testimonials
const TESTIMONIALS = [
  {
    quote:
      "30 minutes with Sagar gave me more clarity than months of online advice. His resume blueprint landed me 3 callbacks in two weeks.",
    name: "Priya Sharma",
    role: "Senior Data Engineer",
    rating: 5,
  },
  {
    quote:
      "Stuck for a year. Sagar broke my career goals into daily actions. Two months later — promoted.",
    name: "Rohit Kulkarni",
    role: "Cloud Architect",
    rating: 5,
  },
  {
    quote:
      "No sugar-coating. He spotted critical flaws in my interview strategy I was completely blind to. Fixed them same session.",
    name: "Ankit Srivastava",
    role: "Full Stack Lead",
    rating: 4,
  },
  {
    quote:
      "Beyond tech skills — he taught me executive presence and how to communicate value to leaders. That changed everything.",
    name: "Neha Deshmukh",
    role: "Product Lead",
    rating: 5,
  },
];

// Collapsible FAQ Accordion Data
const FAQS = [
  {
    question: "Who is 1:1 mentorship for?",
    answer:
      "1:1 mentorship is designed for software engineers, data architects, tech leads, and professionals who want honest, practical guidance on career growth, technical positioning, resume teardowns, or personal mindset.",
  },
  {
    question: "How should I prepare for our session?",
    answer:
      "Bring your specific questions, resume/LinkedIn link, or current career bottleneck. The clearer your objectives, the more actionable value we can pack into our 1:1 time.",
  },
  {
    question: "What happens after I select a time?",
    answer:
      "You will receive an instant Google Calendar invite with your unique Google Meet link. You can also share pre-session notes so Sagar can review your context before the call.",
  },
  {
    question: "Can I schedule recurring check-ins?",
    answer:
      "Yes! Many mentees book recurring bi-weekly or monthly sessions to track milestone execution, run mock interviews, and refine their long-term growth roadmap.",
  },
  {
    question: "Are actionable notes provided after the call?",
    answer:
      "Every call concludes with clear, prioritized action items. You are also welcome to record the session for your personal reference.",
  },
];

// Smooth Count-Up Number Component
function StatCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 1600;
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = target / steps;

          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, stepTime);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <p
      ref={elRef}
      className="font-display text-4xl sm:text-5xl font-extrabold text-accent-strong tracking-tight tabular-nums"
    >
      {count}
      {suffix}
    </p>
  );
}

export function MentorshipClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToBooking = () => {
    const el = document.getElementById("booking-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── 1. Premium Hero Header & Profile Card ── */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border bg-gradient-to-b from-accent/5 via-background to-background overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Avatar & Verification Badge */}
            <div className="relative shrink-0 text-center">
              <div className="relative h-44 w-44 sm:h-56 sm:w-56 rounded-full overflow-hidden border-4 border-background shadow-2xl mx-auto bg-muted group">
                <Image
                  src="/images/profile/about.webp"
                  alt="Sagar Lad - 1:1 Mentor & Author"
                  fill
                  sizes="224px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="btn-premium mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent-strong px-4 py-1.5 text-xs font-bold border border-accent/20 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                Verified Topmate Mentor
              </div>
            </div>

            {/* Value Proposition Content */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="btn-premium inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent-strong bg-accent/10 rounded-full px-4 py-1.5">
                1:1 Career &amp; Personal Development Coach
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Accelerate Your Career with <span className="text-accent-strong">Sagar Lad</span>
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl">
                Direct, 1-on-1 mentorship on Data, Cloud &amp; AI Architecture, career momentum, resume teardowns, and intentional execution. Plain, practical advice — from your friend Sagar.
              </p>

              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="btn-premium inline-flex items-center gap-2.5 rounded-full bg-accent text-accent-foreground px-7 py-3.5 text-sm font-bold shadow-xl hover:opacity-90 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Book 1:1 Session Below
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Animated Metrics Stat Matrix ── */}
      <section className="py-16 md:py-20 border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {METRICS.map((m) => (
              <div
                key={m.label}
                className="card-hover group rounded-lg border border-border bg-card/70 p-6 text-center hover:border-brand-light/70 hover:shadow-[0_10px_25px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300"
              >
                <StatCounter target={m.value} suffix={m.suffix} />
                <h3 className="mt-2 text-sm sm:text-base font-bold text-foreground">
                  {m.label}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground font-medium">
                  {m.subtext}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. What We Can Cover (4 Pillars) ── */}
      <section className="card-hover relative py-20 md:py-24 border-b border-border bg-card/30 overflow-hidden">
        {/* Subtle radial tint behind cards — brand-light gradient, design.md §gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,213,29,0.06), transparent 65%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="btn-premium inline-block text-xs font-semibold tracking-wide text-accent-strong bg-accent/10 rounded-full px-4 py-1.5">
              What you get
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              What We Cover in 1:1 Sessions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Simple, practical guidance based on your goals and career stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="card-hover group relative flex flex-col sm:flex-row gap-5 p-6 sm:p-8 rounded-lg border border-border bg-card"
                >
                  {/* Left accent bar on hover */}
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-accent/0 group-hover:bg-accent transition-colors duration-300"
                  />
                  <div className="shrink-0 grid h-14 w-14 place-items-center rounded-md bg-accent/10 text-accent-strong group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                        {p.title}
                      </h3>
                      <span className="btn-premium hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-accent-strong bg-accent/10 px-2.5 py-0.5 rounded-full shrink-0">
                        {p.highlight}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      {p.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Book a Session CTA ── */}
      <section
        id="booking-section"
        className="relative py-20 md:py-28 border-b border-border overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,213,29,0.04), transparent)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="btn-premium inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-accent-strong bg-accent/10 rounded-full px-4 py-1.5 mb-6">
            Open spots
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Ready to move forward?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Pick a time that works. One focused conversation — real clarity, real
            next steps.
          </p>
          <div className="mt-10">
            <a
              href="https://topmate.io/sagar_lad"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium inline-flex items-center gap-2.5 rounded-full bg-accent text-accent-foreground px-8 py-4 text-sm font-bold shadow-lg hover:opacity-90"
            >
              <Calendar className="w-4 h-4" />
              Book on Topmate
            </a>
            <p className="mt-4 text-xs text-muted-foreground">
              Instant calendar invite · Google Meet link · Free 15-min intro call
              available
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Mentee Testimonials Marquee ── */}
      <section className="card-hover py-20 md:py-24 border-b border-border bg-card/30 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-14">
          <div className="text-center max-w-2xl mx-auto">
            <p className="btn-premium inline-block text-xs font-semibold tracking-wide text-accent-strong bg-accent/10 rounded-full px-4 py-1.5">
              Results
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Real Feedback from 1:1 Sessions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Short, honest words from engineers, architects, and leaders who
              booked a session.
            </p>
          </div>
        </div>

        {/* Row 1 — scrolls left to right */}
        <div
          className="group/marquee relative"
          onMouseEnter={(e) =>
            e.currentTarget
              .querySelectorAll<HTMLElement>("[data-marquee-track]")
              .forEach((t) => (t.style.animationPlayState = "paused"))
          }
          onMouseLeave={(e) =>
            e.currentTarget
              .querySelectorAll<HTMLElement>("[data-marquee-track]")
              .forEach((t) => (t.style.animationPlayState = "running"))
          }
        >
          <div
            className="flex w-fit animate-marquee [animation-duration:40s] group-hover/marquee:[animation-play-state:paused]"
            data-marquee-track
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <article
                key={`r1-${i}`}
                className="card-hover flex-shrink-0 w-[300px] sm:w-[340px] mx-3 flex flex-col p-6 rounded-lg border border-border bg-card"
              >
                {/* Stars — filled + empty for realism */}
                <div className="flex items-center gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-3.5 h-3.5 ${
                        j < t.rating
                          ? "fill-accent text-accent"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[13px] sm:text-sm leading-[1.65] text-foreground italic line-clamp-4">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Attribution — pinned to bottom */}
                <div className="mt-auto pt-6 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-light/10 text-brand-light font-bold text-xs grid place-items-center uppercase shrink-0">
                    {t.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground leading-tight truncate">
                      {t.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium leading-tight truncate mt-0.5">
                      {t.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right to left */}
        <div
          className="group/marquee relative mt-4"
          onMouseEnter={(e) =>
            e.currentTarget
              .querySelectorAll<HTMLElement>("[data-marquee-track]")
              .forEach((t) => (t.style.animationPlayState = "paused"))
          }
          onMouseLeave={(e) =>
            e.currentTarget
              .querySelectorAll<HTMLElement>("[data-marquee-track]")
              .forEach((t) => (t.style.animationPlayState = "running"))
          }
        >
          <div
            className="flex w-fit animate-marquee-reverse [animation-duration:44s] group-hover/marquee:[animation-play-state:paused]"
            data-marquee-track
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <article
                key={`r2-${i}`}
                className="card-hover flex-shrink-0 w-[300px] sm:w-[340px] mx-3 flex flex-col p-6 rounded-lg border border-border bg-card"
              >
                {/* Stars — filled + empty for realism */}
                <div className="flex items-center gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-3.5 h-3.5 ${
                        j < t.rating
                          ? "fill-accent text-accent"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[13px] sm:text-sm leading-[1.65] text-foreground italic line-clamp-4">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Attribution — pinned to bottom */}
                <div className="mt-auto pt-6 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-light/10 text-brand-light font-bold text-xs grid place-items-center uppercase shrink-0">
                    {t.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground leading-tight truncate">
                      {t.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium leading-tight truncate mt-0.5">
                      {t.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ── */}
      <section className="py-20 md:py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to know before booking.
            </p>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.question}
                  className={`rounded-lg border transition-all duration-200 ${
                    isOpen
                      ? "border-brand-light/40 bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                      : "border-border/60 bg-transparent hover:border-border hover:bg-card/40"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left cursor-pointer"
                  >
                    {/* Number badge */}
                    <span
                      className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold transition-colors duration-200 ${
                        isOpen
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <span
                      className={`flex-1 font-display text-sm sm:text-base font-semibold transition-colors duration-200 ${
                        isOpen ? "text-foreground" : "text-foreground/80"
                      }`}
                    >
                      {faq.question}
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-accent-strong" : ""
                      }`}
                    />
                  </button>

                  {/* Answer with smooth height transition */}
                  <div
                    className="overflow-hidden transition-all duration-250 ease-in-out"
                    style={{
                      maxHeight: isOpen ? "200px" : "0px",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="px-5 sm:px-6 pb-5 pl-[3.25rem] sm:pl-[3.75rem]">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

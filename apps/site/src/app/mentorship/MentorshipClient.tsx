"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  UserCheck,
  Target,
  FileText,
  Brain,
  ChevronDown,
  Calendar,
  ArrowDown,
  ShieldCheck,
  Star,
} from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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

const TESTIMONIALS_ROW1 = [
  {
    name: "Arjun Mehta",
    role: "Senior Data Engineer, TCS",
    stars: 5,
    quote:
      "Sagar helped me clarify my career path in just one session. His advice on cloud architecture was spot-on and I got promoted within 3 months.",
  },
  {
    name: "Priya Sharma",
    role: "Software Architect, Infosys",
    stars: 5,
    quote:
      "Honest, practical, and no fluff. Sagar reviewed my resume and LinkedIn — the changes doubled my interview calls within weeks.",
  },
  {
    name: "Rohit Verma",
    role: "Tech Lead, Wipro",
    stars: 5,
    quote:
      "One conversation with Sagar gave me more clarity than a year of self-doubt. He tells you what you need to hear, not what you want to hear.",
  },
];

const TESTIMONIALS_ROW2 = [
  {
    name: "Ananya Patel",
    role: "Cloud Architect, Cognizant",
    stars: 5,
    quote:
      "Sagar's mentorship on Data & AI architecture was a game-changer. He broke down complex concepts into actionable steps I could follow immediately.",
  },
  {
    name: "Vikram Singh",
    role: "Lead Engineer, HCLTech",
    stars: 5,
    quote:
      "I was stuck in my career for 2 years. Sagar's session gave me a clear roadmap — I switched to a better role within 6 weeks.",
  },
  {
    name: "Neha Joshi",
    role: "Product Manager, Freshworks",
    stars: 5,
    quote:
      "Sagar combines technical depth with real empathy. His guidance on leadership and communication transformed how I approach my role.",
  },
];

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

function TestimonialCard({ t }: { t: { name: string; role: string; stars: number; quote: string } }) {
  return (
    <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] shrink-0 flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-brand-light/40">
      <div>
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: t.stars }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
          ))}
        </div>
        <blockquote className="font-display text-[13px] sm:text-sm font-medium leading-relaxed text-foreground/80 line-clamp-5">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
      </div>
      <div className="pt-3 border-t border-border">
        <p className="font-display text-sm font-bold text-foreground">
          {t.name}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {t.role}
        </p>
      </div>
    </div>
  );
}

export function MentorshipClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // GSAP animations
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(
        "[data-m-hero]",
        { opacity: 0, y: 40, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power3.out",
          stagger: 0.15,
        }
      );

      // Pillar cards stagger
      const pillarCards = gsap.utils.toArray<HTMLElement>("[data-m-pillar]");
      if (pillarCards.length) {
        gsap.fromTo(
          pillarCards,
          { opacity: 0, y: 30, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pillarCards[0]?.parentElement,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // CTA section
      gsap.fromTo(
        "[data-m-cta]",
        { opacity: 0, y: 30, filter: "blur(3px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-m-cta]",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-background text-foreground">
      {/* ── 1. Profile Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
            {/* Avatar */}
            <div data-m-hero className="relative shrink-0">
              <div className="relative h-36 w-36 sm:h-48 sm:w-48 rounded-full overflow-hidden border-2 border-border shadow-lg">
                <Image
                  src="/images/profile/about.webp"
                  alt="Sagar Lad"
                  fill
                  sizes="192px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-3 py-1 text-[10px] font-bold shadow-sm">
                <ShieldCheck className="w-3 h-3" />
                Verified Mentor
              </div>
            </div>

            {/* Copy */}
            <div className="flex-1 text-center md:text-left">
              <div data-m-hero className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand bg-brand/5 border border-brand/10 rounded-full px-4 py-1.5">
                1:1 Career &amp; Personal Development Coach
              </div>
              <h1 data-m-hero className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Accelerate Your Career
                <br />
                with <span className="text-accent">Sagar Lad</span>
              </h1>
              <p data-m-hero className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl">
                Direct, 1-on-1 mentorship on Data, Cloud &amp; AI Architecture, career momentum, resume teardowns, and intentional execution. Plain, practical advice — from your friend Sagar.
              </p>
              <div data-m-hero className="mt-6 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <button
                  type="button"
                  onClick={() => scrollTo("booking-section")}
                  className="inline-flex items-center gap-2.5 rounded-full bg-accent text-accent-foreground px-7 py-3.5 text-sm font-bold shadow-sm hover:scale-[1.03] transition-transform cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Book 1:1 Session
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("testimonials-section")}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5" />
                  Read what others say
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. What You Get — 4 Pillars ── */}
      <section className="relative py-20 md:py-28 border-b border-border overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="inline-block text-xs font-semibold tracking-wide text-accent-strong bg-accent/10 rounded-full px-4 py-1.5">
              What you get
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              What We Cover in 1:1 Sessions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Simple, practical guidance based on your goals and career stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  data-m-pillar
                  className="group relative flex flex-col sm:flex-row gap-5 p-6 sm:p-8 rounded-xl border border-border bg-card transition-all duration-300 hover:border-brand-light/50 hover:shadow-[0_8px_30px_rgba(13,33,161,0.08)] hover:-translate-y-1"
                >
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-accent/0 group-hover:bg-accent transition-colors duration-300"
                  />
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-brand/10 text-brand grid place-items-center transition-all duration-300 group-hover:bg-brand group-hover:text-white group-hover:scale-110">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-accent-strong transition-colors">
                        {p.title}
                      </h3>
                      <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-accent-strong bg-accent/10 px-2.5 py-0.5 rounded-full shrink-0">
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

      {/* ── 3. Testimonials — 2-Row Marquee ── */}
      <section
        id="testimonials-section"
        className="py-20 md:py-28 border-b border-border bg-card/30 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
          <div className="text-center max-w-2xl mx-auto">
            <p className="inline-block text-xs font-semibold tracking-wide text-accent-strong bg-accent/10 rounded-full px-4 py-1.5">
              Trusted by professionals
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              What People Say
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Real feedback from engineers and architects Sagar has mentored.
            </p>
          </div>
        </div>

        {/* Row 1 — scrolls left */}
        <div className="marquee-mask marquee-pauser mb-4">
          <div
            className="flex w-max gap-4 animate-marquee"
            style={{ animationDuration: "35s" }}
          >
            {[...TESTIMONIALS_ROW1, ...TESTIMONIALS_ROW1].map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="marquee-mask marquee-pauser">
          <div
            className="flex w-max gap-4 animate-marquee-reverse"
            style={{ animationDuration: "38s" }}
          >
            {[...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2].map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Booking CTA ── */}
      <section
        id="booking-section"
        className="relative py-20 md:py-28 border-b border-border overflow-hidden bg-background"
      >
        <div data-m-cta className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-accent-strong bg-accent/10 rounded-full px-4 py-1.5 mb-6">
            Open spots
          </p>
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
              className="inline-flex items-center gap-2.5 rounded-full bg-accent text-accent-foreground px-8 py-4 text-sm font-bold shadow-sm hover:scale-[1.03] transition-transform"
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

      {/* ── 5. FAQ — Premium Collapsible ── */}
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

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.question}
                  className={`rounded-xl border transition-all duration-300 ${
                    isOpen
                      ? "border-brand/20 bg-card shadow-[0_2px_12px_rgba(13,33,161,0.06)]"
                      : "border-border bg-transparent hover:border-border hover:bg-card/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left cursor-pointer group"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-all duration-300 ${
                        isOpen
                          ? "bg-accent text-accent-foreground scale-110"
                          : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`flex-1 font-display text-sm sm:text-base font-semibold transition-colors duration-200 ${
                        isOpen ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-all duration-300 ${
                        isOpen
                          ? "rotate-180 text-accent"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: isOpen ? "200px" : "0px",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="px-5 sm:px-6 pb-5 pl-[3.25rem] sm:pl-[3.75rem]">
                      <div className="h-px bg-border mb-4" />
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

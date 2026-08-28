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

export function MentorshipClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToBooking = () => {
    document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" });
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

      // Open spots section
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
      <section className="relative overflow-hidden border-b border-border">
        {/* Deep brand navy base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1930] via-[#0d21a1] to-[#0A1930] z-0" />
        {/* Diagonal accent wash */}
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/12 via-transparent to-transparent z-10" />
        {/* Bottom depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 z-10" />
        {/* Background image — blended */}
        <div className="absolute inset-0 z-[5]">
          <Image
            src="/images/profile/about.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center opacity-20 mix-blend-luminosity"
            priority
          />
        </div>
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] z-10"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)",
          }}
        />

        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
            {/* Avatar */}
            <div data-m-hero className="relative shrink-0">
              {/* Glow ring behind avatar */}
              <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-accent/30 via-brand-light/20 to-accent/10 blur-xl" />
              <div className="relative h-36 w-36 sm:h-48 sm:w-48 rounded-full overflow-hidden border-2 border-white/25 shadow-2xl">
                <Image
                  src="/images/profile/about.webp"
                  alt="Sagar Lad"
                  fill
                  sizes="192px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-accent/90 text-black px-3 py-1 text-[10px] font-bold shadow-lg backdrop-blur-sm">
                <ShieldCheck className="w-3 h-3" />
                Verified Mentor
              </div>
            </div>

            {/* Copy */}
            <div className="flex-1 text-center md:text-left">
              <div data-m-hero className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent border border-accent/30 rounded-full px-4 py-1.5 bg-accent/10 backdrop-blur-sm">
                1:1 Career &amp; Personal Development Coach
              </div>
              <h1 data-m-hero className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                Accelerate Your Career
                <br />
                with <span className="text-accent">Sagar Lad</span>
              </h1>
              <p data-m-hero className="mt-4 text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
                Direct, 1-on-1 mentorship on Data, Cloud &amp; AI Architecture, career momentum, resume teardowns, and intentional execution. Plain, practical advice — from your friend Sagar.
              </p>
              <div data-m-hero className="mt-6">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="inline-flex items-center gap-2.5 rounded-full bg-accent text-black px-7 py-3.5 text-sm font-bold shadow-xl hover:scale-[1.03] transition-transform cursor-pointer"
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

      {/* ── 2. What You Get — 4 Pillars ── */}
      <section className="relative py-20 md:py-28 border-b border-border overflow-hidden">
        {/* Subtle radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full opacity-50 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,213,29,0.06), transparent 65%)",
          }}
        />
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
                  {/* Accent bar on hover */}
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

      {/* ── 3. Open Spots — CTA ── */}
      <section
        id="booking-section"
        className="relative py-20 md:py-28 border-b border-border overflow-hidden"
      >
        {/* Gradient bg — matches About hero style */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-accent/5" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,213,29,0.04), transparent)",
          }}
        />
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
              className="inline-flex items-center gap-2.5 rounded-full bg-accent text-black px-8 py-4 text-sm font-bold shadow-lg hover:scale-[1.03] transition-transform"
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

      {/* ── 4. FAQ ── */}
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
                  className={`rounded-xl border transition-all duration-200 ${
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
                    <span
                      className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-colors duration-200 ${
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

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  UserCheck,
  Target,
  FileText,
  Brain,
  Calendar,
  ShieldCheck,
  Star,
  Send,
  CheckCircle,
  X,
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
    role: "Senior Data Engineer",
    stars: 5,
    quote:
      "Sagar helped me clarify my career path in just one session. His advice on cloud architecture was spot-on and I got promoted within 3 months.",
  },
  {
    name: "Priya Sharma",
    role: "Software Architect",
    stars: 5,
    quote:
      "Honest, practical, and no fluff. Sagar reviewed my resume and LinkedIn — the changes doubled my interview calls within weeks.",
  },
  {
    name: "Rohit Verma",
    role: "Tech Lead",
    stars: 5,
    quote:
      "One conversation with Sagar gave me more clarity than a year of self-doubt. He tells you what you need to hear, not what you want to hear.",
  },
  {
    name: "Kavya Nair",
    role: "ML Engineer",
    stars: 5,
    quote:
      "Sagar's guidance on positioning myself in the AI space was exactly what I needed. Landed my dream role within6 weeks of our session.",
  },
  {
    name: "Aditya Rao",
    role: "Cloud Solutions Architect",
    stars: 5,
    quote:
      "I was confused between two offer letters. Sagar helped me evaluate both with a clear framework — best30 minutes I ever spent.",
  },
];

const TESTIMONIALS_ROW2 = [
  {
    name: "Ananya Patel",
    role: "Cloud Architect",
    stars: 5,
    quote:
      "Sagar's mentorship on Data & AI architecture was a game-changer. He broke down complex concepts into actionable steps I could follow immediately.",
  },
  {
    name: "Vikram Singh",
    role: "Lead Engineer",
    stars: 5,
    quote:
      "I was stuck in my career for 2 years. Sagar's session gave me a clear roadmap — I switched to a better role within 6 weeks.",
  },
  {
    name: "Neha Joshi",
    role: "Product Manager",
    stars: 5,
    quote:
      "Sagar combines technical depth with real empathy. His guidance on leadership and communication transformed how I approach my role.",
  },
  {
    name: "Deepak Menon",
    role: "Data Platform Lead",
    stars: 5,
    quote:
      "Resume was outdated for5 years. Sagar tore it apart constructively — the new version got me 3 interview calls in the first week.",
  },
  {
    name: "Meera Iyer",
    role: "Backend Engineer",
    stars: 4,
    quote:
      "Practical, no-nonsense advice. Sagar helped me negotiate a40% salary hike by repositioning my experience the right way.",
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

const AVATAR_COLORS = [
  { bg: "#E8D5B7", text: "#5C4033" },
  { bg: "#B7D5E8", text: "#2C4A62" },
  { bg: "#D5B7E8", text: "#4A2C62" },
  { bg: "#B7E8D5", text: "#2C624A" },
  { bg: "#E8B7B7", text: "#624A2C" },
  { bg: "#D5E8B7", text: "#4A622C" },
  { bg: "#B7B7E8", text: "#2C2C62" },
  { bg: "#E8E8B7", text: "#62622C" },
  { bg: "#B7E8E8", text: "#2C6262" },
  { bg: "#E8B7E8", text: "#622C62" },
];

function AvatarSvg({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colorIndex =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  const { bg, text } = AVATAR_COLORS[colorIndex];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className="rounded-full shrink-0"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="20" fill={bg} />
      <text
        x="20"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fill={text}
        fontSize="14"
        fontWeight="600"
        fontFamily="var(--font-display), system-ui, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}

function StarRating({ stars, size = "w-3 h-3" }: { stars: number; size?: string }) {
  const full = Math.floor(stars);
  const hasHalf = stars % 1 >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className={`${size} fill-accent text-accent`} />
      ))}
      {hasHalf && (
        <span className={`relative inline-block ${size}`}>
          <Star className={`absolute inset-0 ${size} text-muted-foreground/25`} />
          <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <Star className={`${size} fill-accent text-accent`} />
          </span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className={`${size} text-muted-foreground/25`} />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: { name: string; role: string; stars: number; quote: string } }) {
  return (
    <div className="w-[260px] sm:w-[300px] shrink-0 flex flex-col p-4 sm:p-5 rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-brand-light/40 active:shadow-[0_8px_30px_rgba(0,0,0,0.1)] active:border-brand-light/50 active:scale-[0.98]">
      <div className="mb-2.5">
        <StarRating stars={t.stars} />
      </div>
      <blockquote className="font-display text-[12px] sm:text-[13px] font-medium leading-relaxed text-foreground/80 line-clamp-4 flex-1">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <div className="mt-3 pt-3 border-t border-border flex items-center gap-2.5">
        <AvatarSvg name={t.name} size={32} />
        <div className="min-w-0">
          <p className="font-display text-xs font-bold text-foreground truncate">
            {t.name}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {t.role}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewForm({ onClose }: { onClose?: () => void }) {
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !review.trim() || rating === 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
        <p className="font-display text-lg font-bold text-foreground">Thank you!</p>
        <p className="text-sm text-muted-foreground">
          Your review has been submitted and will appear after moderation.
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4"
    >
      <div className="space-y-1.5">
        <p className="font-display text-lg font-bold text-foreground">
          Share Your Experience
        </p>
        <p className="text-xs text-muted-foreground">
          Your feedback helps others find the right guidance.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="reviewer-name" className="text-xs font-semibold text-foreground/70">
          Your Name
        </label>
        <input
          id="reviewer-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Kumar"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground/70">
          Rating
        </label>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="relative flex">
              {/* Left half — .5 */}
              <button
                type="button"
                onClick={() => setRating(s - 0.5)}
                onMouseEnter={() => setHovered(s - 0.5)}
                onMouseLeave={() => setHovered(0)}
                className="relative w-4 h-5 sm:w-5 sm:h-6 cursor-pointer overflow-hidden"
              >
                <Star className={`absolute inset-0 w-5 h-6 sm:w-6 sm:h-7 transition-colors ${
                  (hovered || rating) >= s - 0.5
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/25"
                }`} />
              </button>
              {/* Right half — full */}
              <button
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                className="relative w-4 h-5 sm:w-5 sm:h-6 cursor-pointer overflow-hidden -ml-4 sm:-ml-5"
              >
                <Star className={`absolute inset-0 w-5 h-6 sm:w-6 sm:h-7 transition-colors ${
                  (hovered || rating) >= s
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/25"
                }`} />
              </button>
            </div>
          ))}
          {(hovered || rating) > 0 && (
            <span className="ml-2 text-xs text-muted-foreground self-center tabular-nums">
              {hovered || rating}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="review-text" className="text-xs font-semibold text-foreground/70">
          Your Review
        </label>
        <textarea
          id="review-text"
          required
          rows={3}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="How did the mentorship help you?"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!name.trim() || !review.trim() || rating === 0}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-bold shadow-sm hover:scale-[1.03] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          Submit Review
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function ReviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Write a review"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel — centered in viewport */}
      <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="p-5 sm:p-6">
          <ReviewForm onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

export function MentorshipClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [reviewOpen, setReviewOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
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
            <div data-m-hero className="relative shrink-0 pb-3">
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

            <div className="flex-1 text-center md:text-left">
              <div data-m-hero className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand bg-brand/5 border border-brand/10 rounded-full px-4 py-1.5">
              Personal Development Coach
              </div>
              <h1 data-m-hero className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Accelerate Your Career
                <br />
                with <span className="text-accent">Sagar Lad</span>
              </h1>
              <p data-m-hero className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl">
                Direct, 1-on-1 mentorship on Data, Cloud &amp; AI Architecture, career momentum, resume teardowns, and intentional execution. Plain, practical advice — from your friend Sagar.
              </p>
              <div data-m-hero className="mt-6 flex items-stretch gap-3 justify-center md:justify-start">
                <button
                  type="button"
                  onClick={() => scrollTo("testimonials-section")}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5" />
                  What others say
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("booking-section")}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2.5 rounded-full bg-accent text-accent-foreground px-6 py-3.5 text-sm font-bold shadow-sm hover:scale-[1.03] transition-transform cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Book Session
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  data-m-pillar
                  className="group relative flex items-start gap-5 rounded-2xl bg-card border border-border p-6 sm:p-7 transition-all duration-400 hover:border-brand/30 hover:shadow-[0_8px_40px_-12px_rgba(13,33,161,0.1)]"
                >
                  {/* left accent bar */}
                  <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-brand/0 group-hover:bg-brand transition-all duration-400" />

                  {/* number */}
                  <span className="absolute right-5 top-4 text-[11px] font-bold tracking-widest text-brand/10 transition-colors duration-400 group-hover:text-brand/25">
                    0{i + 1}
                  </span>

                  {/* icon */}
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-brand/8 border border-brand/10 grid place-items-center transition-all duration-400 group-hover:bg-brand group-hover:border-brand group-hover:shadow-[0_4px_20px_rgba(13,33,161,0.2)]">
                    <Icon className="w-5 h-5 text-brand transition-all duration-400 group-hover:text-white group-hover:scale-110" />
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground transition-colors duration-300 group-hover:text-brand">
                      {p.title}
                    </h3>
                    <p className="text-[13px] sm:text-sm leading-relaxed text-muted-foreground">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 relative">
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
          {/* Desktop — top right */}
          <button
            type="button"
            onClick={() => setReviewOpen(true)}
            className="hidden md:block absolute top-0 right-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg border border-border px-3 py-1.5"
          >
            Write a Review
          </button>
        </div>

        {/* Row 1 — scrolls left, starts mid-scroll */}
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

        {/* Row 2 — scrolls right, starts mid-scroll */}
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

        {/* Mobile — bottom center */}
        <div className="md:hidden max-w-xl mx-auto px-4 sm:px-6 mt-12 text-center">
          <button
            type="button"
            onClick={() => setReviewOpen(true)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg border border-border px-3 py-1.5"
          >
            Write a Review
          </button>
        </div>
      </section>

      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} />

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
              Book a Free Chat with Sagar
              <br />
              <span className="inline-flex items-center gap-1 animate-bounce-up">
                available
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-foreground">
                  <path d="M5 8V2M5 2L2 5M5 2L8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ — Minimal ── */}
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

          <div className="divide-y divide-border border-t border-border">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-sm sm:text-base font-medium text-foreground/80">
                      {faq.question}
                    </span>
                    <span className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-200 ${
                      isOpen ? "border-accent/40 bg-accent/10 rotate-45" : "border-border text-muted-foreground"
                    }`}>
                      <span className="text-lg leading-none font-light">+</span>
                    </span>
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: isOpen ? "200px" : "0px",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed pb-5">
                      {faq.answer}
                    </p>
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

"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

type Step = {
  letter: string;
  label: string;
  sentence: string;
  detail: string;
};

const steps: Step[] = [
  {
    letter: "A",
    label: "Awareness",
    sentence: "Understand what AI actually is.",
    detail:
      "No jargon, no hype. Just a clear picture of what AI can do, what it can't, and why it matters to you.",
  },
  {
    letter: "I",
    label: "Integration",
    sentence: "Use AI in your daily work.",
    detail:
      "Start small, start now. Bring AI into your everyday tasks — writing, decisions, brainstorming — and see what clicks.",
  },
  {
    letter: "M",
    label: "Mastery",
    sentence: "Build real things with AI.",
    detail:
      "Move beyond prompts. Create tools, workflows, and solutions that save you time and actually stick.",
  },
];

export function AimFramework() {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden md:block">
        <div className="relative flex items-start">
          {steps.map((step, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <div
                key={step.letter}
                className="flex-1 relative cursor-pointer group"
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                {/* Connector line — positioned between circles, no layout impact */}
                {i < steps.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-[2px] bg-border z-0">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: isDone || isActive ? "100%" : "0%" }}
                    />
                  </div>
                )}

                <div className="flex flex-col items-center text-center px-2 relative z-10">
                  {/* Circle */}
                  <div
                    className={`w-20 h-20 rounded-full grid place-items-center transition-all duration-300 ${
                      isActive
                        ? "bg-accent text-accent-foreground shadow-lg shadow-accent/25"
                        : isDone
                        ? "bg-accent/20 text-accent-strong"
                        : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent-strong"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <span className="font-display text-3xl font-extrabold">
                        {step.letter}
                      </span>
                    )}
                  </div>

                  {/* Label + arrow */}
                  <div className="mt-4 flex items-center gap-1.5">
                    <p
                      className={`font-display text-base font-bold transition-colors duration-300 ${
                        isActive
                          ? "text-accent-strong"
                          : "text-foreground/70 group-hover:text-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <ArrowRight
                      className={`w-4 h-4 transition-all duration-300 ${
                        isActive
                          ? "opacity-100 text-accent-strong translate-x-0"
                          : "opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 group-hover:text-accent-strong"
                      }`}
                    />
                  </div>

                  {/* Sentence */}
                  <p
                    className={`mt-1 text-sm leading-relaxed transition-colors duration-300 max-w-[200px] ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.sentence}
                  </p>

                  {/* Detail — fixed height container so layout never shifts */}
                  <div className="mt-3 h-16 relative w-full max-w-[220px] mx-auto">
                    <p
                      className={`absolute inset-0 text-xs text-muted-foreground leading-relaxed transition-all duration-400 ${
                        isActive
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2 pointer-events-none"
                      }`}
                    >
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden">
        <div className="relative flex flex-col">
          {steps.map((step, i) => {
            const isActive = i === active;
            const isDone = i < active;
            const isLast = i === steps.length - 1;
            return (
              <div
                key={step.letter}
                className="relative cursor-pointer"
                onClick={() => setActive(i)}
              >
                <div className="flex items-start gap-4">
                  {/* Left: circle + connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`relative z-10 w-14 h-14 rounded-full grid place-items-center transition-all duration-400 ${
                        isActive
                          ? "bg-accent text-accent-foreground shadow-lg shadow-accent/25 scale-110"
                          : isDone
                          ? "bg-accent/20 text-accent-strong"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-display text-2xl font-extrabold">
                          {step.letter}
                        </span>
                      )}
                    </div>
                    {!isLast && (
                      <div className="w-[2px] h-10 bg-border">
                        <div
                          className="w-full bg-accent transition-all duration-500"
                          style={{
                            height: isDone || isActive ? "100%" : "0%",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right: content */}
                  <div className={`pt-2 pb-8 ${isLast ? "pb-0" : ""}`}>
                    <p
                      className={`font-display text-base font-bold transition-colors duration-300 ${
                        isActive
                          ? "text-accent-strong"
                          : "text-foreground/70"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`mt-0.5 text-sm transition-colors duration-300 ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.sentence}
                    </p>
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-out ${
                        isActive ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

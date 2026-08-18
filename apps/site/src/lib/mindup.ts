// The 6 Pillars of MIND UP — single source of truth for the framework, shared
// by the home donut (MindUpPillars) and the About page "lived" section.
//
// `lived` maps each pillar to a real story from Sagar's own life, drawn
// verbatim from existing site copy (about page, home page) — no invented data.

export type MindUpPillar = {
  id: string;
  title: string;
  short: string;
  tagline: string;
  color: string;
  shortDescription: string;
  description: string;
  items: string[];
  lived: {
    name: string;
    story: string;
  };
};

// Muted, pastel palette — one calm register so the ring reads as a designed
// set. `shortDescription` is the one-line card line; `description` is the
// 1–2 sentence panel copy.
export const MINDUP_PILLARS: MindUpPillar[] = [
  {
    id: "M",
    title: "Master Your Mind",
    short: "Mind",
    tagline: "Win the inner game first.",
    color: "#6674B8",
    shortDescription: "Clarity & Focus.",
    description:
      "Build clarity, emotional control and focus so you can respond instead of react.",
    items: ["Mindset", "Self-awareness", "Emotional control", "Confidence", "Mental resilience"],
    lived: {
      name: "My life razor",
      story:
        "\u201cBe Dumb, Don\u2019t worry about what others think\u201d \u2014 stay curious, keep asking the dumb questions, and never let the noise of other people\u2019s opinions decide the next step.",
    },
  },
  {
    id: "I",
    title: "Invest in Health",
    short: "Health",
    tagline: "Energy is the currency of everything.",
    color: "#69A98D",
    shortDescription: "Body strong. Mind calm.",
    description:
      "Treat your energy like the currency it is \u2014 move, fuel and rest so the body stays strong and the mind stays calm.",
    items: ["Fitness", "Nutrition", "Sleep", "Energy", "Physical wellbeing"],
    lived: {
      name: "Runner for life",
      story:
        "Seven races across three distances \u2014 running is where I practice the discipline I preach, one step at a time, showing up again and again.",
    },
  },
  {
    id: "N",
    title: "Nurture Relationships",
    short: "Relationships",
    tagline: "No one makes it alone.",
    color: "#D76E67",
    shortDescription: "Connect. Care. Grow.",
    description:
      "Meaningful connections multiply everything \u2014 communicate, care and grow with the people around you.",
    items: ["Communication", "Family", "Friendship", "Networking", "Meaningful connections"],
    lived: {
      name: "People over numbers",
      story:
        "Kindness multiplies, and investing in people changes lives \u2014 the real, meaningful conversations that cross cultures and continents.",
    },
  },
  {
    id: "D",
    title: "Develop Skills & Work",
    short: "Skills & Work",
    tagline: "Your craft compounds.",
    color: "#C9A35D",
    shortDescription: "Grow. Contribute. Thrive.",
    description:
      "Grow, contribute and thrive. Compounding skills and honest work build both a career and a life.",
    items: ["Career", "Skill development", "Leadership", "Productivity", "Financial growth"],
    lived: {
      name: "Written alongside a career",
      story:
        "Six books published while holding down a full career \u2014 computer engineering, data science, and now Gen AI, one page at a time.",
    },
  },
  {
    id: "P",
    title: "Progress Daily & Reset Often",
    short: "Progress Daily",
    tagline: "Small steps, repeated, then begin again.",
    color: "#57A8A8",
    shortDescription: "Small steps. Big change.",
    description:
      "Small steps, repeated, then begin again \u2014 progress daily and reset often, because consistency beats intensity.",
    items: [
      "Daily improvement",
      "Habits",
      "Reflection",
      "Consistency",
      "Learning from failure",
      "Starting again",
    ],
    lived: {
      name: "The three-step plan",
      story:
        "Study computer engineering, grow in the IT industry, give back to society \u2014 a plan from a modest home, worked one consistent step at a time.",
    },
  },
  {
    id: "U",
    title: "Unlock Yourself",
    short: "Yourself",
    tagline: "The only person you must outgrow.",
    color: "#9A82C0",
    shortDescription: "Know yourself. Own yourself.",
    description:
      "Know yourself and own yourself \u2014 the only person you must outgrow is the one you were yesterday.",
    items: ["Self-belief", "Purpose", "Identity", "Courage", "Personal potential"],
    lived: {
      name: "From almost nothing",
      story:
        "From a modest home to a TEDx stage \u2014 the only person I ever had to outgrow was myself.",
    },
  },
];

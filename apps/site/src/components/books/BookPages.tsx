import type { CSSProperties } from "react";
export type BookId = "mindup" | "azure";

export const BOOK_META: Record<BookId, { title: string; subtitle: string; author: string; front: string; back?: string; accent: string }> = {
  mindup: {
    title: "The MIND UP Theory",
    subtitle: "Simple Shift That Will Make You Unshakable",
    author: "Sagar Lad",
    front: "/images/books/mindup-front.jpg",
    back: "/images/books/mindup-back.jpg",
    accent: "#0d21a1",
  },
  azure: {
    title: "Level Up with Azure AI Foundry",
    subtitle: "Understanding Innovative AI Development on Azure",
    author: "Sagar Lad",
    front: "/images/books/azure-front.webp",
    accent: "#1e3a8a",
  },
};

export type PageData = {
  content: string;
  className?: string;
  style?: CSSProperties;
};

export function mindupPages(): PageData[] {
  const { title, subtitle, author, front, back, accent } = BOOK_META.mindup;
  return [
    /* 1 — Front cover */
    {
      className: "pf-cover",
      style: { backgroundImage: `url('${front}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#fff" },
      content: "",
    },
    /* 2 — Title page */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner pf-center">
        <h1 style="font-size:1.6rem;font-weight:700;margin-bottom:0.4rem;color:#1a1a1a;">${title}</h1>
        <p style="font-style:italic;color:#6b7280;font-size:0.75rem;margin-bottom:1.5rem;">${subtitle}</p>
        <div style="width:40px;height:2px;background:${accent};margin:0 auto 1.5rem;"></div>
        <p style="font-weight:700;font-size:0.9rem;color:#374151;">${author}</p>
      </div>`,
    },
    /* 3 — Copyright */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner" style="justify-content:flex-end;padding-bottom:2rem;">
        <p style="font-size:0.55rem;color:#9ca3af;text-align:center;line-height:1.8;">
          Copyright &copy; ${author}<br>All rights reserved.<br><br>
          No part of this publication may be reproduced, distributed, or transmitted in any form or by any means.<br><br>
          Independently Published.
        </p>
      </div>`,
    },
    /* 4 — Table of Contents */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner">
        <h2 style="font-size:1.1rem;font-weight:700;text-align:center;margin-bottom:1rem;color:#1a1a1a;border-bottom:2px solid #e0e7ff;padding-bottom:0.5rem;">Table of Contents</h2>
        <ul style="list-style:none;padding:0;margin:0;">
          <li style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:0.35rem 0;color:#374151;font-size:0.7rem;"><span>Introduction</span><span>5</span></li>
          <li style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:0.35rem 0;color:#374151;font-size:0.7rem;"><span>Stop Battling Your Mind</span><span>15</span></li>
          <li style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:0.35rem 0;color:#374151;font-size:0.7rem;"><span>Building Habits</span><span>31</span></li>
          <li style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:0.35rem 0;color:#374151;font-size:0.7rem;"><span>Improving Relationships</span><span>55</span></li>
          <li style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:0.35rem 0;color:#374151;font-size:0.7rem;"><span>Breaking Limiting Patterns</span><span>79</span></li>
        </ul>
      </div>`,
    },
    /* 5 — Quote */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner pf-center">
        <p style="font-size:0.95rem;font-style:italic;color:#6b7280;line-height:1.8;text-align:center;padding:0 1rem;">
          &ldquo;This isn&rsquo;t about becoming perfect.<br>It&rsquo;s about becoming unshakable.&rdquo;
        </p>
      </div>`,
    },
    /* 6 — Introduction */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner">
        <h2 style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;text-align:center;color:#9ca3af;margin-bottom:0.8rem;">Introduction</h2>
        <p style="font-size:0.85rem;font-style:italic;text-align:center;font-weight:600;color:#1a1a1a;line-height:1.5;margin-bottom:1rem;">
          &ldquo;What if the problem isn&rsquo;t your life&hellip; but how you&rsquo;re thinking about it?&rdquo;
        </p>
        <p style="font-size:0.7rem;color:#374151;line-height:1.7;text-align:justify;margin-bottom:0.6rem;">
          Most people spend their lives fighting their thoughts&mdash;overthinking, resisting, and feeling stuck. We often view our own minds as battlegrounds, constantly struggling to gain control over stress, relationships, and self-doubt.
        </p>
        <p style="font-size:0.7rem;color:${accent};line-height:1.7;text-align:justify;font-weight:600;">
          But what if the key isn&rsquo;t control&hellip; it&rsquo;s alignment?
        </p>
      </div>`,
    },
    /* 7 — Core concept */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner">
        <p style="font-size:0.7rem;color:#374151;line-height:1.7;text-align:justify;margin-bottom:0.6rem;">
          In <strong>The Mind Up Theory</strong>, I introduce a powerful yet profoundly simple shift that has the potential to transform every facet of your daily experience.
        </p>
        <p style="font-size:0.7rem;color:#374151;line-height:1.7;text-align:justify;margin-bottom:0.6rem;">
          This framework is designed to help you fundamentally change how you handle adversity. Instead of being swept away by external circumstances or internal turbulence, you learn to anchor yourself.
        </p>
        <p style="font-size:0.7rem;color:#374151;line-height:1.7;text-align:justify;">
          It is not about pretending everything is fine. It is about equipping yourself with the mental architecture to navigate challenges with grace and resilience.
        </p>
      </div>`,
    },
    /* 8 — Benefits */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner">
        <h2 style="font-size:0.85rem;font-weight:700;color:#1a1a1a;margin-bottom:0.6rem;">What You Will Discover</h2>
        <p style="font-size:0.65rem;color:#374151;margin-bottom:0.5rem;">Throughout these pages, this book reveals exactly how to:</p>
        <ul style="padding-left:1rem;margin:0;">
          <li style="font-size:0.65rem;color:#374151;line-height:1.6;margin-bottom:0.3rem;"><strong>Stop battling your mind</strong> and start working synergistically with it.</li>
          <li style="font-size:0.65rem;color:#374151;line-height:1.6;margin-bottom:0.3rem;"><strong>Build enduring habits</strong> that strengthen both mental and physical well-being.</li>
          <li style="font-size:0.65rem;color:#374151;line-height:1.6;margin-bottom:0.3rem;"><strong>Improve relationships</strong> through deeper awareness, presence, and clarity.</li>
          <li style="font-size:0.65rem;color:#374151;line-height:1.6;margin-bottom:0.3rem;"><strong>Break limiting patterns</strong> to finally unlock your true potential.</li>
          <li style="font-size:0.65rem;color:#374151;line-height:1.6;"><strong>Make small, consistent shifts</strong> that inevitably lead to lasting success.</li>
        </ul>
      </div>`,
    },
    /* 9 — Back cover */
    back
      ? {
          className: "pf-cover",
          style: { backgroundImage: `url('${back}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#fff" },
          content: "",
        }
      : {
          className: "pf-cover",
          style: { background: `linear-gradient(135deg, ${accent}, #1a3ab8)`, color: "white" },
          content: `<div style="display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;height:100%;width:100%;">
            <div>
              <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:0.5rem;">${title}</h2>
              <div style="width:40px;height:2px;background:rgba(255,213,29,0.6);margin:0 auto 0.75rem;"></div>
              <p style="font-size:0.7rem;color:rgba(255,255,255,0.7);line-height:1.6;">Shift Your Perspective.</p>
              <p style="font-size:0.55rem;color:rgba(255,255,255,0.4);margin-top:1rem;">${author}</p>
            </div>
          </div>`,
        },
  ];
}

export function azurePages(): PageData[] {
  const { title, subtitle, author, front, accent } = BOOK_META.azure;
  return [
    /* 1 — Front cover */
    {
      className: "pf-cover",
      style: { backgroundImage: `url('${front}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#fff" },
      content: "",
    },
    /* 2 — Title page */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner pf-center">
        <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.4rem;color:${accent};line-height:1.2;">${title}</h1>
        <p style="font-size:0.7rem;color:#6b7280;margin-bottom:1.5rem;padding:0 0.75rem;">${subtitle}</p>
        <div style="width:40px;height:2px;background:#3b82f6;margin:0 auto 1.5rem;"></div>
        <p style="font-weight:700;font-size:0.9rem;color:#374151;">${author}</p>
      </div>`,
    },
    /* 3 — Copyright */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner" style="justify-content:flex-end;padding-bottom:2rem;">
        <p style="font-size:0.55rem;color:#9ca3af;text-align:center;line-height:1.8;">
          Copyright &copy; ${author}<br>All rights reserved.<br><br>
          Published Independently.<br>
          Trademarks: Microsoft, Azure, and AI Foundry are trademarks of the Microsoft group of companies.
        </p>
      </div>`,
    },
    /* 4 — Table of Contents */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner">
        <h2 style="font-size:1.1rem;font-weight:700;text-align:center;margin-bottom:1rem;color:${accent};border-bottom:2px solid #bfdbfe;padding-bottom:0.5rem;">Contents</h2>
        <ul style="list-style:none;padding:0;margin:0;">
          <li style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:0.35rem 0;color:#374151;font-size:0.7rem;"><span>Introduction to Generative AI</span><span>5</span></li>
          <li style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:0.35rem 0;color:#374151;font-size:0.7rem;"><span>Azure AI Foundry Overview</span><span>21</span></li>
          <li style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:0.35rem 0;color:#374151;font-size:0.7rem;"><span>Navigating Prompt Flow</span><span>45</span></li>
          <li style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:0.35rem 0;color:#374151;font-size:0.7rem;"><span>Multi-Modal AI Applications</span><span>73</span></li>
          <li style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:0.35rem 0;color:#374151;font-size:0.7rem;"><span>Responsible AI &amp; Governance</span><span>99</span></li>
        </ul>
      </div>`,
    },
    /* 5 — Quote */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner pf-center">
        <p style="font-size:0.9rem;font-style:italic;color:#1e40af;line-height:1.8;text-align:center;font-weight:600;padding:0 1rem;">
          &ldquo;The future of software is intelligent.<br>Are you ready to build it?&rdquo;
        </p>
      </div>`,
    },
    /* 6 — Introduction */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner">
        <h2 style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;text-align:center;color:#9ca3af;margin-bottom:0.8rem;">Introduction</h2>
        <p style="font-size:0.7rem;color:#374151;line-height:1.7;text-align:justify;margin-bottom:0.6rem;">
          Harness the power of Artificial Intelligence through Microsoft&rsquo;s premier enterprise platform: <strong>Azure AI Foundry</strong>.
        </p>
        <p style="font-size:0.7rem;color:#374151;line-height:1.7;text-align:justify;">
          Azure AI Foundry includes a versatile and incredibly powerful suite of tools designed to cater to the exacting needs of modern developers, data scientists, and forward-thinking organizations aiming to leverage AI for transformative outcomes.
        </p>
      </div>`,
    },
    /* 7 — Core concept */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner">
        <p style="font-size:0.7rem;color:#374151;line-height:1.7;text-align:justify;margin-bottom:0.6rem;">
          This book demystifies the Azure AI Foundry ecosystem by offering a comprehensive overview of its foundational concepts, tools, and diverse services.
        </p>
        <p style="font-size:0.7rem;color:#374151;line-height:1.7;text-align:justify;margin-bottom:0.6rem;">
          We begin with a solid overview of generative AI, detailing its architecture, capabilities, and key differences from traditional machine learning. From there, you will journey into practical applications.
        </p>
        <p style="font-size:0.7rem;color:#374151;line-height:1.7;text-align:justify;">
          You will learn how to navigate <em>Azure AI Foundry Prompt Flow</em>, covering initial setup, creation, debugging, and ultimately building intelligent, multi-modal AI applications that are ready for production.
        </p>
      </div>`,
    },
    /* 8 — Benefits */
    {
      style: { background: "#fdfaf6" },
      content: `<div class="pf-page-inner">
        <h2 style="font-size:0.85rem;font-weight:700;color:${accent};margin-bottom:0.6rem;border-bottom:1px solid #bfdbfe;padding-bottom:0.4rem;">What You Will Learn</h2>
        <ul style="padding-left:1rem;margin:0;">
          <li style="font-size:0.6rem;color:#374151;line-height:1.6;margin-bottom:0.25rem;">Get up to speed on the fundamentals of generative AI.</li>
          <li style="font-size:0.6rem;color:#374151;line-height:1.6;margin-bottom:0.25rem;">Understand essential components of Azure AI Foundry, including Prompt Flow and key tools.</li>
          <li style="font-size:0.6rem;color:#374151;line-height:1.6;margin-bottom:0.25rem;">Build and deploy robust multi-modal applications.</li>
          <li style="font-size:0.6rem;color:#374151;line-height:1.6;margin-bottom:0.25rem;">Integrate cutting-edge AI capabilities into your existing systems and enterprise workflows.</li>
          <li style="font-size:0.6rem;color:#374151;line-height:1.6;margin-bottom:0.25rem;">Know the latest trends and innovations driving solutions across various industries.</li>
          <li style="font-size:0.6rem;color:#374151;line-height:1.6;">Manage crucial security, ethics, and responsible governance of your AI applications.</li>
        </ul>
      </div>`,
    },
    /* 9 — Back cover (designed since no image exists) */
    {
      className: "pf-cover",
      style: { background: `linear-gradient(135deg, ${accent}, #0f172a)`, color: "white" },
      content: `<div style="display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;height:100%;width:100%;">
        <div>
          <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;">Azure AI Foundry</h2>
          <div style="width:40px;height:2px;background:rgba(59,130,246,0.5);margin:0 auto 0.75rem;"></div>
          <p style="font-size:0.7rem;color:#93c5fd;line-height:1.6;">The Definitive Guide for Developers</p>
          <p style="font-size:0.55rem;color:rgba(255,255,255,0.4);margin-top:1rem;">${author}</p>
        </div>
      </div>`,
    },
  ];
}

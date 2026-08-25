# sagarlad.com — System Architecture

> Complete ASCII architecture diagrams for the sagarlad.com monorepo.
> Generated from source code analysis — reflects actual implementation.

---

## Table of Contents

1. [Combined System Overview](#1-combined-system-overview)
2. [Site App Architecture](#2-site-app-architecture)
3. [Admin App Architecture](#3-admin-app-architecture)
4. [Database Schema](#4-database-schema)
5. [Authentication & Security Flow](#5-authentication--security-flow)
6. [Data Flow: Admin Write → Site Render](#6-data-flow-admin-write--site-render)
7. [Newsletter Pipeline](#7-newsletter-pipeline)
8. [Caching & Revalidation Strategy](#8-caching--revalidation-strategy)
9. [Heartbeat & Keep-Alive System](#9-heartbeat--keep-alive-system)
10. [Deployment Architecture](#10-deployment-architecture)

---

## 1. Combined System Overview

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                          sagarlad.com — FULL SYSTEM MAP                          │
 └──────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                              GITHUB ACTIONS                                     │
  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────────┐  │
  │  │ newsletter-cron   │  │ newsletter-drain  │  │ supabase-keepalive           │  │
  │  │ (every 30 min)    │  │ (daily 04:30 UTC) │  │ (every 2 days)               │  │
  │  └────────┬─────────┘  └────────┬─────────┘  └──────────────┬───────────────┘  │
  └───────────┼─────────────────────┼────────────────────────────┼──────────────────┘
              │ HTTP + CRON_SECRET  │ HTTP + CRON_SECRET         │ HTTP + CRON_SECRET
              ▼                     ▼                            ▼
 ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
 │   SITE APP (port 3000) │  │   SITE APP (cont.)     │  │   ADMIN APP (3001)     │
 │                        │  │                        │  │                        │
 │  /api/newsletter       │  │  /api/revalidate       │  │  /api/cron/keepalive   │
 │  /api/cron/keepalive   │  │  (receives from admin) │  │  /api/admin/health     │
 │  /api/contact          │  │                        │  │                        │
 │  /api/comments         │  │         ▲              │  │         ▲              │
 │  /api/newsletter/      │  │         │ revalidate   │  │         │ revalidate   │
 │    unsubscribe         │  │         │ (header)     │  │         │ (header)     │
 └────────┬───────────────┘  └─────────┼──────────────┘  └─────────┼──────────────┘
          │                            │                            │
          │ reads/writes               │ writes trigger             │ writes trigger
          ▼                            ▼                            ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                              SUPABASE (Free Tier)                                │
 │                                                                                  │
 │  ┌─────────────────────────┐    ┌──────────────────────────────────────────────┐ │
 │  │     PostgreSQL DB        │    │              Storage Buckets                 │ │
 │  │                          │    │                                              │ │
 │  │  User          Post      │    │  sagarlad-assets (public)                   │ │
 │  │  Session       Category  │    │  ├── images, covers, media                  │ │
 │  │  Account       Comment   │    │  └── max 8MB per file                       │ │
 │  │  AuditLogEntry Video     │    │                                              │ │
 │  │  Newsletter-   Book      │    │  sagarlad-ebooks (private)                  │ │
 │  │    Subscriber  Quote     │    │  ├── ebook PDFs/EPUBs                       │ │
 │  │  Newsletter-   Social    │    │  └── max 25MB, service-role only            │ │
 │  │    Campaign    Link      │    │                                              │ │
 │  │  Newsletter-   Contact-  │    │  Image Pipeline: Sharp → WebP (q82)         │ │
 │  │    Delivery    Request   │    │                                              │ │
 │  │  RateLimitEntry          │    └──────────────────────────────────────────────┘ │
 │  └─────────────────────────┘                                                     │
 └──────────────────────────────────────────────────────────────────────────────────┘
          │                                                    │
          │ reads                                               │ uploads/reads
          ▼                                                    ▼
 ┌────────────────────────┐                    ┌────────────────────────────────────┐
 │   BREVO (Free Tier)    │                    │         EXTERNAL SERVICES          │
 │                        │                    │                                    │
 │  SMTP API              │                    │  Google Analytics (GA4)            │
 │  300 emails/day        │                    │  ├── Site: gtag.js (client)        │
 │  Queue → Batch → Send  │                    │  └── Admin: Data API (dashboard)   │
 │  Unsubscribe tokens    │                    │                                    │
 └────────────────────────┘                    │  YouTube / Instagram / Vimeo       │
                                              │  └── iframe embeds on site          │
                                              │                                    │
                                              │  Topmate.io                        │
                                              │  └── mentorship booking             │
                                              └────────────────────────────────────┘
```

---

## 2. Site App Architecture

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                         SITE APP — apps/site/                                    │
 │                         Public-Facing Next.js 16 App                             │
 │                         Port 3000 | ISR 7 Days                                  │
 └──────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ LAYOUT: SiteFrame.tsx (root layout wrapper)                                     │
 │                                                                                  │
 │  ┌──────────┐  ┌──────────────────────────────┐  ┌──────────┐  ┌─────────────┐ │
 │  │ Navbar   │  │        <Outlet />             │  │ Footer   │  │ GA4         │ │
 │  │ (sticky) │  │        (page content)         │  │ (dark)   │  │ gtag.js     │ │
 │  │          │  │                               │  │          │  │ (client)    │ │
 │  │ Logo     │  │                               │  │ Socials  │  │             │ │
 │  │ Menu     │  │                               │  │ Links    │  │ ScrollTop   │ │
 │  │ CTA      │  │                               │  │ Legal    │  │ Button      │ │
 │  └──────────┘  └──────────────────────────────┘  └──────────┘  │ Newsletter  │ │
 │                                                                  │ Popup       │ │
 │                                                                  │ ScrollAnim  │ │
 │                                                                  └─────────────┘ │
 └──────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ PAGES (20 routes)                                                                │
 │                                                                                  │
 │  ┌── HOME (/) ────────────────────────────────────────────────────────────────┐ │
 │  │  Hero → FeaturedOn → AboutMe → TopicsGrid → MindUp → MindUpBook →        │ │
 │  │  BlogPreview → Testimonials → MentorshipCta → NewsletterCta → Gallery     │ │
 │  │  (all dynamically imported, GSAP ScrollTrigger animations)                 │ │
 │  └────────────────────────────────────────────────────────────────────────────┘ │
 │                                                                                  │
 │  ┌── BLOG (/blog) ──────┐  ┌── POST (/blog/[slug]) ────────────────────────┐ │
 │  │  Tabs: Posts | Videos │  │  Article content (DOMPurify sanitized)         │ │
 │  │  Category filter      │  │  ReadingProgress bar                           │ │
 │  │  Search (q param)     │  │  ShareButtons (Twitter/LI/WA/Email/Copy)      │ │
 │  │  Pagination           │  │  CommentsSection (moderated, paginated)        │ │
 │  │  Reading time on card │  │  Related posts                                 │ │
 │  └───────────────────────┘  │  JSON-LD structured data                       │ │
 │                              └────────────────────────────────────────────────┘ │
 │                                                                                  │
 │  ┌── CONTENT (/content, /content/[slug]) ────────────────────────────────────┐ │
 │  │  Category pages with topic detail views                                   │ │
 │  └────────────────────────────────────────────────────────────────────────────┘ │
 │                                                                                  │
 │  ┌── BOOKS (/books) ──┐  ┌── EBOOKS (/ebooks) ──┐  ┌── VIDEOS (/videos) ──┐ │
 │  │  Published books    │  │  Downloadable ebooks  │  │  YouTube + Instagram  │ │
 │  │  Amazon/OL covers   │  │  Gated download       │  │  Video articles       │ │
 │  └────────────────────┘  │  (email required)     │  └──────────────────────┘ │
 │                           └───────────────────────┘                            │
 │                                                                                  │
 │  ┌── SPEAKING (/speaking) ─┐  ┌── ABOUT (/about) ──┐  ┌── QUOTES (/quotes)┐ │
 │  │  TEDx spotlight          │  │  Journey timeline   │  │  Sayings collection│ │
 │  │  Gallery + stages        │  │  Milestones         │  │  Filtered by tag   │ │
 │  │  Contact form            │  │  Sticky sub-nav     │  └────────────────────┘ │
 │  └──────────────────────────┘  └─────────────────────┘                         │
 │                                                                                  │
 │  ┌── OTHER ───────────────────────────────────────────────────────────────────┐ │
 │  │  /newsletter    Newsletter subscription page                               │ │
 │  │  /contact       General contact form                                       │ │
 │  │  /socials       Social media links                                         │ │
 │  │  /mentorship    Mentorship info + Topmate booking                          │ │
 │  │  /privacy       Privacy policy                                             │ │
 │  │  /terms         Terms of service                                           │ │
 │  └────────────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ API ROUTES (13 handlers)                                                        │
 │                                                                                  │
 │  PUBLIC READ APIs:                                                               │
 │  ┌──────────────────────┬─────────────────────────────────────────────────────┐ │
 │  │ GET /api/socials     │ Social links (hardcoded fallback if DB down)        │ │
 │  │ GET /api/categories  │ Categories (hardcoded fallback if DB down)          │ │
 │  │ GET /api/books       │ Books by type (published/read/ebook)                │ │
 │  │ GET /api/videos      │ Videos with cursor pagination + platform filter     │ │
 │  │ GET /api/comments    │ Approved comments for a post                        │ │
 │  └──────────────────────┴─────────────────────────────────────────────────────┘ │
 │                                                                                  │
 │  PUBLIC WRITE APIs (rate limited):                                               │
 │  ┌──────────────────────┬─────────────────────────────────────────────────────┐ │
 │  │ POST /api/contact    │ Contact form (5/60s, Zod validated)                │ │
 │  │ POST /api/newsletter │ Subscribe (10/60s, handles resubscribe)             │ │
 │  │ POST /api/comments   │ Submit comment (10/60s, moderation queue)           │ │
 │  │ POST /api/ebooks/    │ Download ebook (5/60s, email gate)                 │ │
 │  │   download/[id]      │                                                     │ │
 │  └──────────────────────┴─────────────────────────────────────────────────────┘ │
 │                                                                                  │
 │  INFRASTRUCTURE APIs:                                                            │
 │  ┌──────────────────────┬─────────────────────────────────────────────────────┐ │
 │  │ GET /api/newsletter/ │ One-click unsubscribe (token in email footer)       │ │
 │  │   unsubscribe        │                                                     │ │
 │  │ GET/POST /api/       │ Drain newsletter queue (CRON_SECRET protected)      │ │
 │  │   newsletter/process │                                                     │ │
 │  │ POST /api/revalidate │ Cross-app revalidation (CRON_SECRET + header)      │ │
 │  │ GET /api/cron/       │ Supabase keep-alive + auto-publish (CRON_SECRET)   │ │
 │  │   keepalive          │                                                     │ │
 │  └──────────────────────┴─────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ LIB MODULES (22 files)                                                          │
 │                                                                                  │
 │  DATA LAYER:                                                                    │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
 │  │ db.ts        │  │ content.ts   │  │ site.ts      │  │ heartbeat.ts       │ │
 │  │ re-exports   │  │ cached       │  │ SITE config, │  │ auto-publish +     │ │
 │  │ prisma +     │  │ fetchers     │  │ VISIBLE_     │  │ Supabase ping      │ │
 │  │ dbSafe       │  │ (7d cache)   │  │ POST_WHERE   │  │ (60s debounce)     │ │
 │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────┘ │
 │                                                                                  │
 │  SECURITY:                                                                      │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
 │  │ sanitize.ts  │  │ rate-limit.ts│  │ email-guard.ts│  │ client-token.ts    │ │
 │  │ DOMPurify    │  │ DB-backed    │  │ disposable   │  │ localStorage       │ │
 │  │ (jsdom)      │  │ (RateLimit-  │  │ email block  │  │ anonymous browser  │ │
 │  │              │  │  Entry table)│  │ list         │  │ token for comments │ │
 │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────┘ │
 │                                                                                  │
 │  INTEGRATIONS:                                                                  │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
 │  │ storage.ts   │  │ newsletter.ts│  │ social-links.ts│ │ youtube.ts         │ │
 │  │ Supabase     │  │ Brevo queue  │  │ DB + fallback │  │ URL parsing +      │ │
 │  │ Storage      │  │ + batch send │  │ (no Telegram) │  │ embed helpers      │ │
 │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────┘ │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                         │
 │  │ instagram.ts │  │ revalidate.ts│  │ audit.ts     │                         │
 │  │ URL parsing  │  │ cache tag    │  │ AuditLogEntry│                         │
 │  │ + embed      │  │ invalidation │  │ write        │                         │
 │  └──────────────┘  └──────────────┘  └──────────────┘                         │
 │                                                                                  │
 │  HELPERS:                                                                       │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
 │  │ validations.ts│ │ client-      │  │ newsletter-  │  │ metrics.ts         │ │
 │  │ Zod schemas  │  │ validators.ts│  │ templates.ts │  │ site-wide          │ │
 │  │ (server)     │  │ (client)     │  │ 3 email      │  │ constants          │ │
 │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────┘ │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                         │
 │  │ mindup.ts    │  │ gsap.ts      │  │ social-      │                         │
 │  │ framework    │  │ ScrollTrigger│  │ icons.ts     │                         │
 │  │ data         │  │ registration │  │ react-icons  │                         │
 │  └──────────────┘  └──────────────┘  └──────────────┘                         │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Admin App Architecture

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                         ADMIN APP — apps/admin/                                  │
 │                         Next.js 16 Admin Panel                                   │
 │                         Port 3001 | NextAuth JWT + 2FA                           │
 └──────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ AUTHENTICATION FLOW                                                              │
 │                                                                                  │
 │  ┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
 │  │ Login    │───►│ NextAuth      │───►│ bcryptjs     │───►│ JWT Token        │  │
 │  │ Page     │    │ Credentials   │    │ compare      │    │ (24h maxAge)     │  │
 │  │          │    │ Provider      │    │ password     │    │ userId + role    │  │
 │  │ Email +  │    │              │    │              │    │                  │  │
 │  │ Password │    │              │    │              │    │                  │  │
 │  └──────────┘    └──────────────┘    └──────────────┘    └────────┬─────────┘  │
 │                                                                   │             │
 │  ┌────────────────────────────────────────────────────────────────▼───────────┐ │
 │  │                     TWO-FACTOR AUTH (if enabled)                           │ │
 │  │                                                                             │ │
 │  │  ┌──────────┐    ┌──────────────┐    ┌──────────────┐                     │ │
 │  │  │ 2FA OTP  │───►│ otplib       │───►│ TOTP verify  │───► Session active  │ │
 │  │  │ Input    │    │ authenticator│    │ (30s window) │                     │ │
 │  │  └──────────┘    └──────────────┘    └──────────────┘                     │ │
 │  │                                                                             │ │
 │  │  OR: Recovery Code → single-use alphanumeric → bypass TOTP                 │ │
 │  └─────────────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ PANEL LAYOUT (authenticated)                                                     │
 │                                                                                  │
 │  ┌──────────────┐  ┌──────────────────────────────────────────────────────────┐ │
 │  │              │  │                                                          │ │
 │  │   SIDEBAR    │  │                    <Outlet />                            │ │
 │  │              │  │                    (page content)                         │ │
 │  │  Dashboard   │  │                                                          │ │
 │  │  Posts       │  │                                                          │ │
 │  │  Content     │  │                                                          │ │
 │  │  Books       │  │                                                          │ │
 │  │  Videos      │  │                                                          │ │
 │  │  Newsletter  │  │                                                          │ │
 │  │  Social      │  │                                                          │ │
 │  │  Community   │  │                                                          │ │
 │  │  Settings    │  │                                                          │ │
 │  │              │  │                                                          │ │
 │  │  ────────    │  │                                                          │ │
 │  │  Logout      │  │                                                          │ │
 │  └──────────────┘  └──────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ PAGES (12 routes)                                                                │
 │                                                                                  │
 │  ┌── LOGIN ───────────────────────────────────────────────────────────────────┐ │
 │  │  /admin  →  Email + Password + optional 2FA OTP                           │ │
 │  │  Redirects to /admin/posts if authenticated                                │ │
 │  └────────────────────────────────────────────────────────────────────────────┘ │
 │                                                                                  │
 │  ┌── DASHBOARD (/admin/dashboard) ── Phase 2 ────────────────────────────────┐ │
 │  │  GA4 analytics: daily traffic, top pages, sources, devices, countries     │ │
 │  │  Post stats: Published / Drafts / Scheduled counts                        │ │
 │  └────────────────────────────────────────────────────────────────────────────┘ │
 │                                                                                  │
 │  ┌── POSTS (/admin/posts) ── Phase 1 ────────────────────────────────────────┐ │
 │  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
 │  │  │ PostsClientTable                                                   │   │ │
 │  │  │                                                                    │   │ │
 │  │  │  Search ─── Sort (Date/Title/Status) ─── Filter (All/Pub/Draft/Sch)│   │ │
 │  │  │                                                                    │   │ │
 │  │  │  ┌──────────┬──────────┬────────┬──────────┬──────────┬────────┐  │   │ │
 │  │  │  │ Cover    │ Title    │ Status │ Date     │ Views    │ Actions│  │   │ │
 │  │  │  │ image    │          │ Badge  │          │          │        │  │   │ │
 │  │  │  ├──────────┼──────────┼────────┼──────────┼──────────┼────────┤  │   │ │
 │  │  │  │ thumb    │ Post     │ ● Pub  │ Mar 15   │ 1,234    │ ✏️ 🗑️  │  │   │ │
 │  │  │  │          │ Title    │ ○ Draft│          │          │ 👁️ 📋  │  │   │ │
 │  │  │  │          │          │ ◐ Sched│          │          │ 🟢 Pub │  │   │ │
 │  │  │  └──────────┴──────────┴────────┴──────────┴──────────┴────────┘  │   │ │
 │  │  └────────────────────────────────────────────────────────────────────┘   │ │
 │  │                                                                            │ │
 │  │  ┌── NEW/EDIT POST (/admin/posts/new, /[slug]/edit) ────────────────────┐ │ │
 │  │  │  Title ─── Kicker ─── Category ─── Cover Image upload               │ │ │
 │  │  │  ┌──────────────────────────────────────────────────────────────┐    │ │ │
 │  │  │  │ TipTap Rich Text Editor                                      │    │ │ │
 │  │  │  │ Bold, Italic, Underline, Highlight, Color, Link, Image      │    │ │ │
 │  │  │  │ Text Align (Left/Center/Right), Typography, Character Count │    │ │ │
 │  │  │  └──────────────────────────────────────────────────────────────┘    │ │ │
 │  │  │  Published ● ─── Featured ★ ─── Show Cover ◉ ─── Show Author ◉     │ │ │
 │  │  │  Schedule Picker (date + time) ─── Footer Note ─── Content (HTML)   │ │ │
 │  │  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │ │ │
 │  │  │  │ 💾 Save      │  │ 👁️ Preview    │  │ ← Back to Posts          │   │ │ │
 │  │  │  └─────────────┘  └──────────────┘  └──────────────────────────┘   │ │ │
 │  │  └────────────────────────────────────────────────────────────────────┘  │ │
 │  └────────────────────────────────────────────────────────────────────────────┘ │
 │                                                                                  │
 │  ┌── CONTENT (/admin/content) ── Phase 2 ──┐  ┌── BOOKS (/admin/books) ──────┐ │
 │  │  Category manager                        │  │  3 tabs: Published/Read/Ebook │ │
 │  │  Topic detail pages                      │  │  CRUD + import + ebook upload │ │
 │  └──────────────────────────────────────────┘  └──────────────────────────────┘ │
 │                                                                                  │
 │  ┌── VIDEOS (/admin/videos) ── Phase 2 ──┐  ┌── NEWSLETTER (/admin/newsletter)┐ │
 │  │  CRUD + YouTube/Instagram import       │  │  Composer (3 templates)          │ │
 │  │  Embed URL normalization                │  │  Test send → Campaign history    │ │
 │  │  Layout: video-first/text-first/split   │  │  Subscriber management           │ │
 │  └────────────────────────────────────────┘  └──────────────────────────────────┘ │
 │                                                                                  │
 │  ┌── SOCIAL (/admin/social) ── Phase 2 ─┐  ┌── COMMUNITY (/admin/moderation) ┐ │
 │  │  Edit social links (icon, color, URL) │  │  Comments: approve/delete         │ │
 │  │  Sort order control                   │  │  Subscribers: view/delete         │ │
 │  └───────────────────────────────────────┘  │  Enquiries: view/delete           │ │
 │                                              └────────────────────────────────────┘ │
 │                                                                                  │
 │  ┌── SETTINGS (/admin/settings) ── Phase 1 ──────────────────────────────────┐ │
 │  │  Profile ─── Change Password ─── Two-Factor Auth ─── Security Log         │ │
 │  └────────────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ API ROUTES (25 handlers)                                                        │
 │                                                                                  │
 │  ┌── AUTH ─────────────────────────────────────────────────────────────────────┐ │
 │  │ POST /api/auth/[...nextauth]  NextAuth v5 handler (login/session/JWT)      │ │
 │  └────────────────────────────────────────────────────────────────────────────┘ │
 │                                                                                  │
 │  ┌── CRUD APIs (all requireAdmin + CSRF check) ──────────────────────────────┐ │
 │  │                                                                            │ │
 │  │  POSTS:                        CATEGORIES:                                 │ │
 │  │  GET/POST /api/admin/posts     GET    /api/admin/categories               │ │
 │  │  PUT/DELETE /api/admin/posts   POST   /api/admin/categories               │ │
 │  │  POST /api/admin/posts/        PUT    /api/admin/categories               │ │
 │  │    [id]/publish-now            DELETE /api/admin/categories?id=X          │ │
 │  │                                                                            │ │
 │  │  BOOKS:                        VIDEOS:                                     │ │
 │  │  GET/POST /api/admin/books     GET/POST /api/admin/videos                 │ │
 │  │  PUT/DELETE /api/admin/books   PUT/DELETE /api/admin/videos               │ │
 │  │  POST /api/admin/books/import  POST /api/admin/videos/import              │ │
 │  │                                                                            │ │
 │  │  QUOTES:                       SOCIALS:                                    │ │
 │  │  GET/POST/PUT/DELETE           GET /api/admin/socials                     │ │
 │  │    /api/admin/quotes           PUT /api/admin/socials                     │ │
 │  │                                                                            │ │
 │  │  NEWSLETTER:                   MODERATION:                                 │ │
 │  │  GET/POST /api/admin/          GET/PATCH /api/admin/moderation            │ │
 │  │    newsletter                  GET /api/admin/moderation/counts           │ │
 │  │  GET /api/admin/newsletter/    DELETE /api/admin/moderation?id=X          │ │
 │  │    drafts                                                            │ │
 │  │  DELETE /api/admin/newsletter/ SUBSCRIBERS:                                │ │
 │  │    [campaignId]               DELETE /api/admin/newsletter/               │ │
 │  │  POST /api/admin/newsletter/     subscribers/[id]                         │ │
 │  │    test                                                           │ │
 │  └────────────────────────────────────────────────────────────────────────────┘ │
 │                                                                                  │
 │  ┌── INFRASTRUCTURE ──────────────────────────────────────────────────────────┐ │
 │  │  POST /api/admin/upload           Image upload (multipart + base64)       │ │
 │  │  POST /api/admin/upload-from-url  Remote image → Supabase                 │ │
 │  │  POST /api/admin/ebook/upload     Ebook → private Supabase bucket         │ │
 │  │  GET  /api/admin/analytics        GA4 Data API (dashboard stats)          │ │
 │  │  GET/POST /api/admin/security     2FA setup/enable/disable + QR          │ │
 │  │  PATCH /api/admin/profile         Update profile/password/email           │ │
 │  │  GET  /api/admin/health           System health check                     │ │
 │  │  GET  /api/cron/keepalive         Supabase keep-alive                     │ │
 │  └────────────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ LIB MODULES (27 files)                                                          │
 │                                                                                  │
 │  AUTH:                                                                          │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
 │  │ auth.ts      │  │ requireAdmin │  │ rate-limit.ts│  │ audit.ts           │ │
 │  │ NextAuth v5  │  │ Session +    │  │ In-memory    │  │ AuditLogEntry      │ │
 │  │ config +     │  │ CSRF check   │  │ Map-based    │  │ write (never       │ │
 │  │ callbacks    │  │              │  │ (admin-only) │  │ blocks action)     │ │
 │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────┘ │
 │                                                                                  │
 │  DATA + INTEGRATIONS:                                                            │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
 │  │ db.ts        │  │ site.ts      │  │ revalidate.ts│  │ newsletter.ts      │ │
 │  │ re-exports   │  │ slugify,     │  │ Cross-app    │  │ Brevo API +        │ │
 │  │ prisma +     │  │ VISIBLE_     │  │ revalidation │  │ campaign queue     │ │
 │  │ dbSafe       │  │ POST_WHERE   │  │ via header   │  │ + batch send       │ │
 │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────┘ │
 │                                                                                  │
 │  SECURITY:                                                                      │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
 │  │ sanitize.ts  │  │ csrf.ts      │  │ email-guard  │  │ validations.ts     │ │
 │  │ DOMPurify    │  │ Origin/      │  │ Disposable   │  │ Zod schemas        │ │
 │  │ (jsdom)      │  │ Referer      │  │ email block  │  │ (admin + public)   │ │
 │  │              │  │ check        │  │ list         │  │                    │ │
 │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────┘ │
 │                                                                                  │
 │  STORAGE + MEDIA:                                                                │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
 │  │ storage.ts   │  │ upload-helpers│ │ normalize-   │  │ password-helpers   │ │
 │  │ Supabase     │  │ Image +      │  │ video.ts     │  │ bcryptjs hash +    │ │
 │  │ Storage ops  │  │ ebook upload │  │ Embed URL    │  │ verify             │ │
 │  └──────────────┘  └──────────────┘  │ normalization│  └────────────────────┘ │
 │                                       └──────────────┘                         │
 │  UTILITIES:                                                                     │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
 │  │ cache-headers│  │ password-    │  │ helpers.ts   │  │ db.ts              │ │
 │  │ NO_STORE     │  │ helpers.ts   │  │ isEmpty,     │  │ re-exports from    │ │
 │  │ HEADERS      │  │ bcrypt hash  │  │ formatDate   │  │ @sagarlad/db       │ │
 │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                         POSTGRESQL SCHEMA (Supabase)                             │
 └──────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
  │      USER        │         │     ACCOUNT       │         │     SESSION      │
  │──────────────────│         │──────────────────│         │──────────────────│
  │ id          PK  │◄───┐    │ id          PK   │    ┌───►│ id          PK   │
  │ email       UNI │    │    │ userId      FK ──┼────┘    │ sessionToken UNI │
  │ passwordHash    │    │    │ provider        │         │ userId      FK ──┼──┐
  │ role        DEF │    │    │ providerAccId   │         │ expires          │  │
  │ twoFactorEnabld │    │    │ access_token    │         └──────────────────┘  │
  │ twoFactorSecret │    │    │ refresh_token   │                               │
  │ twoFactorRecov  │    │    └──────────────────┘         ┌──────────────────┐ │
  │ lastLoginAt     │    │                                 │ VERIFICATION-    │ │
  │ lastLoginIp     │    │                                 │ TOKEN            │ │
  └────────┬────────┘    │                                 │──────────────────│ │
           │             │                                 │ identifier       │ │
           │ 1:N         │                                 │ token       UNI  │ │
           ▼             │                                 │ expires          │ │
  ┌──────────────────┐   │                                 └──────────────────┘ │
  │  AUDIT_LOG_ENTRY │   │                                                       │
  │──────────────────│   │                                                       │
  │ id          PK  │   │                                                       │
  │ userId      FK ─┼───┘                                                       │
  │ action          │  LOGIN_OK, LOGIN_FAIL, LOGIN_LOCKED,                      │
  │ ip              │  POST_CREATE/UPDATE/DELETE, NEWSLETTER,                    │
  │ meta       JSON │  EBOOK_DOWNLOAD, UPLOAD, PASSWORD_CHANGE, ...              │
  │ createdAt       │                                                            │
  └──────────────────┘                                                            │
                                                                                  │
  ┌──────────────────┐         ┌──────────────────┐                              │
  │    CATEGORY      │         │      POST         │                              │
  │──────────────────│         │──────────────────│                              │
  │ id          PK  │◄────────│ categoryId  FK   │                              │
  │ name            │    1:N  │ authorId    FK ──┼──► User.id                    │
  │ slug       UNI  │         │ id          PK   │                              │
  └────────┬────────┘         │ title            │                              │
           │                  │ slug        UNI  │                              │
           │ 1:N              │ content          │  (TipTap HTML, sanitized)    │
           ▼                  │ excerpt          │                              │
  ┌──────────────────┐        │ coverImage       │                              │
  │      VIDEO       │        │ kicker           │                              │
  │──────────────────│        │ featured    DEF  │                              │
  │ id          PK   │        │ published   DEF  │                              │
  │ categoryId  FK   │        │ publishedAt      │                              │
  │ title            │        │ scheduledAt      │  ← auto-publish via heartbeat│
  │ slug        UNI  │        │ showCover   DEF  │                              │
  │ embedUrl         │        │ showAuthorBox    │                              │
  │ thumbnail        │        │ footerNote       │                              │
  │ content          │        │ views       DEF  │                              │
  │ layout           │        │ deletedAt        │  ← soft delete               │
  │ published   DEF  │        └──────────────────┘                              │
  │ sortOrder        │                                                          │
  │ deletedAt        │        ┌──────────────────┐                              │
  └──────────────────┘        │     COMMENT       │                              │
                              │──────────────────│                              │
  ┌──────────────────┐        │ id          PK   │                              │
  │      BOOK        │        │ postId      FK ──┼──► Post.id                   │
  │──────────────────│        │ userId      FK ──┼──► User.id (nullable)        │
  │ id          PK   │        │ content          │                              │
  │ type             │        │ name             │  (commenter name)            │
  │  PUBLISHED       │        │ email            │  (commenter email)           │
  │  READ            │        │ ip               │                              │
  │  EBOOK           │        │ userAgent        │                              │
  │ title            │        │ approved    DEF  │  ← moderation queue          │
  │ author           │        │ clientToken      │  ← anonymous browser token   │
  │ tagline          │        │ createdAt        │                              │
  │ description      │        └──────────────────┘                              │
  │ learning         │                                                          │
  │ note             │        ┌──────────────────────────┐                      │
  │ imageUrl         │        │ NEWSLETTER_SUBSCRIBER     │                      │
  │ buyUrl           │        │──────────────────────────│                      │
  │ fileKey          │        │ id               PK      │                      │
  │  (Supabase path) │        │ email            UNI     │                      │
  │ free         DEF │        │ name                    │                      │
  │ featured     DEF │        │ acceptedTerms    DEF    │                      │
  │ published    DEF │        │ unsubscribed     DEF    │                      │
  │ sortOrder        │        │ unsubscribeToken UNI    │ ← one-click unsub    │
  │ deletedAt        │        │ createdAt               │                      │
  └──────────────────┘        └──────────────────────────┘                      │
                                    │                                           │
                              1:N   │                                           │
                                    ▼                                           │
  ┌──────────────────┐        ┌──────────────────────────┐                      │
  │    QUOTE         │        │ NEWSLETTER_CAMPAIGN       │                      │
  │──────────────────│        │──────────────────────────│                      │
  │ id          PK   │        │ id               PK      │                      │
  │ text             │        │ subject                 │                      │
  │ tag              │        │ html                    │                      │
  └──────────────────┘        │ contentJson       JSON   │ ← composer state     │
                              │ draft         DEF        │                      │
  ┌──────────────────┐        │ createdAt               │                      │
  │   SOCIAL_LINK    │        └────────────┬─────────────┘                      │
  │──────────────────│                     │ 1:N                                │
  │ id          PK   │                     ▼                                    │
  │ key         UNI  │        ┌──────────────────────────┐                      │
  │ label            │        │ NEWSLETTER_DELIVERY       │                      │
  │ handle           │        │──────────────────────────│                      │
  │ href             │        │ id               PK      │                      │
  │ icon             │        │ campaignId    FK          │                      │
  │ logoUrl          │        │ subscriberId  FK          │                      │
  │ color            │        │ status                  │                      │
  │ sortOrder        │        │  QUEUED / SENDING /      │                      │
  │ active     DEF   │        │  SENT / FAILED           │                      │
  └──────────────────┘        │ sentAt                  │                      │
                              │ error                   │                      │
  ┌──────────────────┐        │ UNIQUE(campaignId,       │                      │
  │ CONTACT_REQUEST  │        │        subscriberId)     │                      │
  │──────────────────│        └──────────────────────────┘                      │
  │ id          PK   │                                                          │
  │ firstName        │        ┌──────────────────┐                              │
  │ lastName         │        │ RATE_LIMIT_ENTRY  │                              │
  │ email            │        │──────────────────│                              │
  │ phone            │        │ key          PK  │  (composite key)             │
  │ organization     │        │ count            │                              │
  │ eventDate        │        │ resetAt          │                              │
  │ message          │        └──────────────────┘                              │
  │ type             │                                                          │
  │  EVENT/INTERVIEW │                                                          │
  │  /SPEAKING       │                                                          │
  └──────────────────┘                                                          │
```

---

## 5. Authentication & Security Flow

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                    SECURITY LAYERS (Defense in Depth)                             │
 └──────────────────────────────────────────────────────────────────────────────────┘

 LAYER 1: INPUT VALIDATION
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                 │
 │  User Input ──► Zod Schema ──► DOMPurify ──► DB Query                          │
 │                  (max length,    (strip script,  (parameterized,                │
 │                   required,      style, iframe,   no SQL injection)             │
 │                   email format)  on* handlers,                                 │
 │                                  svg/math)                                     │
 └─────────────────────────────────────────────────────────────────────────────────┘

 LAYER 2: AUTHENTICATION + AUTHORIZATION
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                 │
 │  ┌─── Public Routes ─────────────────────────────────────────────────────────┐ │
 │  │  No auth required. Rate limited via DB-backed RateLimitEntry table.       │ │
 │  │  Contact: 5/60s │ Newsletter: 10/60s │ Comments: 10/60s │ Ebooks: 5/60s │ │
 │  └───────────────────────────────────────────────────────────────────────────┘ │
 │                                                                                 │
 │  ┌─── Admin Routes ──────────────────────────────────────────────────────────┐ │
 │  │                                                                            │ │
 │  │  Request ──► requireAdmin(request)                                         │ │
 │  │                  │                                                         │ │
 │  │                  ├──► Session Check ──► JWT valid? ──► role === "ADMIN"?  │ │
 │  │                  │                                                         │ │
 │  │                  ├──► CSRF Check (POST/PUT/DELETE/PATCH only)             │ │
 │  │                  │    Origin/Referer ──► matches AUTH_URL host?           │ │
 │  │                  │                                                         │ │
 │  │                  └──► Returns Session or null                              │ │
 │  │                                                                            │ │
 │  │  null ──► 401 Unauthorized                                                │ │
 │  │  session ──► Handler continues                                            │ │
 │  └───────────────────────────────────────────────────────────────────────────┘ │
 │                                                                                 │
 │  ┌─── Login Flow ────────────────────────────────────────────────────────────┐ │
 │  │                                                                            │ │
 │  │  Email + Password ──► NextAuth Credentials ──► bcryptjs compare          │ │
 │  │                              │                                            │ │
 │  │                     ┌────────┴────────┐                                   │ │
 │  │                     │                  │                                   │ │
 │  │              2FA disabled         2FA enabled                               │ │
 │  │              │                  │                                           │ │
 │  │              ▼                  ▼                                           │ │
 │  │         JWT issued      TOTP code input                                    │ │
 │  │         (24h maxAge)    │                                                  │ │
 │  │                     otplib verify ──► JWT issued                          │ │
 │  │                                                                            │ │
 │  │  Failed attempts:                                                          │ │
 │  │  3 failures (account+IP) in 30min ──► LOCKED (30min)                     │ │
 │  │  In-memory rate limit: 10 req/IP per 60s                                  │ │
 │  └───────────────────────────────────────────────────────────────────────────┘ │
 └─────────────────────────────────────────────────────────────────────────────────┘

 LAYER 3: OUTPUT PROTECTION
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                 │
 │  HTTP Headers (via next.config.ts):                                            │
 │  ┌────────────────────────────────────────────────────────────────────────┐    │
 │  │  X-Content-Type-Options:    nosniff                                    │    │
 │  │  X-Frame-Options:           SAMEORIGIN                                 │    │
 │  │  Referrer-Policy:           strict-origin-when-cross-origin            │    │
 │  │  Permissions-Policy:        camera=(), microphone=(), geolocation=()   │    │
 │  │  Strict-Transport-Security: max-age=31536000; includeSubDomains        │    │
 │  └────────────────────────────────────────────────────────────────────────┘    │
 │                                                                                 │
 │  Content Security Policy:                                                       │
 │  ┌────────────────────────────────────────────────────────────────────────┐    │
 │  │  Site:  script-src 'self' 'unsafe-inline' + gtag                     │    │
 │  │         img-src  'self' + Supabase + Amazon + OL + Archive + YT       │    │
 │  │         frame-src self + YouTube + Instagram + Vimeo + Topmate        │    │
 │  │         connect-src 'self' + Supabase + GA                           │    │
 │  │                                                                        │    │
 │  │  Admin: script-src 'self' 'unsafe-inline'  (NO unsafe-eval)          │    │
 │  │         Same as site for img/connect, tighter frame-src              │    │
 │  │                                                                        │    │
 │  │  Both:  default-src 'self', object-src 'none', base-uri 'self',      │    │
 │  │         form-action 'self', frame-ancestors 'self'                    │    │
 │  └────────────────────────────────────────────────────────────────────────┘    │
 └─────────────────────────────────────────────────────────────────────────────────┘

 LAYER 4: RATE LIMITING
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                 │
 │  ┌─── Site (DB-backed, works across serverless) ────────────────────────────┐ │
 │  │  RateLimitEntry table: key (PK), count, resetAt                          │ │
 │  │  Atomic upsert + increment, opportunistic cleanup of expired rows        │ │
 │  │  Contact: 5/60s │ Newsletter: 10/60s │ Comments: 10/60s │ Ebook: 5/60s  │ │
 │  └───────────────────────────────────────────────────────────────────────────┘ │
 │                                                                                 │
 │  ┌─── Admin (in-memory Map, same-instance only) ────────────────────────────┐ │
 │  │  Login: 10 requests per IP per 60s                                       │ │
 │  │  Account lockout: 3 failures per 30min (DB-backed via AuditLogEntry)    │ │
 │  └───────────────────────────────────────────────────────────────────────────┘ │
 └─────────────────────────────────────────────────────────────────────────────────┘

 LAYER 5: AUDIT TRAIL
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                 │
 │  All admin actions ──► logAudit() ──► AuditLogEntry table                      │
 │                          │                                                      │
 │                          └── try/catch (never blocks primary action)           │
 │                                                                                 │
 │  Actions: LOGIN_OK, LOGIN_FAIL, LOGIN_LOCKED, LOGIN_THROTTLED,                │
 │           2FA_SETUP, 2FA_DISABLE, PASSWORD_CHANGE, PROFILE_UPDATE,            │
 │           POST_CREATE/UPDATE/DELETE, BOOK_*, VIDEO_*, QUOTE_*,                 │
 │           CATEGORY_CREATE/DELETE, COMMENT_APPROVE/DELETE,                      │
 │           SUBSCRIBER_DELETE, CONTACT, NEWSLETTER, EBOOK_DOWNLOAD, UPLOAD       │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Flow: Admin Write → Site Render

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │              ADMIN WRITE → SITE RENDER (Complete Data Flow)                      │
 └──────────────────────────────────────────────────────────────────────────────────┘

  STEP 1: Admin creates/updates/deletes content
  ┌────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                │
  │  Admin UI ──► POST/PUT/DELETE /api/admin/[resource]                           │
  │                    │                                                           │
  │                    ▼                                                           │
  │  ┌──────────────────────────────────────┐                                     │
  │  │ requireAdmin(request)                 │                                     │
  │  │ ├── Session check (JWT + role)        │                                     │
  │  │ └── CSRF check (Origin/Referer)       │                                     │
  │  └──────────────┬───────────────────────┘                                     │
  │                 │                                                              │
  │                 ▼                                                              │
  │  ┌──────────────────────────────────────┐                                     │
  │  │ Zod validation                       │                                     │
  │  │ DOMPurify sanitization (if HTML)     │                                     │
  │  └──────────────┬───────────────────────┘                                     │
  │                 │                                                              │
  │                 ▼                                                              │
  │  ┌──────────────────────────────────────┐                                     │
  │  │ Prisma write to PostgreSQL           │                                     │
  │  │ (Supabase-hosted)                    │                                     │
  │  └──────────────┬───────────────────────┘                                     │
  │                 │                                                              │
  │                 ▼                                                              │
  │  ┌──────────────────────────────────────┐                                     │
  │  │ logAudit(action, { userId, meta })   │                                     │
  │  │ (AuditLogEntry — never blocks)       │                                     │
  │  └──────────────┬───────────────────────┘                                     │
  │                 │                                                              │
  │                 ▼                                                              │
  │  ┌──────────────────────────────────────┐                                     │
  │  │ revalidatePublic()                   │                                     │
  │  │ ├── Admin: invalidate local cache    │                                     │
  │  │ │   tags ("socials", "content")      │                                     │
  │  │ └── HTTP POST to SITE_URL/           │                                     │
  │  │     api/revalidate                   │                                     │
  │  │     Header: x-revalidate-secret      │                                     │
  │  │     + CRON_SECRET                    │                                     │
  │  └──────────────┬───────────────────────┘                                     │
  │                 │                                                              │
  └─────────────────┼──────────────────────────────────────────────────────────────┘
                    │
  STEP 2: Site invalidates its cache
  ┌─────────────────┼──────────────────────────────────────────────────────────────┐
                    │                                                              │
                    ▼                                                              │
  ┌──────────────────────────────────────────────────────────────────────────────┐ │
  │  POST /api/revalidate (Site)                                                 │ │
  │                                                                              │ │
  │  1. Validate x-revalidate-secret ──► constant-time compare (timingSafeEqual)│ │
  │  2. revalidatePath("/")              (Home page)                            │ │
  │     revalidatePath("/blog")          (Blog listing)                         │ │
  │     revalidatePath("/blog/[slug]")   (All blog posts)                       │ │
  │     revalidatePath("/books")         (Books page)                           │ │
  │     revalidatePath("/videos")        (Videos page)                          │ │
  │     revalidatePath("/quotes")        (Quotes page)                          │ │
  │     ... (all public paths)                                                   │ │
  │  3. revalidateTag("content")        (categories, videos unstable_cache)     │ │
  │     revalidateTag("categories")     (category list)                         │ │
  │     revalidateTag("videos")         (video list + by-slug)                  │ │
  │     revalidateTag("books")          (book list)                             │ │
  │     revalidateTag("quotes")         (quote list)                            │ │
  │     revalidateTag("socials")        (social links)                          │ │
  │                                                                              │ │
  │  Response: { revalidated: true, paths: N, tags: M }                         │ │
  └──────────────────────────────────────────────────────────────────────────────┘ │
                    │                                                              │
  STEP 3: Next page visit triggers re-render                                      │
  ┌─────────────────┼──────────────────────────────────────────────────────────────┐
                    │                                                              │
                    ▼                                                              │
  ┌──────────────────────────────────────────────────────────────────────────────┐ │
  │  User visits sagarlad.com/blog (or any invalidated path)                     │ │
  │                                                                              │ │
  │  1. Next.js checks ISR cache ──► MISS (was invalidated)                     │ │
  │  2. Server component runs:                                                   │ │
  │     prisma.post.findMany({ where: VISIBLE_POST_WHERE })                     │ │
  │     ├── VISIBLE_POST_WHERE includes: published = true OR                    │ │
  │     │   (published = false AND scheduledAt <= now AND scheduledAt != null)  │ │
  │     ├── deletedAt IS NULL                                                   │ │
  │     └── category filter + search + pagination                               │ │
  │  3. unstable_cache checks tag ──► MISS (was invalidated)                    │ │
  │  4. Content fetched from DB, rendered, cached for 7 days                    │ │
  │  5. ISR cache populated ──► serves cached version to subsequent visitors    │ │
  └──────────────────────────────────────────────────────────────────────────────┘ │
                    │                                                              │
  FALLBACK: If revalidation fails (network, timeout)                             │
  ┌─────────────────┼──────────────────────────────────────────────────────────────┐
                    │                                                              │
                    ▼                                                              │
  ┌──────────────────────────────────────────────────────────────────────────────┐ │
  │  ISR max-age (7 days) catches stale content                                 │ │
  │  Next page visit will re-render fresh data (ISR background revalidation)    │ │
  │  Site continues to serve cached version until then                          │ │
  └──────────────────────────────────────────────────────────────────────────────┘ │
```

---

## 7. Newsletter Pipeline

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                    NEWSLETTER PIPELINE (Brevo + Queue)                            │
 └──────────────────────────────────────────────────────────────────────────────────┘

  ┌─── STEP 1: Admin Composes ────────────────────────────────────────────────────┐
  │                                                                                │
  │  NewsletterPage.tsx                                                           │
  │  ├── Template selector (letter / editorial / minimal)                         │
  │  ├── Rich text editor (TipTap)                                                │
  │  ├── Subject line                                                              │
  │  └── "Send Test" or "Send Campaign"                                           │
  │                                                                                │
  │  POST /api/admin/newsletter                                                   │
  │  ├── sanitizeHtml(html)  ──► DOMPurify strips dangerous content               │
  │  ├── enqueueCampaign(subject, html)                                            │
  │  │   ├── Create NewsletterCampaign record                                     │
  │  │   └── Create NewsletterDelivery records (QUEUED) for each subscriber       │
  │  │       WHERE unsubscribed = false                                           │
  │  ├── Store contentJson (composer state for future duplicate)                  │
  │  ├── logAudit("NEWSLETTER", { subject, queued })                              │
  │  └── processNewsletterQueue()  ──► drain what fits in today's quota           │
  └────────────────────────────────────────────────────────────────────────────────┘

  ┌─── STEP 2: Queue Processing ─────────────────────────────────────────────────┐
  │                                                                                │
  │  processNewsletterQueue()                                                     │
  │  ├── Fetch DAILY_EMAIL_LIMIT from env (default: 50)                          │
  │  ├── Count today's SENT deliveries                                            │
  │  ├── remaining = DAILY_EMAIL_LIMIT - sentToday                               │
  │  ├── Fetch next NEWSLETTER_BATCH_SIZE (50) QUEUED deliveries                 │
  │  │   (batch limited to stay under Vercel Hobby 10s timeout)                   │
  │  ├── For each delivery:                                                       │
  │  │   ├── Mark as SENDING                                                      │
  │  │   ├── Build email via emailShell(template, { subject, html, unsubscribe }) │
  │  │   ├── Brevo SMTP API: POST https://api.brevo.com/v3/smtp/email           │
  │  │   │   ├── to: subscriber email                                             │
  │  │   │   ├── subject: campaign subject                                        │
  │  │   │   ├── htmlContent: wrapped email                                       │
  │  │   │   ├── listUnsubscribe: ONE-CLICK URL                                  │
  │  │   │   └── headers: { sender: "Sagar Lad <email>" }                        │
  │  │   ├── Mark as SENT                                                         │
  │  │   └── On error: Mark as FAILED + log error                                │
  │  └── Return { sent, remaining }                                               │
  └────────────────────────────────────────────────────────────────────────────────┘

  ┌─── STEP 3: Drain Triggers ───────────────────────────────────────────────────┐
  │                                                                                │
  │  1. Immediate: processNewsletterQueue() called after campaign creation        │
  │  2. GitHub Actions newsletter-cron: every 30 minutes                          │
  │     GET /api/newsletter/process ──► CRON_SECRET auth ──► drain                │
  │  3. GitHub Actions newsletter-drain: daily at 04:30 UTC                       │
  │     GET /api/newsletter/process ──► CRON_SECRET auth ──► drain                │
  │                                                                                │
  │  ┌────────────────────────────────────────────────────────────────────────┐   │
  │  │  QUOTA MANAGEMENT                                                      │   │
  │  │                                                                        │   │
  │  │  Brevo free tier: 300 emails/day                                      │   │
  │  │  DAILY_EMAIL_LIMIT=50 (configurable)                                  │   │
  │  │  NEWSLETTER_BATCH_SIZE=50 (per invocation)                            │   │
  │  │                                                                        │   │
  │  │  Campaign 1 (200 subs):                                               │   │
  │  │  ├── Immediate drain: 50 sent, 150 queued                             │   │
  │  │  ├── 30min cron: +50 sent, 100 queued                                 │   │
  │  │  ├── 1hr cron: +50 sent, 50 queued                                    │   │
  │  │  ├── 1.5hr cron: +50 sent, 0 queued ✓                                 │   │
  │  │  └── Total: 200 sent across 4 drain cycles                            │   │
  │  └────────────────────────────────────────────────────────────────────────┘   │
  └────────────────────────────────────────────────────────────────────────────────┘

  ┌─── STEP 4: Unsubscribe ──────────────────────────────────────────────────────┐
  │                                                                                │
  │  Email footer contains:                                                       │
  │  <a href="https://sagarlad.com/api/newsletter/unsubscribe?token=ABC123">     │
  │    Unsubscribe                                                                │
  │  </a>                                                                         │
  │                                                                                │
  │  GET /api/newsletter/unsubscribe?token=ABC123                                │
  │  ├── Find subscriber by unsubscribeToken                                      │
  │  ├── Mark unsubscribed = true                                                 │
  │  └── Return: "You're unsubscribed." HTML page                                │
  │                                                                                │
  │  Future campaigns: WHERE unsubscribed = false ──► skips unsubscribed users   │
  └────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Caching & Revalidation Strategy

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                    CACHING & REVALIDATION STRATEGY                               │
 └──────────────────────────────────────────────────────────────────────────────────┘

  ┌─── ISR (Incremental Static Regeneration) ────────────────────────────────────┐
  │                                                                                │
  │  All public pages: revalidate = 604800 (7 days)                               │
  │                                                                                │
  │  ┌──────────────────────────────────────────────────────────────────────────┐ │
  │  │  Build Time: generateStaticParams() prerenders all blog posts           │ │
  │  │  ──────────────────────────────────────────────────────────────────────  │ │
  │  │  First visit: serve prerendered page                                    │ │
  │  │  After 7 days: background revalidation on next visit                   │ │
  │  │  Stale content: served while revalidating                              │ │
  │  └──────────────────────────────────────────────────────────────────────────┘ │
 └────────────────────────────────────────────────────────────────────────────────┘

  ┌─── unstable_cache (Data Layer) ──────────────────────────────────────────────┐
  │                                                                                │
  │  Content helpers cached with tags:                                            │
  │                                                                                │
  │  ┌───────────────────┬────────────────────┬─────────────────────────────────┐ │
  │  │ Function          │ Tag                │ TTL                             │ │
  │  ├───────────────────┼────────────────────┼─────────────────────────────────┤ │
  │  │ getCategories()   │ "categories"       │ 7 days                          │ │
  │  │ getPublishedVideos│ "videos"           │ 7 days                          │ │
  │  │ getPublishedBooks │ "books"            │ 7 days                          │ │
  │  │ getQuotes()       │ "quotes"           │ 7 days                          │ │
  │  │ getSiteSocials()  │ "socials"          │ 7 days                          │ │
  │  │ getPostBySlug()   │ React cache()      │ Per-request dedup only          │ │
  │  └───────────────────┴────────────────────┴─────────────────────────────────┘ │
  │                                                                                │
  │  Invalidation: revalidateTag("tag") on admin writes                          │
  └────────────────────────────────────────────────────────────────────────────────┘

  ┌─── HTTP Cache Headers ───────────────────────────────────────────────────────┐
  │                                                                                │
  │  ┌────────────────────────────────────────────────────────────────────────┐   │
  │  │  Path                      │ Cache-Control                            │   │
  │  ├────────────────────────────┼──────────────────────────────────────────┤   │
  │  │  /images/*                 │ public, max-age=31536000, immutable      │   │
  │  │  /_next/static/*           │ public, max-age=31536000, immutable      │   │
  │  │  /fonts/*                  │ public, max-age=31536000, immutable      │   │
  │  │  /rss.xml                  │ max-age=3600, stale-while-revalidate=86400│  │
  │  │  /api/admin/*              │ no-store, no-cache, must-revalidate      │   │
  │  │  /api/ebooks/download/*    │ private, no-store                         │   │
  │  └────────────────────────────┴──────────────────────────────────────────┘   │
 └────────────────────────────────────────────────────────────────────────────────┘

  ┌─── Revalidation Triggers ────────────────────────────────────────────────────┐
  │                                                                                │
  │  ┌─── Instant (on admin write) ────────────────────────────────────────────┐ │
  │  │  Admin ──► revalidatePublic() ──► HTTP POST to site/api/revalidate      │ │
  │  │  ├── revalidatePath() for all public paths                              │ │
  │  │  └── revalidateTag() for all cache tags                                 │ │
  │  │  Timeout: 5s (best-effort, failure logged but not blocking)             │ │
  │  └──────────────────────────────────────────────────────────────────────────┘ │
  │                                                                                │
  │  ┌─── Automatic (heartbeat) ───────────────────────────────────────────────┐ │
  │  │  Every page load (debounced 60s):                                        │ │
  │  │  ├── Auto-publish scheduled posts (scheduledAt <= now)                  │ │
  │  │  └── Ping Supabase (keep alive)                                         │ │
  │  └──────────────────────────────────────────────────────────────────────────┘ │
  │                                                                                │
  │  ┌─── Fallback (ISR) ─────────────────────────────────────────────────────┐  │
  │  │  If revalidation misses: ISR serves stale for up to 7 days            │  │
  │  │  Next visit triggers background revalidation                           │  │
  │  └────────────────────────────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Heartbeat & Keep-Alive System

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │              HEARTBEAT & SUPABASE KEEP-ALIVE SYSTEM                              │
 └──────────────────────────────────────────────────────────────────────────────────┘

  PROBLEM:
  ┌────────────────────────────────────────────────────────────────────────────────┐
  │  Supabase free-tier PostgreSQL pauses after ~7 days of no connections.        │
  │  Scheduled posts need auto-publishing. No Vercel cron on hobby tier.          │
  └────────────────────────────────────────────────────────────────────────────────┘

  SOLUTION: Self-contained heartbeat (zero external dependencies)

  ┌─── Site Heartbeat (apps/site/src/lib/heartbeat.ts) ──────────────────────────┐
  │                                                                                │
  │  Triggered by: root layout.tsx (every page load)                              │
  │                                                                                │
  │  ┌──────────────────────────────────────────────────────────────────────────┐ │
  │  │  Request arrives ──► heartbeat() called                                 │ │
  │  │                      │                                                  │ │
  │  │              ┌───────┴───────┐                                          │ │
  │  │              │ Debounce check │                                          │ │
  │  │              │ < 60s since    │                                          │ │
  │  │              │ last run?      │                                          │ │
  │  │              └───────┬───────┘                                          │ │
  │  │                      │                                                  │ │
  │  │              ┌───────┴───────┐                                          │ │
  │  │              │ YES │         │ NO                                       │ │
  │  │              │     ▼         ▼                                          │ │
  │  │              │  return    Promise lock check                            │ │
  │  │              │  cached    │                                              │ │
  │  │              │  result    ├── Inflight? ──► piggyback on existing       │ │
  │  │              │            │                                              │ │
  │  │              │            └── Not inflight? ──► Run query               │ │
  │  │              │                                                          │ │
  │  │              └──────────────────────────────────────────────────────┐   │ │
  │  │                                                                    │   │ │
  │  │  ┌──────────────────────────────────────────────────────────────┐  │   │ │
  │  │  │  SINGLE DB QUERY (prisma.post.updateMany)                   │  │   │ │
  │  │  │                                                              │  │   │ │
  │  │  │  WHERE: published = false                                    │  │   │ │
  │  │  │    AND scheduledAt IS NOT NULL                               │  │   │ │
  │  │  │    AND scheduledAt <= NOW()                                  │  │   │ │
  │  │  │    AND deletedAt IS NULL                                     │  │   │ │
  │  │  │                                                              │  │   │ │
  │  │  │  SET: published = true, publishedAt = NOW(),                │  │   │ │
  │  │  │       scheduledAt = null                                     │  │   │ │
  │  │  │                                                              │  │   │ │
  │  │  │  IF DB DOWN: catch error → return { alive: false }          │  │   │ │
  │  │  │  IF QUERY OK:  return { published: count, alive: true }    │  │   │ │
  │  │  └──────────────────────────────────────────────────────────────┘  │   │ │
  │  │                                                                    │   │ │
  │  │  EFFECT: If Supabase is alive → query succeeds → DB pinged       │   │ │
  │  │          If Supabase is paused → query fails → caught gracefully  │   │ │
  │  └──────────────────────────────────────────────────────────────────┘ │   │
  └────────────────────────────────────────────────────────────────────────────────┘

  ┌─── Admin Heartbeat (apps/admin/src/lib/heartbeat.ts) ────────────────────────┐
  │                                                                                │
  │  Triggered by: admin root layout.tsx (every admin page load)                  │
  │                                                                                │
  │  Simpler: just pings Supabase via SELECT 1                                   │
  │  Same 60s debounce, same promise lock                                         │
  │  Purpose: keep Supabase alive from admin domain too                           │
  └────────────────────────────────────────────────────────────────────────────────┘

  ┌─── GitHub Actions Keep-Alive (backup) ───────────────────────────────────────┐
  │                                                                                │
  │  supabase-keepalive.yml: every 2 days                                         │
  │  ├── curl site/api/cron/keepalive (CRON_SECRET)                              │
  │  ├── curl admin/api/cron/keepalive (CRON_SECRET)                             │
  │  └── Purpose: backup in case no human visits for > 60s window                │
  └────────────────────────────────────────────────────────────────────────────────┘

  ┌─── Coverage Matrix ──────────────────────────────────────────────────────────┐
  │                                                                                │
  │  ┌──────────────────────┬────────────┬─────────────┬───────────────────────┐  │
  │  │ Scenario             │ Site HB    │ Admin HB    │ GitHub Actions        │  │
  │  ├──────────────────────┼────────────┼─────────────┼───────────────────────┤  │
  │  │ User visits site     │ ✓ fires    │             │                       │  │
  │  │ Admin uses admin     │            │ ✓ fires     │                       │  │
  │  │ Nobody visits (1hr)  │            │             │ ✓ fires (every 2d)   │  │
  │  │ Nobody visits (2d)   │            │             │ ✓ fires              │  │
  │  │ Nobody visits (3d)   │            │             │ ✓ fires              │  │
  │  │ Supabase paused      │ × fails    │ × fails     │ ✓ wakes it up        │  │
  │  └──────────────────────┴────────────┴─────────────┴───────────────────────┘  │
  │                                                                                │
  │  WORST CASE: Supabase pauses → next page visit heartbeat fails gracefully    │
  │  → GitHub Actions wakes it within 2 days → site recovers automatically       │
 └────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Deployment Architecture

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                         DEPLOYMENT ARCHITECTURE                                  │
 └──────────────────────────────────────────────────────────────────────────────────┘

                        ┌───────────────────────────┐
                        │         GITHUB            │
                        │                           │
                        │  ┌─────────────────────┐  │
                        │  │  Repository          │  │
                        │  │  sagarlad-demo       │  │
                        │  │  (monorepo)          │  │
                        │  └──────────┬──────────┘  │
                        │             │              │
                        │  ┌──────────▼──────────┐  │
                        │  │  GitHub Actions      │  │
                        │  │  ┌────────────────┐  │  │
                        │  │  │ newsletter-    │  │  │
                        │  │  │   cron (30min) │  │  │
                        │  │  ├────────────────┤  │  │
                        │  │  │ newsletter-    │  │  │
                        │  │  │   drain (daily)│  │  │
                        │  │  ├────────────────┤  │  │
                        │  │  │ supabase-      │  │  │
                        │  │  │   keepalive(2d)│  │  │
                        │  │  └────────────────┘  │  │
                        │  └──────────┬──────────┘  │
                        │             │              │
                        └─────────────┼──────────────┘
                                      │
                    ┌─────────────────┼──────────────────┐
                    │                 │                   │
                    │  HTTP           │  HTTP + CRON      │  HTTP
                    │  (push to       │  (scheduled)      │  (API calls)
                    │   main)         │                   │
                    ▼                 ▼                   ▼
 ┌─────────────────────────┐  ┌───────────────────┐  ┌──────────────────────────┐
 │   VERCEL: SITE APP      │  │   VERCEL: ADMIN   │  │   SUPABASE               │
 │                         │  │   APP             │  │                          │
 │   sagarlad-platform-    │  │                   │  │   PostgreSQL             │
 │   site.vercel.app       │  │   sagarlad-       │  │   ┌──────────────────┐  │
 │                         │  │   platform-admin  │  │   │ Connection Pool  │  │
 │   ┌───────────────────┐ │  │   .vercel.app     │  │   │ (pg.Pool, max=5) │  │
 │   │ Next.js 16.3      │ │  │                   │  │   └────────┬─────────┘  │
 │   │ (App Router)      │ │  │   ┌──────────────┐│  │            │            │
 │   │                   │ │  │   │ Next.js 16.3 ││  │   ┌────────▼─────────┐  │
 │   │ ┌───────────────┐ │ │  │   │ (App Router) ││  │   │ Prisma Client    │  │
 │   │ │ Public Pages  │ │ │  │   │              ││  │   │ (singleton via    │  │
 │   │ │ (ISR 7d)      │ │ │  │   │ ┌──────────┐ ││  │   │  global Proxy)   │  │
 │   │ └───────────────┘ │ │  │   │ │ Auth     │ ││  │   └──────────────────┘  │
 │   │ ┌───────────────┐ │ │  │   │ │ (JWT +   │ ││  │                          │
 │   │ │ Public APIs   │ │ │  │   │ │  2FA)    │ ││  │   Storage Buckets:      │
 │   │ └───────────────┘ │ │  │   │ └──────────┘ ││  │   ┌──────────────────┐  │
 │   │ ┌───────────────┐ │ │  │   │ ┌──────────┐ ││  │   │ sagarlad-assets  │  │
 │   │ │ Revalidate    │ │ │  │   │ │ CRUD     │ ││  │   │ (public, 8MB)   │  │
 │   │ │ Endpoint      │ │ │  │   │ │ APIs     │ ││  │   ├──────────────────┤  │
 │   │ └───────────────┘ │ │  │   │ └──────────┘ ││  │   │ sagarlad-ebooks  │  │
 │   └───────────────────┘ │  │   └──────────────┘│  │   │ (private, 25MB) │  │
 │                         │  │                   │  │   └──────────────────┘  │
 │   Hobby Tier (Free)     │  │   Hobby Tier (Free)│  │                          │
 │   100GB bandwidth       │  │   100GB bandwidth  │  │   Free Tier              │
 │   Serverless functions  │  │   Serverless funcs  │  │   ~500MB database        │
 │   No cron support       │  │   No cron support   │  │   1GB storage            │
 └─────────────┬───────────┘  └─────────┬─────────┘  └────────────┬─────────────┘
               │                        │                          │
               │    ┌───────────────────┘                          │
               │    │                                              │
               │    │    ┌─────────────────────────────────────────┘
               │    │    │
               │    │    │   reads/writes
               │    │    │
               │    │    ▼
               │    │  ┌─────────────────────────────────────────────────────┐
               │    │  │              EXTERNAL SERVICES                      │
               │    │  │                                                     │
               │    │  │  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
               │    │  │  │ Brevo       │  │ Google       │  │ YouTube   │ │
               │    │  │  │ SMTP API    │  │ Analytics    │  │ Instagram │ │
               │    │  │  │ (300/day)   │  │ Data API     │  │ Vimeo     │ │
               │    │  │  │             │  │ (dashboard)  │  │ Topmate   │ │
               │    │  │  └─────────────┘  └──────────────┘  └───────────┘ │
               │    │  └─────────────────────────────────────────────────────┘
               │    │
               │    │  ┌─────────────────────────────────────────────────────┐
               │    └─►│              USERS (Public)                         │
               │       │                                                     │
               │       │  ┌───────────────────────────────────────────────┐  │
               │       │  │  Browser ──► sagarlad.com                     │  │
               │       │  │                                               │  │
               │       │  │  ├── Serves ISR-cached pages (7d)            │  │
               │       │  │  ├── GA4 tracks pageviews                    │  │
               │       │  │  ├── Newsletter popup captures emails        │  │
               │       │  │  ├── Comments require moderation             │  │
               │       │  │  ├── Ebook downloads require email           │  │
               │       │  │  └── RSS feed for feed readers               │  │
               │       │  └───────────────────────────────────────────────┘  │
               │       │                                                     │
               │       │  ┌───────────────────────────────────────────────┐  │
               │       └─►│  Browser ──► admin.sagarlad.com               │  │
               │          │                                               │  │
               │          │  ├── Login with email + password + 2FA        │  │
               │          │  ├── Manage all content                       │  │
               │          │  ├── Send newsletters                         │  │
               │          │  ├── View analytics                           │  │
               │          │  └── Moderate comments/subscribers            │  │
               │          └───────────────────────────────────────────────┘  │
               │                                                            │
               └────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ KEY ENVIRONMENT VARIABLES                                                       │
 │                                                                                  │
 │  SITE:                          ADMIN (additional):                              │
 │  ├── DATABASE_URL               ├── ADMIN_EMAIL                                 │
 │  ├── DIRECT_URL                 ├── ADMIN_PASSWORD                              │
 │  ├── DATABASE_POOL_MAX=5        ├── SITE_URL=https://sagarlad.com               │
 │  ├── AUTH_SECRET                ├── GA_PROPERTY_ID                              │
 │  ├── AUTH_URL                   ├── GOOGLE_SERVICE_ACCOUNT_JSON                 │
 │  ├── SUPABASE_URL               ├── ADMIN_PHASE=2                               │
 │  ├── SUPABASE_ANON_KEY          └── NEWSLETTER_CRON (optional)                  │
 │  ├── SUPABASE_SERVICE_ROLE_KEY                                                  │
 │  ├── NEXT_PUBLIC_GA_MEASUREMENT_ID  SHARED:                                     │
 │  ├── BREVO_API_KEY              ├── CRON_SECRET                                  │
 │  ├── BREVO_FROM_EMAIL           └── (same DATABASE_URL, AUTH_SECRET)            │
 │  ├── BREVO_FROM_NAME                                                          │
 │  ├── BREVO_FROM_NAME                                                          │
 │  └── CRON_SECRET                                                              │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

> **File count:** 137+ files across site (20 pages, 13 API routes, 22 lib, ~30 components),
> admin (12 pages, 25 API routes, 27 lib, ~40 components), and shared packages.
>
> **Stack:** Next.js 16 + React 19 + Tailwind v4 + Prisma + PostgreSQL (Supabase) +
> Brevo + GA4 + Vercel Hobby + GitHub Actions.

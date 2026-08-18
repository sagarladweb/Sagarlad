# Design & Branding Reference — sagarlad.com

Single source of truth for design decisions on this site. **Read this before
touching any UI.** If a design choice isn't here, match the nearest existing
pattern instead of inventing a new one.

## Brand Identity

- **Positioning**: Public Speaker · Author · Content Creator. Human, direct,
  "your friend Sagar" — no guru vibes.
- **Voice**: plain, practical, one idea at a time. Contractions are fine.
- **Logos**: `public/logos/site-logo-white.png` (on dark / dark imagery),
  `public/logos/site-logo.png` (on light). Inverted via opacity crossfade in the
  `SagarLogo` component in `Navbar`.

## Brand Colours (light-mode defaults)

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent` | `#ffd51d` (yellow) | Primary CTAs, highlights, active states, selection, focus rings. Action/attention colour. |
| `--accent-foreground` | `#000000` | Text/icons on yellow. |
| `--accent-strong` | `#0d21a1` (deep blue) | Links, emphasis, section headings, eyebrows, active nav accents. |
| `--brand` | `#0d21a1` (deep blue) | Primary brand — headings/emphasis, solid brand buttons, footer background. |
| `--brand-light` | `#3f88c5` (light blue) | Secondary buttons, metadata, supporting info, subtle hovers, icons. |
| `--background` | `#ffffff` | Page background. |
| `--card` | `#ffffff` | Card surfaces. |
| `--muted` | `#f4f4f2` | Soft section bands, hover fills, chip backgrounds. |
| `--muted-foreground` | `#6b6a63` | Secondary text, captions, descriptions. |
| `--border` | `#e5e4e0` | Hairlines, card borders. |

**Dark mode**: `--background: #0e0e10`, `--foreground: #f5f4f0`,
`--accent: #ffd51d` (same yellow, the only constant accent),
`--brand: #3f88c5`, `--accent-strong: #3f88c5` (deep blue swaps to light
blue because it is unreadable on dark), `--brand-light: #7fa8d9`.

**Admin panel** (`.admin-panel` class): swaps the accent to deep blue —
`--accent: #0d21a1`, `--accent-foreground: #ffffff`. Admin UI never uses
yellow. Applied on the admin layout root and the login page root.

## Colour Rules to Not Break

1. **Yellow = action only.** Use it sparingly: one primary CTA per view,
   active nav pill, selection, focus rings, dot indicators, timeline active
   dots. Never paint an entire section solid yellow.
2. **One CTA colour site-wide**: every primary CTA pill is yellow
   (`bg-accent text-accent-foreground`). No `bg-brand` CTA buttons — brand
   blue never appears as a button fill.
3. **Don't overuse blue.** A busy section stays mostly neutral (`background`,
   `card`, `muted`) with blue and yellow as accents. Reserve solid `bg-brand`
   for small elements (icon tiles, the footer, the active nav pill).
4. **Section rhythm on the speaking page** (the reference for balancing dark):
   dark photo hero with neutral black scrims → light `card`/`muted` sections in
   between, alternating with the hero. No wide solid-black bands.
5. **Readability**: yellow text only on dark/deep backgrounds; deep-blue text
   only on light backgrounds. Body text stays `foreground`/`muted-foreground`.
6. **Gradients are light blue only.** Every brand-colour gradient on the site —
   card fills, portrait glows, avatar tints, newsletter popup bar, video
   placeholders, book thumbnail placeholders, reading progress — uses
   `brand-light` (light blue) stops. No yellow/amber/navy colour gradients.
   Neutral black scrims over imagery (photo legibility) are excluded and stay
   black; they are overlays, not brand gradients.
   **One exception:** the newsletter popup's shining header bar sweeps a
   light-yellow sheen (`#ffe784`, a lighter shade of the brand accent)
   alongside the light-blue shimmer, per explicit client request.

## Typography

- **Sans (body)**: Be Vietnam Pro (`--font-sans`).
- **Display (headings)**: Rethink Sans (`--font-display`), also used as serif.
- **Signature**: Great Vibes (`--font-signature`) for accent words.
- Headings use `font-display`, tight tracking (`-0.02em`), bold.
- Body copy: `text-sm`–`text-base`, `leading-relaxed`. Secondary text uses
  `text-muted-foreground`.

## Spacing, Radii & UI Conventions

- **Radii** (standardised across the site):
  - Small tiles / chips / rows ≤ 48px → `rounded-xl` (12px).
  - Standard cards → `rounded-2xl` (16px).
  - Large surfaces (videos, cover images, modals, iframes, carousels) →
    `rounded-3xl` (24px).
  - Oversized portrait images → `rounded-[2.5rem]` / `rounded-[3rem]`.
- **Buttons**: pill-shaped (`rounded-full`). Primary = `bg-accent text-accent-foreground`
  (yellow); secondary/emphasis = `bg-brand text-white`; ghost = `hover:bg-muted`.
  Consistent `transition`, `disabled:opacity-60`.
- **Inputs**: `rounded-2xl` (or `rounded-full` in the newsletter band),
  `border-border`, `focus:ring-2 focus:ring-accent`.
- **Section padding**: `py-20 md:py-24` (large), `py-14 md:py-16` (compact),
  standard container `max-w-7xl mx-auto px-4 sm:px-6`.
- **Hover lift**: cards only via `hover:shadow-sm`–`2xl` (CSS normalises all to
  one soft shadow); rows/flyouts use `hover:bg-muted/80`.
- **Focus**: `:focus-visible` outline = `2px solid var(--accent)` globally.
- **Selection**: yellow background, black text.
- **Scrollbars**: decorative scroll areas use `.no-scrollbar`.
- **Motion**: GSAP scroll animations via `ScrollAnimations` on the home page;
  `prefers-reduced-motion` respected. Chips animate via `data-animate`.

## Header & Navigation

- Sticky header, `h-16`. Transparent over full-bleed dark heroes (`/`,
  `/speaking`) when not scrolled and menu closed (`heroLight`); gets
  `bg-gradient-to-b from-black/60 via-black/25 to-transparent` for legibility.
  On scroll/menu-open: `bg-background/90 backdrop-blur-md border-b`.
- Active nav item = `bg-brand text-white` pill. Hover = `hover:bg-muted/80`
  (light) or `hover:bg-white/15` (heroLight).
- Flyouts (Content/Books/About) = minimal: `rounded-xl border-border bg-background/95
  backdrop-blur-md shadow-lg`, plain icon rows (`w-4 h-4`, no tile boxes),
  `hover:bg-muted/80`. Books sub-flyout keeps cover thumbnails.
- Header social icons: Instagram + LinkedIn only (`HEADER_SOCIALS`).
- Mobile menu: full-screen overlay, expandable accordion groups.

## Footer

- `bg-foreground text-background` (inverted dark). Site logo light variant.
- Tagline mirrors header identity: "Public Speaker, Author & Content Creator."
- Socials: Instagram / YouTube / LinkedIn (round icon buttons).
- Columns: Explore, Books, More. More includes Privacy & Terms. Bottom bar:
  copyright + "MindUp.RiseWithin." ✦

## Home Page Sections (order)

1. `Hero` — full-bleed `hero-home.webp`, scrims, content left, eyebrow
   "Public Speaker · Author · Content Creator", GSAP entrance.
2. `FeaturedOn` — press marquee band.
3. `AboutMe` — portrait card (`/images/sagar-author.png`) + story; designation
   "Public Speaker · Author · Content Creator".
4. `MindUp` — M-I-N-D-U-P pillar cards (letters in fixed order).
5. `BlogPreview` — latest posts + categories.
6. `Testimonials` — auto-scroll every 3s, pause on hover.
7. `NewsletterCta` — one rounded-3xl bento card (max-w-2xl) on a plain
   `background` section, **light-blue gradient** card fill
   (`bg-gradient-to-br from-brand-light/30 via-brand-light/15 to-brand-light/5`),
   vertical layout: portrait image on top, form content below. Submit pill is
   the site-wide yellow CTA.
8. `SagarGallery` — carousel, one photo at a time, swipe + arrows + dots,
   "It's your friend, Sagar." + "Know me better" → /about.

## About Page (/about)

Long biography — kept navigable by a sticky sub-nav (below the site header,
`sticky top-16 z-40`) with pill links that scrollspy (active = `bg-brand
text-white`). Sections carry `id` + `scroll-mt-32` for anchor offset. Order:

1. Visual hero (portrait, eyebrow, title).
2. Sticky in-page nav — The Belief / My Journey / Runner for Life / Connect.
3. Stats band.
4. **The Belief** — "People don't make poor choices…" philosophy.
5. Current Life Razor → Advice to 20-year-old self → Growing Up (`#journey`)
   → JourneyTimeline → Milestones → What I Love Doing → Runner for Life
   (`#running`) → Connect CTA (`#connect`).

## Newsletter Popup

- Appears 8s after each page load (no persistent dismissal — refresh shows it
  again). Close only hides the current instance.
- Two-zone card: shining header bar (light-blue base with alternating
  light-blue and light-yellow shimmer sweeps), Sagar Lad author block (portrait,
  name, "Public Speaker · Author · Content Creator" tagline), eyebrow chip,
  title, "what you'll get" checklist, form (name + email + terms), yellow
  submit pill.
- Full-screen mobile, bottom-left card on desktop
  (`sm:left-8 sm:bottom-6 w-[520px]`).

## Images & Media (public/)

- `public/images/heroes/hero.webp` (976×1310 portrait) — about page, newsletter page, gallery.
- `public/images/heroes/hero-home.webp` (1716×916 landscape) — home hero.
- `public/images/heroes/speaking.webp` (1536×1024 landscape) — speaking hero, gallery.
- `public/images/heroes/tedx.webp` (1672×941) — TEDx thumbnail.
- `public/images/sagar-author.png` — portrait used in AboutMe / NewsletterCta.
- Misc: `logos/` (site logos), `images/featured/` (press marks), `images/blog/`,
  `images/books/`, `images/press/`.

## Do/Don't Checklist (when analysing or building UI)

- [ ] Yellow used sparingly, action-only.
- [ ] No full-solid-yellow or full-solid-blue sections.
- [ ] Neutral section backgrounds with blue/yellow accents for busy sections.
- [ ] Radii follow the size-scale above.
- [ ] Buttons pill-shaped; one primary CTA per view.
- [ ] Body text never uses pure brand colours; `foreground`/`muted-foreground`.
- [ ] Dark-mode deep-blue replaced by light blue (never hardcode `#0d21a1`
      outside light-mode context).
- [ ] Flyouts minimal (no heavy shadows or icon tiles).
- [ ] Section spacing matches existing cadence.
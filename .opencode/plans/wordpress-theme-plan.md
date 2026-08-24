# WordPress Theme: sagarlad.com — Detailed Implementation Plan

## Overview

Build a production-ready WordPress custom theme that replicates the Next.js site (`apps/site`) pixel-perfectly, with a native WP admin panel replacing the Next.js admin (`apps/admin`). Zero plugin dependencies for core functionality.

**Theme Name:** `sagarlad`
**Target:** Standard WordPress hosting, WP Media Library, light mode only, GSAP animations, exact URL structure.

---

## Phase 1: Theme Foundation & Setup

### 1.1 Create Theme Directory Structure
```
wordpress-theme/sagarlad/
├── style.css                          # Theme metadata + all CSS
├── functions.php                      # Theme setup, CPTs, APIs, enqueues
├── header.php                         # Site frame: <head>, navbar
├── footer.php                         # Site frame: footer, scripts
├── index.php                          # Fallback template
├── front-page.php                     # Home page (11 sections)
├── single.php                         # Default single post
├── single-book.php                    # Single book
├── single-video.php                   # Single video
├── archive.php                        # Default archive
├── archive-post.php                   # Blog listing (Instagram-style)
├── archive-book.php                   # Books listing
├── archive-video.php                  # Videos listing
├── archive-quote.php                  # Quotes listing
├── page.php                           # Default page template
├── search.php                         # Search results
├── searchform.php                     # Custom search form
├── 404.php                            # Custom 404
├── attachment.php                     # Attachment pages
├── comments.php                       # Blog comments template
├── sidebar.php                        # Sidebar (if needed)
├── page-templates/
│   ├── template-about.php             # /about
│   ├── template-speaking.php          # /speaking
│   ├── template-speaking-contact.php  # /speaking/contact
│   ├── template-contact.php           # /contact
│   ├── template-mentorship.php        # /mentorship
│   ├── template-newsletter.php        # /newsletter
│   ├── template-privacy.php           # /privacy
│   └── template-terms.php             # /terms
├── template-parts/
│   ├── section-hero.php               # Home hero
│   ├── section-featured-on.php        # Press marquee
│   ├── section-about-me.php           # About preview
│   ├── section-topics-grid.php        # Topics grid
│   ├── section-mindup.php             # MindUp ring
│   ├── section-blog-preview.php       # Latest posts
│   ├── section-testimonials.php       # Testimonials carousel
│   ├── section-newsletter-cta.php     # Newsletter CTA
│   ├── section-sagar-gallery.php      # Photo carousel
│   ├── section-mentorship-cta.php     # Mentorship CTA
│   ├── section-book-carousel.php      # Book carousel
│   ├── section-book-stats.php         # Book stats
│   ├── nav-navbar.php                 # Desktop nav
│   ├── nav-mobile.php                 # Mobile drawer
│   ├── footer-columns.php             # Footer grid
│   ├── content-card.php               # Blog post card
│   ├── book-card.php                  # Book card
│   ├── video-card.php                 # Video card
│   ├── quote-card.php                 # Quote card
│   ├── category-card.php              # Topic category card
│   ├── comment-item.php               # Single comment
│   └── newsletter-form.php            # Newsletter subscription form
├── inc/
│   ├── custom-post-types.php          # CPT + taxonomy registrations
│   ├── custom-meta-boxes.php          # Meta box definitions
│   ├── custom-database-tables.php     # Newsletter/contact tables
│   ├── rest-api.php                   # Custom REST endpoints
│   ├── newsletter.php                 # Newsletter + Brevo integration
│   ├── analytics.php                  # Google Analytics helper
│   ├── security.php                   # CSRF, sanitization, rate limiting
│   ├── image-handling.php             # Image optimization, uploads
│   ├── seo.php                        # SEO meta, sitemaps, JSON-LD
│   ├── admin-settings.php             # Theme settings page in WP admin
│   ├── admin-columns.php              # Custom admin list columns
│   ├── admin-notices.php              # Admin notification system
│   └── helper-functions.php           # Utility functions
├── assets/
│   ├── css/
│   │   ├── main.css                   # Compiled main stylesheet
│   │   ├── components.css             # Component-specific styles
│   │   ├── animations.css             # GSAP + CSS animations
│   │   └── admin.css                  # Admin panel styles (meta boxes)
│   ├── js/
│   │   ├── main.js                    # Core: navbar, footer, scroll-top
│   │   ├── home.js                    # Home page: GSAP animations
│   │   ├── newsletter-popup.js        # Newsletter popup
│   │   ├── carousel.js                # Testimonial/book carousels
│   │   ├── mindup-ring.js             # Interactive MindUp SVG
│   │   ├── gallery.js                 # Photo gallery carousel
│   │   ├── comments.js                # AJAX comments
│   │   ├── newsletter-form.js         # Newsletter subscription
│   │   ├── contact-form.js            # Contact form AJAX
│   │   ├── video-player.js            # Video click-to-play
│   │   ├── image-protection.js        # Right-click/drag blocking
│   │   └── admin.js                   # Admin: meta box interactions
│   ├── fonts/                         # Self-hosted woff2 files
│   │   ├── BeVietnamPro-*.woff2
│   │   ├── RethinkSans-*.woff2
│   │   └── GreatVibes-Regular.woff2
│   └── images/                        # Theme static images
│       ├── logos/
│       │   ├── site-logo.png
│       │   └── site-logo-white.png
│       ├── heroes/
│       │   ├── hero-home.webp
│       │   ├── hero.webp
│       │   ├── speaking.webp
│       │   └── tedx.webp
│       ├── sagar-author.webp
│       ├── featured/                  # Press logos
│       └── blog/                      # Fallback covers
└── screenshot.png                     # Theme screenshot (1200x900)
```

### 1.2 Theme Metadata (`style.css`)
- Theme Name: Sagar Lad
- Version: 1.0.0
- Requires WP: 6.0+
- Text Domain: sagarlad

### 1.3 `functions.php` — Theme Setup
- `add_theme_support()`: title-tag, post-thumbnails, custom-logo, html5, responsive-embeds, editor-styles, align-wide
- `register_nav_menus()`: primary, footer, mobile
- Custom image sizes: hero (1920x1080), card (600x400), portrait (400x500)
- Enqueue self-hosted woff2 fonts with `@font-face`
- Enqueue styles (main.css, animations.css)
- Enqueue scripts (GSAP CDN, main.js, page-specific JS)
- Add Gutenberg editor styles matching front-end

---

## Phase 2: Custom Post Types & Taxonomies

### 2.1 Blog Posts (built-in `post`)
- Use default WP `post` post type
- Custom rewrite: `/blog/%postname%`
- Meta boxes: kicker, show_cover, show_author_box, footer_note, featured, views

### 2.2 Books (`book` CPT)
- Supports: title, editor, thumbnail, custom-fields
- Meta boxes: book_type (PUBLISHED/READ/EBOOK), tagline, learning, note, buy_url, file_key, free, featured, published, sort_order
- Archives: `/books`, `/books-read`, `/ebooks` (filtered by type)

### 2.3 Videos (`video` CPT)
- Supports: title, editor, thumbnail, custom-fields
- Meta boxes: embed_url, layout (video-first/text-first/split), published, sort_order, views

### 2.4 Quotes (`quote` CPT)
- Meta boxes: text (quote content), tag

### 2.5 Newsletter Campaigns (`newsletter_campaign` CPT)
- Admin-only (not publicly queryable)
- Meta boxes: content_json, status (draft/queued/sending/sent), sent_at

### 2.6 Newsletter Subscribers (`newsletter_subscriber` CPT)
- Admin-only
- Meta boxes: name, accepted_terms, unsubscribed, unsubscribe_token

### 2.7 Social Links
- WP Options API (not a CPT)
- Admin page: Settings > Social Links

---

## Phase 3: Custom Database Tables

### Tables to Create:
1. `{prefix}sagarlad_subscribers` — email, name, accepted_terms, unsubscribed, unsubscribe_token
2. `{prefix}sagarlad_campaigns` — subject, html, content_json, status, sent_at
3. `{prefix}sagarlad_deliveries` — campaign_id, subscriber_id, status, sent_at, error
4. `{prefix}sagarlad_contacts` — first_name, last_name, email, message, type
5. `{prefix}sagarlad_rate_limits` — key, count, reset_at
6. `{prefix}sagarlad_audit_log` — user_id, action, meta, ip

### Migration System:
- Auto-create on `after_switch_theme` hook
- Version check in `wp_options`: `sagarlad_db_version`

---

## Phase 4: Custom REST API Endpoints

### Public (no auth):
- `POST /wp-json/sagarlad/v1/subscribe` — Newsletter subscribe
- `POST /wp-json/sagarlad/v1/unsubscribe` — Unsubscribe
- `POST /wp-json/sagarlad/v1/contact` — Contact form
- `GET /wp-json/sagarlad/v1/books` — Published books
- `GET /wp-json/sagarlad/v1/videos` — Videos list
- `GET /wp-json/sagarlad/v1/socials` — Active social links
- `GET /wp-json/sagarlad/v1/categories` — Categories with counts
- `GET /wp-json/sagarlad/v1/quotes` — Published quotes
- `GET /wp-json/sagarlad/v1/comments` — Comments for post
- `POST /wp-json/sagarlad/v1/comments` — Submit comment

### Admin (auth + nonce):
- `POST /wp-json/sagarlad/v1/admin/newsletter/send` — Enqueue campaign
- `POST /wp-json/sagarlad/v1/admin/newsletter/draft` — Save draft
- `POST /wp-json/sagarlad/v1/admin/newsletter/test` — Test email
- `POST /wp-json/sagarlad/v1/admin/newsletter/process` — Process batch
- `GET /wp-json/sagarlad/v1/admin/newsletter/status/:id` — Campaign status
- `DELETE /wp-json/sagarlad/v1/admin/subscribers/:id` — Remove subscriber
- `GET /wp-json/sagarlad/v1/admin/analytics` — GA4 proxy
- `GET /wp-json/sagarlad/v1/admin/health` — Health check

---

## Phase 5: Front-End — Home Page (11 Sections)

All in `front-page.php` calling template parts in order:

1. **Hero** — Full-bleed hero-home.webp, dark scrims, GSAP staggered entrance, 2 CTAs
2. **FeaturedOn** — Press logos marquee (CSS animation mobile, static desktop)
3. **AboutMe** — 12-col grid, portrait + bio + 4 stats with count-up
4. **TopicsGrid** — "What I Write About", up to 10 topic cards, mobile scroll / desktop grid
5. **MindUp** — Interactive SVG ring (M-I-N-D-U-P), hover reveals pillar info
6. **BookCarousel + BookStats** — Auto-advancing carousel + 3-stat bar
7. **BlogPreview** — Latest 4 posts in grid + "View More" CTA
8. **Testimonials** — Auto-scrolling carousel, 4 cards, pause on hover
9. **MentorshipCta** — "One conversation. Total clarity." + CTA
10. **NewsletterCta** — Rounded bento card, light-blue gradient, form + portrait
11. **SagarGallery** — Photo carousel, 6 photos, swipe + arrows + dots

---

## Phase 6: All Other Pages (14 pages)

| Template | Route | Key Sections |
|----------|-------|-------------|
| `template-about.php` | /about | Portrait hero, sticky scrollspy nav, stats, philosophy, journey timeline, runner, connect CTA |
| `archive-post.php` | /blog | Instagram-style profile header, tabs (posts/videos), category pills, 3-col grid |
| `single.php` | /blog/[slug] | Reading progress, article, share buttons, comments, related posts |
| `archive-book.php` | /books | Editorial hero, BookLibrary grid, detail modal |
| template for /books-read | /books-read | PageHeader + READ variant grid |
| template for /ebooks | /ebooks | PageHeader + EBOOK variant + gated download |
| `archive-video.php` | /videos | Masonry grid, load more, subscribe CTA |
| `single-video.php` | /videos/[slug] | Video embed + optional article |
| `template-speaking.php` | /speaking | Stage hero, TEDx, bento gallery, credentials, testimonials |
| `template-speaking-contact.php` | /speaking/contact | Speaking contact form |
| `template-contact.php` | /contact | Portrait + form + sidebar |
| `template-mentorship.php` | /mentorship | Hero, stats, how-it-works, testimonials, Topmate embed, FAQ |
| `template-newsletter.php` | /newsletter | PageHeader + card with form |
| `archive-quote.php` | /quotes | 2-column quote card grid |
| `404.php` | 404 | "You're off the map." + search |

---

## Phase 7: Header, Footer & Navigation

### Navbar (sticky, transparent-to-solid):
- Desktop: Logo | Blogs flyout | Books flyout | About flyout | Contact | Mentorship | Social icons
- Mobile: Full-screen overlay with accordion sections
- Transparent mode on `/` and `/speaking` before scroll
- Active pill: `bg-brand text-white`

### Footer (dark inverted):
- 4-column: Logo+tagline | Explore | Books | More
- Social icons: Instagram, YouTube, LinkedIn
- Bottom: copyright + "MindUp.RiseWithin." ✦

---

## Phase 8: CSS (Light Mode Only)

- Design tokens as CSS custom properties
- Self-hosted fonts with `font-display: swap`
- All Tailwind classes translated to vanilla CSS
- Animations: marquee, book-slide, shine, pillar-swap, hero-drift, fade-in
- TipTap content styles (`.tip-content`)
- Responsive: mobile-first, breakpoints at 640/768/1024/1280px
- Image protection CSS
- Reduced motion support

---

## Phase 9: JavaScript (11 scripts)

- `main.js` — Navbar, scroll-to-top, mobile menu
- `home.js` — GSAP + ScrollTrigger animations
- `newsletter-popup.js` — 8s delay popup
- `carousel.js` — Testimonial/book/gallery carousels
- `mindup-ring.js` — Interactive SVG ring
- `gallery.js` — Photo gallery
- `comments.js` — AJAX comments
- `newsletter-form.js` — Subscription form
- `contact-form.js` — Contact form
- `video-player.js` — Click-to-play
- `image-protection.js` — Right-click/drag block
- `admin.js` — Meta box interactions

---

## Phase 10: Admin Panel

### Theme Settings Page:
- General: tagline, hero text, designation
- Social Links: repeater fields
- Newsletter: Brevo API key, from email, daily limit
- Analytics: GA Measurement ID, Property ID
- Footer: copyright text

### Custom Admin Pages:
- Contact Requests list (`/wp-admin/tools.php?page=sagarlad-contacts`)
- Newsletter Dashboard (`/wp-admin/tools.php?page=sagarlad-newsletter`)
- System Health (`/wp-admin/tools.php?page=sagarlad-health`)

### Custom Admin Columns:
- Posts: Kicker, Featured, Published, Views
- Books: Type, Featured, Published, Sort Order
- Videos: Layout, Published, Sort Order

---

## Phase 11: Newsletter System

### Subscribe → Compose → Send → Track

1. **Subscribe:** Front-end form → validate → insert subscriber table
2. **Compose:** Admin creates campaign with HTML editor + content inserts
3. **Send:** Manual trigger → snapshot subscribers → batch process (20 per batch) via Brevo API
4. **Track:** Per-delivery status, progress dashboard, campaign reports

### Brevo Integration:
- API: `https://api.brevo.com/v3/smtp/email`
- Auth: `api-key` header
- Batch size: 20 per invocation
- Email templates: Letter, Editorial, Minimal (email-safe HTML)

---

## Phase 12: Integrations

### Google Analytics:
- gtag.js loaded in header (conditionally)
- IP anonymization
- Front-end only

### SEO:
- Auto `<title>` tags
- Meta descriptions
- OpenGraph + Twitter Card tags
- Canonical URLs
- JSON-LD (Person, Article, Book, VideoObject)
- Dynamic sitemap.xml

### Security:
- Nonce verification on all forms
- Input sanitization + output escaping
- Rate limiting via custom table
- CSP headers
- Disable XML-RPC, hide WP version

---

## Phase 13: Performance

- WP Object Cache for queries
- Critical CSS inlined
- GSAP from CDN
- Non-critical JS deferred
- Font preloading
- Image lazy loading
- Proper srcset/sizes
- Browser caching headers

---

## Phase 14: Content Migration

### WP-CLI Import Script:
- Import posts, books, videos, quotes, socials, categories, subscribers
- Upload images to WP Media Library
- Map old slugs, set up 301 redirects

---

## Phase 15: Testing & QA

- Visual comparison: every page, every breakpoint
- Functionality: newsletter, forms, comments, search, pagination
- Performance: PageSpeed 90+ mobile, 95+ desktop
- SEO: meta tags, sitemap, JSON-LD, OpenGraph
- Security: CSRF, XSS, SQL injection, rate limiting

---

## Execution Order

| Step | Phase | Files | Notes |
|------|-------|-------|-------|
| 1 | Theme Foundation | ~5 | style.css, functions.php, header.php, footer.php, index.php |
| 2 | Custom Post Types | ~3 | CPTs, meta boxes, admin columns |
| 3 | Database Tables | ~2 | Table creation + helper functions |
| 4 | REST API | ~2 | Public + admin endpoints + newsletter |
| 5 | CSS Styles | ~4 | main.css, components.css, animations.css, admin.css |
| 6 | Core JS | ~3 | main.js, carousel.js, image-protection.js |
| 7 | Home Page | ~12 | front-page.php + 11 section parts |
| 8 | Header/Footer/Nav | ~4 | Navbar, mobile menu, footer |
| 9 | Blog Templates | ~4 | Archive, single, card, comments |
| 10 | Books/Ebooks | ~3 | Archive, card, ebook modal |
| 11 | Videos | ~3 | Archive, single, card |
| 12 | Speaking | ~2 | Template + contact |
| 13 | Other Pages | ~8 | About, Contact, Mentorship, Newsletter, Quotes, Socials, Privacy, Terms |
| 14 | Page JS | ~7 | Newsletter popup, forms, MindUp, gallery, comments, video, admin |
| 15 | Admin Pages | ~3 | Newsletter dashboard, Contacts, Health |
| 16 | SEO/Analytics | ~2 | seo.php, analytics.php |
| 17 | Security | ~1 | security.php |
| 18 | Migration Script | ~1 | WP-CLI import |
| 19 | Testing | ~0 | Manual QA |

**Total: ~75+ files**

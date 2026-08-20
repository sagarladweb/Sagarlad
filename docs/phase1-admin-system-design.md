# Phase 1 Admin Panel — System Design

Single source of truth for how the Phase 1 admin panel works end to end: login,
post CRUD, and how it stays connected to the public site and the database with
speed and reliability on the Vercel free tier. Read this before changing
anything in `apps/admin` or the public data path. Phase 1 scope: **login +
posts CRUD + settings**. Phase 2 (dashboard, newsletter, social, community) is
gated behind `ADMIN_PHASE` and follows the same patterns.

## Architecture at a glance

```
Browser ──► apps/admin (Next.js, port 3001)
              │  NextAuth credentials → JWT cookie
              │  requireAdmin() guard on every API route + (panel) layout
              │
              ├─► apps/admin/api/admin/posts  (GET/POST/PUT/DELETE)
              │     zod validate → sanitizeHtml → Prisma write
              │     └── revalidatePublic() ──► site /api/revalidate (CRON_SECRET)
              │
apps/site (Next.js, port 3000) ◄── read path only
              │  ISR revalidate=604800 + generateStaticParams (blog pages)
              │  unstable_cache tagged helpers (categories/videos/books/quotes)
              │  revalidatePath + revalidateTag on admin write → instant refresh
              ▼
        Supabase (pooler :6543, Prisma via pg adapter, pool max 5)
```

Two Next.js apps, one database. The **admin writes**, the **site reads**.
Cross-app refresh is the only coupling: admin calls the site's
`/api/revalidate` endpoint with the shared `CRON_SECRET` after every write.

## 1. Login & authorization (see docs/login-system-design.md)

Not repeated here — same auth system. In short: NextAuth v5 credentials,
JWT session (7 days), `requireAdmin()` on every route, env bootstrap only when
zero admins exist, DB-backed lockout (fail-open on DB hiccup).

## 2. Post CRUD — the full write path

### 2.1 Create (POST `/api/admin/posts`)

```
body ──► adminPostSchema (zod): title, slug, excerpt, content, coverImage,
        categoryId, featured, published, publishedAt, kicker, showCover,
        showAuthorBox, footerNote
  ├─ invalid ──► 400 { error: firstIssue }
  ├─ slug already exists ──► 409
  ├─ P2002 race (concurrent create) ──► 409
  ├─ DB down ──► 503 { error: "Database unavailable" }
  ▼
sanitizeHtml(content)   ← DOMPurify, FORBID_TAGS incl. iframe/script (single point)
prisma.post.create      ← soft-delete model, hard-create (publishedAt defaults now)
revalidatePublic()      ← awaited, best-effort, never fails the write
201 { post }
```

### 2.2 Update (PUT `/api/admin/posts?id=`) & Delete

- PUT mirrors POST, plus `NOT: { id }` on the slug check and
  `publishedAt: undefined` when not supplied (keeps existing date).
- DELETE is a **soft delete**: sets `deletedAt = now()` instead of destroying
  the row. The public site filters `deletedAt: null`, so the post vanishes
  from the site but the row (and its comments/audit trail) survive. A hard
  `prisma.post.delete` would orphan Comment/audit rows and break the
  `deletedAt: null` filter in the admin list.
- P2025 (row gone between check and delete) → 404.

### 2.3 Sanitization — single trust boundary

- `sanitizeHtml()` (`apps/admin/src/lib/sanitize.ts`) runs **once, at write
  time**, on the server. Content stored in the DB is already clean HTML.
- The site's `SanitizedContent` re-sanitizes on render as **defense in
  depth** only — it must never be treated as the primary boundary.
- Embeds are `<a>` cards (`ContentEmbed`), not raw iframes, so
  `FORBID_TAGS: ["iframe"]` is safe and doesn't break embeds.

### 2.4 Editor robustness (`PostForm.tsx` / `TipTapEditor.tsx`)

- **Autosave** every change with a debounce → PUT; new posts are POSTed once
  (an `id` from the server pins subsequent saves to PUT).
- **Offline queue**: when `navigator.onLine === false`, saves enqueue locally
  (`localStorage`) and replay on reconnect via the `OfflineSync` banner. The
  API revalidates the site on replay, so nothing is lost.
- **Slug** is auto-synced from the title until manually edited.
- Submit shows a success toast, `router.refresh()`es the list, and navigates
  back after 1.2s.

## 3. Caching strategy

| Layer                | Where                              | TTL / scope                          | Invalidated by                                   |
|----------------------|------------------------------------|--------------------------------------|--------------------------------------------------|
| PrismaClient + pool  | `globalThis` (all envs, both apps) | per serverless instance              | never (persistent)                               |
| Blog post pages      | `apps/site` ISR                    | 604800s, per path                    | `revalidatePath` via `/api/revalidate`           |
| `getPostBySlug`      | React `cache`                      | per request (dedupe metadata+render) | never (per-request)                              |
| Categories/Videos/Books/Quotes | `unstable_cache` tagged | 604800s              | `revalidateTag` via `/api/revalidate`            |
| Admin pages          | `force-dynamic` / direct Prisma    | none (admin is single-user)          | n/a                                               |

Rules:
- **Never cache admin reads.** Admin is one user; a cache has no traffic to
  amortize and adds staleness. `force-dynamic` + direct Prisma everywhere.
- **Site post rows are not `unstable_cache`'d** — they carry `Date` fields
  that `unstable_cache` stringifies, and ISR already covers them. React
  `cache` dedupes the per-request double fetch.
- **Stable hub data is `unstable_cache`'d** (categories, videos, books,
  quotes) with weekly TTL + on-demand `revalidateTag`. This is what makes the
  site refresh within seconds of an admin write.

## 4. Revalidation — the admin→site link (CRITICAL)

Two separate Next.js processes ⇒ `revalidatePath`/`revalidateTag` inside the
admin process can never touch the site's cache. The bridge is the site's
`POST /api/revalidate` route, guarded by `CRON_SECRET`:

```
admin write ──► revalidatePublic() ──► POST {SITE_URL}/api/revalidate
                                         header/body secret === CRON_SECRET
                                           ├─ revalidatePath on all public pages
                                           │    ("/", "/blog", "/blog/[slug]", "/books",
                                           │     "/videos", "/videos/[slug]", "/quotes",
                                           │     "/content", "/content/[slug]")
                                           └─ revalidateTag on every unstable_cache tag
                                                ("content", "categories", "videos",
                                                 "books", "quotes", "socials")
```

**Why both?** `revalidatePath` refreshes the ISR *page* cache; it does **not**
invalidate `unstable_cache` data. Without the `revalidateTag` calls, categories,
videos, books and quotes on the site stayed stale for up to a week. The tags on
`unstable_cache` helpers are `["content", "<entity>"]`, so the single
`revalidateTag("content", "max")` plus the entity tags covers everything.

`revalidatePublic()` (`apps/admin/src/lib/revalidate.ts`) **awaits** the site
call with a timeout and logs failures. It is best-effort by design — a site
that's unreachable must never block or fail the admin write — but in the happy
path the admin response returns only after the site has confirmed revalidation.

## 5. Failure modes — nothing crashes in production

| Situation                        | Behavior                                                       |
|----------------------------------|----------------------------------------------------------------|
| DB paused (Supabase free tier)   | Admin API → 503 `Database unavailable`; site pages → `dbSafe` fallback (404/empty) instead of 500 |
| Concurrent duplicate slug        | P2002 caught → 409 (no 500)                                    |
| Row deleted mid-request          | P2025 caught → 404                                             |
| Site down during admin write     | Write still succeeds; revalidation logged as failed; ISR TTL + admin retry recover |
| Invalid `CRON_SECRET` at reval   | Site returns 401; admin logs it                                |
| Post soft-deleted                | Gone from site immediately (deletedAt filter), row preserved    |
| Malicious HTML in content        | Sanitized at write; re-sanitized at render (defense in depth)  |
| Session expired / account deleted| `requireAdmin()` → 401; panel layout redirects to /admin       |

### `dbSafe` rule
Any site page that reads the DB must use `dbSafe(query, fallback)` so a paused
DB renders a graceful page instead of crashing. Pages: home, blog list, blog
detail, books, videos, quotes, content. Posts are additionally ISR-cached so
the DB is only hit on revalidation, not per visitor.

## 6. Performance notes (site speed)

- **ISR everywhere on the site**: `revalidate = 604800` + `generateStaticParams`
  for blog detail ⇒ CDN-cached pages, zero DB per visitor.
- **Lean selects on list queries**: the blog grid only needs
  `{ id, slug, title, coverImage, publishedAt }` — no full `content` HTML per
  card. Same for home previews. Never `findMany` without `select` on a list.
- **`unstable_cache` for hub data** so repeated page renders reuse one cached
  result instead of N queries.
- **Single PrismaClient per instance** (pool max 5) so a burst of lambdas
  doesn't exhaust Supabase's connection cap — the #1 "works sometimes" cause.
- Keep admin API responses lean: list GETs select only list columns.

## 7. Deployment runbook (Vercel, both apps)

### Env vars (identical where marked)

| Var                 | Site | Admin | Notes                                                       |
|---------------------|:----:|:-----:|-------------------------------------------------------------|
| `DATABASE_URL`      |  ✅  |  ✅   | Supabase pooler (`:6543`), same string both apps             |
| `DATABASE_POOL_MAX` |  ✅  |  ✅   | default 5                                                   |
| `AUTH_SECRET`       |      |  ✅   | `openssl rand -base64 32`; REQUIRED for NextAuth v5          |
| `CRON_SECRET`       |  ✅  |  ✅   | **must match** in both apps (revalidation bridge)            |
| `SITE_URL`          |      |  ✅   | admin's destination for revalidation calls                   |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` |    |  ✅   | bootstrap only, ignored once an admin exists      |
| `ADMIN_PHASE`       |      |  ✅   | `"1"` = Phase 1 gating; anything else = full                  |

### Steps
1. Push both apps to Vercel (two projects or monorepo subdirectories).
2. Set the env vars above on each project.
3. Keep `vercel.json` (keepalive cron) in each app so the free-tier DB stays
   warm and ISR revalidation has a trigger.
4. Confirm login on `admin.…`, create/edit a post, verify it appears on the
   site within seconds (revalidation bridge), and that a paused-DB scenario
   shows graceful pages on the site.

### Gotchas
- `SITE_URL` default is `https://sagarlad.com` — set it explicitly if the site
  lives elsewhere.
- Env bootstrap (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) only creates an admin when
  **zero** admins exist. Delete the row to re-trigger bootstrap.
- `.env` is never uploaded to Vercel; use the dashboard or CLI.
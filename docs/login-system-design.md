# Login System Design — Sagar Lad Admin Panel

Single source of truth for how login works in `apps/admin`, end to end. Read
this before changing anything auth-related. The goal is **simple, predictable,
and safe on the Vercel free tier** — no surprises in production.

## Flow at a glance

```
Browser                          NextAuth (apps/admin)                  Database (Supabase)
--------                         ----------------------                  ------------------
submit form
  │  POST /api/auth/callback/credentials
  ▼
authorize(credentials)
  ├─ zod validate email+password ──────────── invalid ──► log LOGIN_FAIL, return null
  ├─ per-IP flood guard (in-memory, 10/min) ── locked ──► throw ACCOUNT_LOCKED
  ├─ DB lockout check (30-min window) ─────── locked ──► throw ACCOUNT_LOCKED
  ├─ findUnique(user by email)
  ├─ bcrypt.compare(password, passwordHash)
  ├─ [bootstrap] no ADMIN exists yet? create from env vars (once)
  ├─ role must be ADMIN ───────────────────── denied ──► log LOGIN_FAIL, return null
  ├─ [2FA enabled] verify TOTP / recovery code
  ├─ update lastLoginAt, log LOGIN_OK
  ▼
return { id, name, email, role, image }
  ▼
JWT signed → session cookie set → redirect to /admin/dashboard (or /admin/posts)
```

## 1. Authentication — proving who you are

- **Provider**: NextAuth `Credentials` (email + password), plus optional TOTP
  second factor when `twoFactorEnabled`.
- **Validation**: `zod` parses email + password on the server. Fail → `null`.
- **Password check**: `bcryptjs.compare(password, user.passwordHash)` against
  the hash stored in the `User` row (bcrypt cost 12).
- **Bootstrap (first-run only)**: if **no** `ADMIN` user exists in the database
  yet, and the submitted email/password match `ADMIN_EMAIL`/`ADMIN_PASSWORD`
  env vars, an admin row is created. This runs exactly once — as soon as any
  admin exists, the database is the only source of truth and env vars are
  ignored. Panel changes (name/password/email) always stick.
- **2FA (optional)**: when enabled, `authorize` requires a valid TOTP code or
  recovery code before the session is created.

## 2. Authorization — what you can do

- **Role gate**: only `role === "ADMIN"` passes `authorize`; anything else
  returns `null` (never a partial session).
- **Server-side guard**: `requireAdmin()` (`apps/admin/src/lib/requireAdmin.ts`)
  is called by every admin API route and the panel layout. It returns `null`
  when there's no session or the role isn't `ADMIN`.
- **Layout redirect**: the `(panel)` layout redirects to `/admin` if not
  authenticated, so unauthenticated users can never reach admin pages.

## 3. Session — how the login state survives

- **Strategy**: stateless JWT (no DB session table).
  - `maxAge: 7 days`, `updateAge: 1 hour` (token refreshed in place on activity).
- **Payload**: `{ id, role }` plus the NextAuth defaults. No password, no
  secrets — minimum identity data only.
- **Session callback**: every `auth()` call re-resolves the user's `id` against
  the DB (fresh name/email/role/image). If the account was deleted, the
  session is dropped (`return null`) so the user is cleanly sent back to
  sign-in. If the DB is transiently down, the existing session is kept instead
  of logging everyone out.
- **`trustHost: true`** — required for Vercel's proxy headers to be trusted.

## 4. Cache — what is and isn't cached

- **DB client**: a single `PrismaClient` (one `pg.Pool`, max 5 conns) is cached
  on `globalThis` in **all** environments. On serverless this survives per warm
  instance, so a burst of lambdas doesn't exhaust the Supabase free-tier
  connection cap. This is the single most important fix for "some things work,
  some don't" on Vercel.
- **Session/user reads**: the session callback does one `findUnique` per
  `auth()` call — deliberately NOT long-cached, so role/email changes apply
  immediately. NextAuth de-dupes within a single request.
- **Rate limiter**: per-IP flood guard is an in-memory `Map` (per-instance on
  serverless — acceptable as a coarse flood guard). The **account lockout**
  (3 fails / 30 min) is DB-backed via the audit trail so it works across
  instances.

## 5. Cookies — how the session travels

| Property  | Value                                                       | Why                                        |
|-----------|-------------------------------------------------------------|--------------------------------------------|
| Name      | `authjs.session-token`                                      | NextAuth v5 default                        |
| `httpOnly`| `true`                                                      | JS can't read it (XSS-safe)                |
| `sameSite`| `lax`                                                       | CSRF-safe, works with NextAuth callback    |
| `secure`  | `true` in production, `false` in dev                        | HTTPS only in prod                         |
| `path`    | `/`                                                         | Sent to all admin routes                   |
| expiry    | 7 days                                                      | Matches JWT `maxAge`                       |

- Signed with `AUTH_SECRET` (JWE-encrypted). **`AUTH_SECRET` is required in
  production** — without it NextAuth v5 throws and login silently fails.
  Generate: `openssl rand -base64 32`.

## 6. Failure modes — nothing unexpected in production

| Situation                              | Behavior                                                        |
|----------------------------------------|-----------------------------------------------------------------|
| Wrong email/password                   | Generic "Invalid email or password" (no user-enumeration hint)  |
| 3+ fails in 30 min (account or IP)     | `ACCOUNT_LOCKED` for 30 min                                     |
| Flood: 10+ attempts/min from one IP    | `ACCOUNT_LOCKED` (per-IP)                                       |
| DB unreachable during login            | `DB_UNAVAILABLE` → clear message, login not blocked             |
| DB unreachable during throttle check   | Fails **open** (not locked) so a hiccup can't lock the admin    |
| Account deleted while session live     | Session dropped, clean re-login                                 |
| 2FA enabled, wrong/absent code         | `2FA_REQUIRED` → OTP step                                       |

## 7. Frontend contract (`/admin`)

- Client form posts to NextAuth's callback with `redirect: false` and reads
  the returned error code: `2FA_REQUIRED`, `ACCOUNT_LOCKED`, `DB_UNAVAILABLE`,
  else generic invalid-credentials.
- On success: short "Access granted" greeting, then push to
  `/admin/dashboard` (Phase 2) or `/admin/posts` (Phase 1).
- If a session already exists, the page shows the **active-session card**
  (continue / sign out) instead of the form.
- Password field has a show/hide (eye) toggle, `autoComplete` hints, and
  inline `role="alert"` errors.
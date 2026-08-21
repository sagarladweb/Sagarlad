# Sagar Lad Platform - Complete Setup Guide

Honest, step-by-step guide to deploy the website and admin panel. No sugarcoating - includes every weakness, limitation, and what to do when things break.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Why BigRock Hosting Cannot Run This App](#2-why-bigrock-hosting-cannot-run-this-app)
3. [What You Actually Need (Free Tier)](#3-what-you-actually-need)
4. [Step-by-Step Account Setup](#4-step-by-step-account-setup)
5. [DNS Configuration on GoDaddy](#5-dns-configuration-on-godaddy)
6. [Email Forwarding with Cloudflare](#6-email-forwarding-with-cloudflare)
7. [Brevo Email Sending Setup](#7-brevo-email-sending-setup)
8. [Google Analytics Setup](#8-google-analytics-setup)
9. [Vercel Deployment](#9-vercel-deployment)
10. [Environment Variables](#10-environment-variables)
11. [Post-Deployment Checklist](#11-post-deployment-checklist)
12. [Strengths, Weaknesses and Failure Modes](#12-strengths-weaknesses-and-failure-modes)
13. [Long-Term Viability](#13-long-term-viability)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Architecture Overview

```
GoDaddy (domain registrar only)
  DNS records -> Vercel (hosting)
  DNS records -> Brevo (email sending)
  DNS records -> Cloudflare (email forwarding)
  DNS records -> Google Analytics (verification)

Vercel (free tier - hosting)
  sagarlad.com (public website - apps/site)
  admin.sagarlad.com (admin panel - apps/admin)

Supabase (free tier - database + storage)
  PostgreSQL database (all content)
  File storage (images, uploads)

Brevo (free tier - email)
  Newsletter sending (300 emails/day)

Cloudflare (free tier - email forwarding)
  you@sagarlad.com -> forwards to your Gmail

GitHub (free - code + automation)
  Source code repository
  GitHub Actions (newsletter drain cron)
```

---

## 2. Why BigRock Hosting Cannot Run This App

Your "Single Domain Linux Hosting" plan is a **LAMP stack** (Linux + Apache + MySQL + PHP). It supports PHP apps like WordPress.

**Our apps are built with Next.js, which requires Node.js runtime.** BigRock shared hosting does not support Node.js. You cannot run `next start`, `npm run build`, or any server-side JavaScript on it.

This is not a limitation we can work around. It is a fundamental incompatibility.

**What to do with BigRock:**
- If purchased within 30 days: cancel and request full refund (BigRock offers 30-day money-back on shared hosting)
- If past 30 days: cancel auto-renewal so it does not charge you again
- The hosting plan is a sunk cost. Do not try to force-fit it.

---

## 3. What You Actually Need

| Service | Cost | Purpose |
|---|---|---|
| Vercel Free Tier | Rs.0/mo | Host both apps (site + admin) |
| Supabase Free Tier | Rs.0/mo | Database + file storage |
| Brevo Free Tier | Rs.0/mo | Newsletter emails (300/day) |
| Cloudflare Free Tier | Rs.0/mo | Email forwarding (you@sagarlad.com -> Gmail) |
| GitHub Free | Rs.0/mo | Source code + CI/CD automation |
| GoDaddy Domain | Already paid | Domain registration (sagarlad.com) |
| **Total** | **Rs.0/mo** | Everything runs free |

---

## 4. Step-by-Step Account Setup

### Step 4.1: Create Accounts

Create these accounts in order:

1. **GitHub** (github.com) - code hosting
2. **Vercel** (vercel.com) - sign up with GitHub (one-click)
3. **Supabase** (supabase.com) - sign up with GitHub
4. **Cloudflare** (cloudflare.com) - email forwarding
5. **Brevo** (brevo.com) - newsletter email sending
6. **Google Analytics** (analytics.google.com) - visitor tracking

### Step 4.2: Supabase Database

1. Log in to Supabase (supabase.com)
2. Click **New Project** -> name: `sagarlad-prod`, set a strong database password
3. Go to **Project Settings -> Database**
   - Copy **Transaction Pooler URL (port 6543)** -> this is `DATABASE_URL`
   - Copy **Direct Connection URL (port 5432)** -> this is `DIRECT_URL` (local only)
4. Go to **Project Settings -> API**
   - Copy **Project URL** -> this is `SUPABASE_URL`
   - Click **Reveal** on `service_role` key -> this is `SUPABASE_SERVICE_ROLE_KEY`
5. Initialize the database:
   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   ```

### Step 4.3: Generate Secrets

Run these commands in your terminal:

```bash
# Generate AUTH_SECRET (same for both apps)
openssl rand -base64 32

# Generate CRON_SECRET (same for both apps + GitHub)
openssl rand -hex 32
```

Save both values. You will need them multiple times.

---

## 5. DNS Configuration on GoDaddy

Your domain is on GoDaddy. You need to add DNS records so GoDaddy knows where to send traffic.

### Step 5.1: Access DNS Management

1. Log in to GoDaddy (dcc.godaddy.com)
2. Click **All Products and Services** -> find `sagarlad.com`
3. Click **DNS** next to your domain
4. You will see the DNS Management page

### Step 5.2: Add Vercel Records (Required)

Delete any existing A or CNAME records for @ or www that point elsewhere (like BigRock IPs).

**Record 1: Main Domain**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`
- TTL: `600` (10 minutes)

**Record 2: www Subdomain**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`
- TTL: `600`

**Record 3: Admin Subdomain**
- Type: `CNAME`
- Name: `admin`
- Value: `cname.vercel-dns.com`
- TTL: `600`

### Step 5.3: Add Brevo Records (Required for Email Sending)

Go to Brevo -> **Senders & IP -> Domains -> Add Domain** -> enter `sagarlad.com`. Brevo will show you DNS records to add. Add them in GoDaddy:

**Record 4: SPF (Email Authentication)**
- Type: `TXT`
- Name: `@`
- Value: `v=spf1 include:spf.brevo.com ~all`
- TTL: `600`

**Record 5: DKIM (Email Authentication)**
- Type: `CNAME`
- Name: `em[XXXX]` (Brevo gives you this exact value)
- Value: `mail.brevo.com`
- TTL: `600`

**Record 6: Domain Verification**
- Type: `TXT`
- Name: `@`
- Value: `brevo-code:XXXXXXXXXX` (Brevo gives you this exact value)
- TTL: `600`

**Record 7: DMARC (Email Policy)**
- Type: `TXT`
- Name: `_dmarc`
- Value: `v=DMARC1; p=none; rua=mailto:you@sagarlad.com`
- TTL: `600`

### Step 5.4: Add Google Analytics Record (Required)

Go to Google Analytics -> **Admin -> Data Streams** -> click your stream -> **Configure tag settings** -> **Configure your domain** -> it will ask you to verify ownership. Copy the verification code.

Add this record in GoDaddy:

**Record 8: Google Verification**
- Type: `TXT`
- Name: `@`
- Value: `google-site-verification=XXXXXXXXXXXXXXXXX` (Google gives you this)
- TTL: `600`

### Step 5.5: Add Cloudflare Email Routing Records (Required for Email Forwarding)

Follow Section 6 below first to set up Cloudflare. Then add these records in GoDaddy:

**Record 9-11: MX Records (Email Routing)**
- Type: `MX`, Name: `@`, Value: `route1.mx.cloudflare.net`, Priority: `75`, TTL: `600`
- Type: `MX`, Name: `@`, Value: `route2.mx.cloudflare.net`, Priority: `55`, TTL: `600`
- Type: `MX`, Name: `@`, Value: `route3.mx.cloudflare.net`, Priority: `35`, TTL: `600`

**Record 12: Cloudflare Ownership Verification**
- Type: `TXT`
- Name: `@`
- Value: `cloudflare-verification=XXXXXXXXXXXXXXXXX` (Cloudflare gives you this)
- TTL: `600`

### Step 5.6: Verify Everything

After adding all records:
1. Wait 10-30 minutes for DNS propagation
2. Check propagation at dnschecker.org - enter `sagarlad.com` and verify A record shows `76.76.21.21`
3. In Vercel -> **Settings -> Domains** -> add `sagarlad.com` -> it should verify automatically
4. In Vercel -> admin project -> **Settings -> Domains** -> add `admin.sagarlad.com`

---

## 6. Email Forwarding with Cloudflare

This lets `you@sagarlad.com` forward to your personal Gmail. Free and reliable.

### Step 6.1: Add Domain to Cloudflare

1. Log in to Cloudflare (cloudflare.com)
2. Click **Add a Site** -> enter `sagarlad.com`
3. Select **Free** plan
4. Cloudflare will scan existing DNS records -> click **Continue**
5. Cloudflare will give you 2 nameservers. You have two options:

**Option A: Keep GoDaddy nameservers (simpler - recommended)**
- Do not change nameservers on GoDaddy
- Just add the DNS records from Step 5.5 in GoDaddy
- Email routing works without changing nameservers

**Option B: Move to Cloudflare nameservers (more features)**
- Update nameservers on GoDaddy to the ones Cloudflare provides
- All DNS management moves to Cloudflare
- You get CDN, DDoS protection, and more
- But this changes your entire DNS setup - more risk

**Recommendation**: Option A. Less change = less risk. You can always switch to Option B later.

### Step 6.2: Enable Email Routing

1. In Cloudflare -> select your domain -> **Email** -> **Email Routing**
2. Click **Get Started**
3. Add a forwarding rule:
   - **Custom address**: `sagar` (or any name you want)
   - **Forward to**: `yourpersonalgmail@gmail.com`
   - Click **Create and continue**
4. Cloudflare will ask you to verify by adding a TXT record -> add it in GoDaddy (see Record 12 in Step 5.5)
5. Click **Check verification** -> wait for it to pass
6. Enable the forwarding rule

### Step 6.3: Test Email Forwarding

1. Send an email to `sagar@sagarlad.com`
2. Check your Gmail inbox
3. You should receive it within 1-2 minutes

**Note**: Email forwarding only receives email. You cannot send email from `sagar@sagarlad.com` through Cloudflare. For sending, use Brevo (Section 7) or send from your Gmail (recipients see your Gmail address).

---

## 7. Brevo Email Sending Setup

Brevo sends your newsletter emails (free: 300/day).

### Step 7.1: Create Account and Get API Key

1. Sign up at brevo.com
2. Go to **SMTP & API -> API Keys -> Generate a new API key**
3. Copy the key (starts with `xkeysib-`) -> this is `BREVO_API_KEY`

### Step 7.2: Verify Your Domain

1. Go to **Senders & IP -> Domains -> Add a domain**
2. Enter `sagarlad.com`
3. Brevo will show you DNS records (CNAME + TXT) -> add them in GoDaddy (see Step 5.3)
4. Click **Verify** in Brevo
5. Wait for verification (usually 5-15 minutes)

### Step 7.3: Create a Sender

1. Go to **Senders & IP -> Senders -> Add a sender**
2. Email: `hello@sagarlad.com` (or whatever you want)
3. Name: `Sagar Lad`
4. Verify the sender email (Brevo sends a verification email)

### Step 7.4: Set Environment Variables

- `BREVO_API_KEY`: Your API key from Step 7.1
- `BREVO_FROM_EMAIL`: `hello@sagarlad.com` (your sender email)
- `BREVO_FROM_NAME`: `Sagar Lad`

---

## 8. Google Analytics Setup

### Step 8.1: Create Property

1. Go to analytics.google.com
2. Click **Admin -> Create Property**
3. Property name: `Sagar Lad Website`
4. Currency: `Indian Rupee`
5. Click **Next** -> Business details -> select size -> click **Create**

### Step 8.2: Create Data Stream

1. In your new property -> **Admin -> Data Streams -> Add stream -> Web**
2. Website URL: `sagarlad.com`
3. Stream name: `Sagar Lad Website`
4. Click **Create stream**
5. Copy the **Measurement ID** (`G-XXXXXXXXXX`) -> this is `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Step 8.3: Get Property ID (for Admin Dashboard)

1. Go to **Admin -> Property -> Property details**
2. Copy the numeric **Property ID** -> this is `GA_PROPERTY_ID`

### Step 8.4: Create Service Account (for Admin Dashboard)

1. Go to console.cloud.google.com
2. Create a new project (or use existing)
3. Go to **APIs & Services -> Library** -> search "Google Analytics Data API" -> click **Enable**
4. Go to **APIs & Services -> Credentials -> Create Credentials -> Service Account**
5. Name: `analytics-reader`
6. Click **Done**
7. Click the created service account -> **Keys -> Add Key -> Create new key -> JSON**
8. Download the JSON file
9. Open it, copy the **entire content** -> this is `GOOGLE_SERVICE_ACCOUNT_JSON`

### Step 8.5: Grant Access

1. In Google Analytics -> **Admin -> Property access management -> Add users**
2. Paste the service account email (from the JSON file, ends in `@...iam.gserviceaccount.com`)
3. Role: **Viewer**
4. Click **Add**

---

## 9. Vercel Deployment

### Step 9.1: Deploy Public Website

1. Go to vercel.com -> **Add New -> Project**
2. Import `sagarlad-platform` from GitHub
3. **Framework Preset**: Next.js
4. **Root Directory**: `apps/site`
5. Add environment variables (see Section 10)
6. Click **Deploy**
7. After deployment -> **Settings -> Domains** -> add `sagarlad.com`
8. Add `www` -> set as redirect to `sagarlad.com`

### Step 9.2: Deploy Admin Panel

1. **Add New -> Project** -> import same repository
2. **Framework Preset**: Next.js
3. **Root Directory**: `apps/admin`
4. Add environment variables (see Section 10)
5. Set `ADMIN_PHASE` = `"2"`
6. Click **Deploy**
7. After deployment -> **Settings -> Domains** -> add `admin.sagarlad.com`

### Step 9.3: Set Up GitHub Actions for Newsletter

The newsletter queue drains via GitHub Actions (since Vercel free tier does not support cron).

1. Go to your GitHub repo -> **Settings -> Secrets and variables -> Actions**
2. Add these repository secrets:
   - `NEWSLETTER_PROCESS_URL` = `https://sagarlad.com/api/newsletter/process`
   - `NEWSLETTER_CRON_SECRET` = same value as your `CRON_SECRET`

---

## 10. Environment Variables

### Vercel - Public Website (`apps/site`)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase Transaction Pooler URL (port 6543) |
| `AUTH_SECRET` | Generated value from Step 4.3 |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `BREVO_API_KEY` | `xkeysib-...` |
| `BREVO_FROM_EMAIL` | `hello@sagarlad.com` |
| `BREVO_FROM_NAME` | `Sagar Lad` |
| `CRON_SECRET` | Generated value from Step 4.3 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SITE_URL` | `https://sagarlad.com` |
| `SITE_URL` | `https://sagarlad.com` |
| `DAILY_EMAIL_LIMIT` | `300` |
| `NEWSLETTER_BATCH_SIZE` | `20` |

### Vercel - Admin Panel (`apps/admin`)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Same as site |
| `AUTH_SECRET` | Same as site |
| `SUPABASE_URL` | Same as site |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as site |
| `BREVO_API_KEY` | Same as site |
| `BREVO_FROM_EMAIL` | Same as site |
| `BREVO_FROM_NAME` | Same as site |
| `CRON_SECRET` | Same as site |
| `NEXT_PUBLIC_SITE_URL` | `https://sagarlad.com` |
| `SITE_URL` | `https://sagarlad.com` |
| `GA_PROPERTY_ID` | Numeric Property ID from GA4 |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON from Step 8.4 |
| `ADMIN_PHASE` | `"2"` |

---

## 11. Post-Deployment Checklist

After deployment, verify everything works:

- [ ] `https://sagarlad.com` loads the public website
- [ ] `https://admin.sagarlad.com` loads the admin login
- [ ] Admin login works with seeded credentials
- [ ] Blog posts create/edit/delete correctly
- [ ] Images upload and display
- [ ] Newsletter sends (test with 1 subscriber)
- [ ] Email forwarding works (`you@sagarlad.com` -> Gmail)
- [ ] Google Analytics shows real-time visitors
- [ ] SSL certificates active (padlock in browser)
- [ ] Dark theme toggle works ("T" key)
- [ ] Toast notifications appear centered

---

## 12. Strengths, Weaknesses and Failure Modes

### Strengths

| Strength | Details |
|---|---|
| **Zero monthly cost** | All services run on free tiers. No recurring charges. |
| **Automatic deployments** | Push to GitHub, Vercel auto-deploys in ~60 seconds |
| **Global CDN** | Vercel serves content from edge servers worldwide |
| **Free SSL** | Automatic HTTPS on both domains |
| **Scalable** | If traffic grows, paid tiers are cheap to upgrade to |
| **Type-safe** | Full TypeScript catches errors before they reach production |
| **Database backups** | Supabase free tier includes daily backups |
| **Newsletter automation** | GitHub Actions drain the queue daily, no manual work |

### Weaknesses (Be Honest About These)

| Weakness | Impact | Mitigation |
|---|---|---|
| **Vercel free tier: 100GB bandwidth/mo** | If site gets 30K+ visits/mo with heavy pages, you hit the limit | Monitor in Vercel dashboard. Upgrade to Pro ($20/mo) if needed. |
| **Vercel free tier: no cron jobs** | Newsletter drain relies on GitHub Actions (runs once/day) | Set up cron-job.org to hit the endpoint every 30 min as backup |
| **Vercel free tier: 10s function timeout** | Slow API routes may timeout on free tier | All API routes are optimized; unlikely to hit 10s |
| **Supabase free tier: pauses after 7 days inactive** | Database goes to sleep if nobody visits for 7 days | Keep-alive cron runs daily. If it pauses, Supabase auto-resumes on first request (few seconds delay). |
| **Supabase free tier: 500MB database** | Large sites with many posts/images metadata may exceed this | For a personal portfolio/blog, 500MB is plenty. Upgrade to $25/mo if needed. |
| **Supabase free tier: 1GB file storage** | Images/uploads limited to 1GB total | Compress images before upload. Upgrade to paid tier if needed. |
| **Brevo free tier: 300 emails/day** | Newsletter limited to 300 subscribers effectively | For a personal site, this is usually enough. Upgrade to $25/mo for 40K emails. |
| **Cloudflare email forwarding: receive only** | Cannot send email from your domain through Cloudflare | Use Brevo for sending. Cloudflare only handles receiving/forwarding. |
| **No phone support** | All services are self-service; no phone number to call | All services have documentation and community forums |
| **Single point of failure: DNS** | If GoDaddy DNS goes down, everything goes offline | GoDaddy has 99.99% uptime. Use Cloudflare nameservers for redundancy. |
| **Vercel cold starts** | First request after idle may take 2-3 seconds | Only affects admin panel (less traffic). Public site stays warm from visitors. |

### Failure Modes and What Happens

| Failure | What You See | How to Fix | Time to Recovery |
|---|---|---|---|
| **Supabase pauses** | Site shows errors or slow loads | First request auto-resumes it. Wait 5-10 seconds. | 5-10 seconds |
| **Brevo daily limit hit** | Newsletter stops sending | Wait until midnight UTC (resets daily). Upgrade plan if persistent. | Until midnight UTC |
| **Vercel bandwidth exceeded** | Site shows 502 or bandwidth error | Upgrade to Vercel Pro ($20/mo) or optimize images | 5 minutes (upgrade) |
| **DNS propagation delay** | Domain does not resolve after DNS change | Wait up to 48 hours. Check dnschecker.org. | 10-48 hours |
| **SSL certificate issue** | Browser shows "Not Secure" warning | Vercel auto-renews. Usually fixes itself. Force redeploy if persistent. | 5-10 minutes |
| **GitHub Action fails** | Newsletter not draining automatically | Check Actions tab for errors. Manually trigger or fix the workflow. | 5 minutes |
| **Database connection pool exhausted** | App shows connection errors | Increase DATABASE_POOL_MAX or upgrade Supabase. | 2 minutes |
| **API route timeout** | Request fails with 504 | Optimize the route. Upgrade Vercel for longer timeouts. | Code fix needed |
| **Domain expired** | Site goes completely offline | Renew on GoDaddy immediately. | Immediate after renewal |
| **Service account key rotated** | Admin dashboard analytics broken | Generate new JSON key, update Vercel env var, redeploy. | 5 minutes |

---

## 13. Long-Term Viability

### Will This Stack Work for 1-3 Years?

**Short answer: Yes, but plan for costs to increase as you grow.**

### Year 1 (0-1000 subscribers): Rs.0/mo
- All free tiers
- GitHub Actions handle automation
- Supabase keeps database alive
- Brevo handles newsletter sending
- Vercel hosts everything

### Year 2 (1000-5000 subscribers): Rs.2000-5000/mo
- Vercel Pro ($20/mo) for more bandwidth and cron support
- Supabase Pro ($25/mo) for more storage and no pause
- Brevo Starter ($25/mo) for 40K emails/month
- Total: ~Rs.5000/mo (~$60)

### Year 3+ (5000+ subscribers): Rs.5000-15000/mo
- All paid tiers
- Possibly dedicated email service
- Total: ~Rs.15000/mo (~$180)

### Migration Path if Vercel Becomes Too Expensive

If Vercel pricing changes or you need more control:
1. **Railway** ($5/mo) - run Next.js apps on a VPS-like environment
2. **Render** (free tier available) - similar to Vercel but with more control
3. **Fly.io** (free tier available) - container-based deployment
4. **DigitalOcean App Platform** ($12/mo) - simple PaaS

All of these support Next.js and would require minimal changes to deploy.

### What Could Break Long-Term

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Supabase free tier discontinued** | Low | High | Migrate to PostgreSQL on Railway or DigitalOcean |
| **Vercel free tier discontinued** | Low | High | Migrate to Render, Railway, or Fly.io |
| **Brevo free tier reduced** | Medium | Medium | Switch to Mailgun, SendGrid, or Amazon SES |
| **Next.js major breaking change** | Low | High | Pin version. Test before upgrading. |
| **Domain registrar (GoDaddy) issues** | Low | High | Transfer domain to Cloudflare Registrar (same price, better features) |

---

## 14. Troubleshooting

### "Site is not loading"
1. Check dnschecker.org - is DNS propagating?
2. Check Vercel dashboard - is the deployment successful?
3. Check if domain is verified in Vercel Settings -> Domains

### "Admin login fails"
1. Check DATABASE_URL in Vercel environment variables
2. Check if Supabase project is paused (visit Supabase dashboard)
3. Check AUTH_SECRET is set correctly

### "Newsletter not sending"
1. Check CRON_SECRET matches between Vercel and GitHub
2. Check GitHub Actions tab - is the workflow running?
3. Check Brevo dashboard - is domain verified?
4. Check Brevo API key is valid

### "Images not loading"
1. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel
2. Check if image domains are allowed in next.config.ts (i.ytimg.com, etc.)
3. Check Supabase Storage bucket exists and has correct permissions

### "Email forwarding not working"
1. Check MX records are set correctly in GoDaddy
2. Check Cloudflare email routing is enabled
3. Check Cloudflare domain verification passed
4. Wait up to 24 hours for MX record propagation

### "Google Analytics not tracking"
1. Check NEXT_PUBLIC_GA_MEASUREMENT_ID is correct
2. Check Measurement ID starts with G-
3. Check GA4 property is active (not in draft mode)
4. Check the verification TXT record is added in GoDaddy

### "Vercel build fails"
1. Check build logs in Vercel dashboard
2. Common issues: missing environment variables, TypeScript errors
3. Run `npm run build` locally first to catch errors

### "Supabase database errors"
1. Check if project is paused (Supabase dashboard)
2. Check DATABASE_URL includes port 6543 (pooler, not direct)
3. Check connection pool limit (default 5 is usually fine)

---

## Appendix: Complete DNS Records Summary

For quick reference, here are ALL the DNS records you need in GoDaddy:

| # | Type | Name | Value | Priority | TTL | Purpose |
|---|---|---|---|---|---|---|
| 1 | A | @ | 76.76.21.21 | - | 600 | Vercel hosting (site) |
| 2 | CNAME | www | cname.vercel-dns.com | - | 600 | Vercel hosting (www redirect) |
| 3 | CNAME | admin | cname.vercel-dns.com | - | 600 | Vercel hosting (admin panel) |
| 4 | TXT | @ | v=spf1 include:spf.brevo.com ~all | - | 600 | Brevo SPF |
| 5 | CNAME | em[XXXX] | mail.brevo.com | - | 600 | Brevo DKIM (get exact name from Brevo) |
| 6 | TXT | @ | brevo-code:XXXXXXXXXX | - | 600 | Brevo domain verification (get exact value from Brevo) |
| 7 | TXT | _dmarc | v=DMARC1; p=none; rua=mailto:you@sagarlad.com | - | 600 | Email policy |
| 8 | TXT | @ | google-site-verification=XXXXXXXXX | - | 600 | Google Analytics verification (get exact value from Google) |
| 9 | MX | @ | route1.mx.cloudflare.net | 75 | 600 | Cloudflare email routing |
| 10 | MX | @ | route2.mx.cloudflare.net | 55 | 600 | Cloudflare email routing |
| 11 | MX | @ | route3.mx.cloudflare.net | 35 | 600 | Cloudflare email routing |
| 12 | TXT | @ | cloudflare-verification=XXXXXXXXX | - | 600 | Cloudflare domain verification (get exact value from Cloudflare) |

**Important**: Records marked with [XXXX] or XXXXXXXXXXX are provided by the respective service (Brevo, Google, Cloudflare). Do not copy the placeholder values - use the actual values from each service's dashboard.

---

*Last updated: August 2026*
*Platform version: Next.js 16.3.0, Prisma ORM, PostgreSQL on Supabase*

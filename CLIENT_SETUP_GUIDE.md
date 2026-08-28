# Sagar Lad Platform - Complete Setup Guide

Step-by-step guide to deploy the website and admin panel, including every credential source and database migration instructions.

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
10. [Environment Variables - Complete Credential Guide](#10-environment-variables---complete-credential-guide)
11. [Database Migration to Supabase](#11-database-migration-to-supabase)
12. [Post-Deployment Checklist](#12-post-deployment-checklist)
13. [Strengths, Weaknesses and Failure Modes](#13-strengths-weaknesses-and-failure-modes)
14. [Long-Term Viability](#14-long-term-viability)
15. [Troubleshooting](#15-troubleshooting)

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
  contact@sagarlad.com -> forwards to your Gmail

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
2. Copy the numeric **Property ID** -> this is `GA4_PROPERTY_ID`

### Step 8.4: Google Cloud Console Setup (for Admin Dashboard Analytics)

This connects your admin panel to Google Analytics so you can see traffic data directly in the dashboard. One-time setup, no maintenance needed.

**Which API you need:**

| API | Purpose | You need? |
|-----|---------|-----------|
| **Google Analytics Data API v1** | Query GA4 reports (users, pageviews, sessions) | **Yes** |
| Google Analytics Admin API | Manage property settings | No |
| Google Analytics Reporting API v4 | Legacy Universal Analytics | No (deprecated) |

**Free tier:** GA4 is completely free. Data API has generous quotas (50k requests/day for service accounts). You will never hit it for a personal site.

#### Step 8.4.1: Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown (top-left) -> **New Project**
3. Name: `sagarlad-analytics` -> Click **Create**
4. Select the new project from the dropdown

#### Step 8.4.2: Enable the Data API

1. Go to [console.cloud.google.com/apis/library/analyticsdata.googleapis.com](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com)
2. Click **Enable**

#### Step 8.4.3: Create a Service Account

1. Go to **APIs & Services** -> **Credentials**
2. Click **Create Credentials** -> **Service Account**
3. Name: `ga4-reader`
4. Click **Create and Continue**
5. Role: **Skip** (not needed)
6. Click **Done**

#### Step 8.4.4: Generate a Key

1. In the service account list, click on `ga4-reader`
2. Go to **Keys** tab -> **Add Key** -> **Create new key**
3. Select **JSON** -> **Create**
4. A `.json` file downloads -> **save it as `google-analytics-key.json`** in your project root

#### Step 8.4.5: Grant Access in Google Analytics

1. Open the downloaded JSON file, find the `client_email` (looks like `ga4-reader@sagarlad-analytics.iam.gserviceaccount.com`)
2. Go to [analytics.google.com](https://analytics.google.com)
3. **Admin** (bottom-left) -> **Property Access Management**
4. Click **+** -> **Add users**
5. Paste the service account email
6. Role: **Viewer**
7. Click **Add**

#### Step 8.4.6: Add Environment Variables

- `GA4_PROPERTY_ID`: Numeric Property ID from Step 8.3
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Paste the entire JSON content from the downloaded key file (single line, no newlines)

**How it works long-term:**
- Service account keys do not expire
- No OAuth flow or user login required
- Server-to-server authentication, fully automatic
- If key is compromised, regenerate in Google Cloud Console and update the env var
- Quota: 50k requests/day (free). You will use ~50/day at most

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

## 10. Environment Variables - Complete Credential Guide

This section lists every credential, what it does, and exactly how to get it.

### Credential Reference Table

| # | Variable | Where Used | Source | Difficulty |
|---|----------|------------|--------|------------|
| 1 | `DATABASE_URL` | Both apps | Supabase | Easy |
| 2 | `DIRECT_URL` | Both apps | Supabase | Easy |
| 3 | `AUTH_SECRET` | Both apps | Terminal command | Easy |
| 4 | `ADMIN_EMAIL` | Both apps | Your email | Easy |
| 5 | `ADMIN_PASSWORD` | Both apps | You create it | Easy |
| 6 | `SUPABASE_URL` | Both apps | Supabase | Easy |
| 7 | `SUPABASE_ANON_KEY` | Both apps | Supabase | Easy |
| 8 | `SUPABASE_SERVICE_ROLE_KEY` | Both apps | Supabase | Easy |
| 9 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Both apps | Google Analytics | Easy |
| 10 | `BREVO_API_KEY` | Both apps | Brevo | Easy |
| 11 | `BREVO_FROM_EMAIL` | Both apps | Brevo | Easy |
| 12 | `BREVO_FROM_NAME` | Both apps | Brevo | Easy |
| 13 | `CRON_SECRET` | Both apps | Terminal command | Easy |
| 14 | `DAILY_EMAIL_LIMIT` | Both apps | Fixed value: `300` | Trivial |
| 15 | `NEWSLETTER_BATCH_SIZE` | Both apps | Fixed value: `20` | Trivial |
| 16 | `NEXT_PUBLIC_SITE_URL` | Both apps | Fixed value: `https://sagarlad.com` | Trivial |
| 17 | `SITE_URL` | Both apps | Fixed value: `https://sagarlad.com` | Trivial |
| 18 | `NEWSLETTER_CRON` | Both apps | Fixed value: `0` | Trivial |
| 19 | `GA_PROPERTY_ID` | Admin only | Google Analytics | Easy |
| 20 | `GOOGLE_SERVICE_ACCOUNT_JSON` | Admin only | Google Cloud Console | Medium |
| 21 | `ADMIN_PHASE` | Admin only | Fixed value: `"2"` | Trivial |

### Credential #1: DATABASE_URL

**What it does:** Connects your app to the Supabase PostgreSQL database via the connection pooler (recommended for serverless).

**How to get it:**
1. Log in to [supabase.com](https://supabase.com)
2. Select your project (`sagarlad-prod`)
3. Go to **Project Settings** (gear icon, bottom-left)
4. Click **Database** in the left sidebar
5. Under **Connection string**, click **URI** tab
6. Copy the **Transaction pooler** URL (port `6543`)
7. It looks like: `postgresql://postgres.xxxxxxxxxxxxx:Sagarlad@2026@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`

**Important:** Use port 6543 (Transaction pooler), NOT port 5432 (Direct connection). Port 6543 works with Vercel's serverless functions.

**Format:** `postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

---

### Credential #2: DIRECT_URL

**What it does:** Used by Prisma for migrations and deploy commands (requires a direct connection, not pooled).

**How to get it:**
1. Same Supabase project -> **Project Settings -> Database**
2. Under **Connection string**, copy the **Direct connection** URL (port `5432`)
3. It looks like: `postgresql://postgres:Sagarlad@2026@db.vvawladyffozwclpqdhu.supabase.co:5432/postgres`

**Important:** This is only used locally for `prisma migrate` and `prisma db push`. Do NOT use this in Vercel (it will exhaust your connection limit).

**Format:** `postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

---

### Credential #3: AUTH_SECRET

**What it does:** Used by NextAuth.js to encrypt sessions and JWT tokens. Without it, login will not work.

**How to get it:**
```bash
openssl rand -base64 32
```

This outputs something like: `8/AGlmM5ktb4sFRSReSFM7+CQeBl9BOtuWJ5A34FZwc=`

**Important:** Generate once, use the same value for both site and admin apps. Never commit this to git.

---

### Credential #4: ADMIN_EMAIL

**What it does:** The email address for the admin login account.

**How to get it:** Use your own email address, e.g., `sagarlad692@gmail.com`

---

### Credential #5: ADMIN_PASSWORD

**What it does:** The password for the admin login account.

**How to get it:** Create a strong password yourself, e.g., `Sagu@123`

**Important:** This is seeded into the database on first run. After that, it is stored as a bcrypt hash. Change it after first login.

---

### Credential #6: SUPABASE_URL

**What it does:** The public API URL for your Supabase project. Used for file storage (images, uploads).

**How to get it:**
1. Supabase dashboard -> **Project Settings -> API**
2. Copy **Project URL**
3. It looks like: `https://vvawladyffozwclpqdhu.supabase.co`

**Format:** `https://[PROJECT_REF].supabase.co`

---

### Credential #7: SUPABASE_ANON_KEY

**What it does:** The anonymous (public) API key for Supabase. Used for client-side operations with Row Level Security.

**How to get it:**
1. Supabase dashboard -> **Project Settings -> API**
2. Under **Project API keys**, copy the `anon` `public` key
3. It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### Credential #8: SUPABASE_SERVICE_ROLE_KEY

**What it does:** The admin API key for Supabase. Bypasses Row Level Security. Used for server-side operations (file uploads, admin queries).

**How to get it:**
1. Supabase dashboard -> **Project Settings -> API**
2. Under **Project API keys**, click **Reveal** on the `service_role` key
3. Copy the key

**Important:** This key bypasses ALL security rules. Never expose it to the client side. Never commit it to git.

---

### Credential #9: NEXT_PUBLIC_GA_MEASUREMENT_ID

**What it does:** Google Analytics tracking ID. Visible to users (hence `NEXT_PUBLIC_` prefix).

**How to get it:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. **Admin** (bottom-left) -> **Data Streams**
3. Click your web stream
4. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

---

### Credential #10: BREVO_API_KEY

**What it does:** Authenticates your app with Brevo's email API for sending newsletters.

**How to get it:**
1. Log in to [brevo.com](https://brevo.com)
2. Go to **SMTP & API** (left sidebar) -> **API Keys**
3. Click **Generate a new API key**
4. Name it `sagarlad-production`
5. Copy the key (starts with `xkeysib-`)

**Important:** The key is only shown once. Copy it immediately.

---

### Credential #11: BREVO_FROM_EMAIL

**What it does:** The "from" email address shown on newsletter emails.

**How to get it:** Use the sender email you verified in Brevo (Step 7.3), e.g., `no-reply@sagarlad.com` or `hello@sagarlad.com`

---

### Credential #12: BREVO_FROM_NAME

**What it does:** The sender name shown on newsletter emails.

**How to get it:** Any name you want, e.g., `Sagar Lad`

---

### Credential #13: CRON_SECRET

**What it does:** Protects the `/api/newsletter/process` endpoint from public access. GitHub Actions uses this to authenticate.

**How to get it:**
```bash
openssl rand -hex 32
```

This outputs something like: `497d740fe138a7b84a591665ced342eff4add2f2bdfdc8214ade23ab02ae4818`

**Important:** Generate once, use the same value for both Vercel apps AND GitHub Actions secrets.

---

### Credential #14-15: DAILY_EMAIL_LIMIT, NEWSLETTER_BATCH_SIZE

**What they do:** Control newsletter sending rate (stays within Brevo's 300/day free tier).

**Values:**
- `DAILY_EMAIL_LIMIT=300`
- `NEWSLETTER_BATCH_SIZE=20`

---

### Credential #16-17: NEXT_PUBLIC_SITE_URL, SITE_URL

**What they do:** The public website URL used for redirects, canonical links, and revalidation.

**Values:**
- `NEXT_PUBLIC_SITE_URL=https://sagarlad.com`
- `SITE_URL=https://sagarlad.com`

For local development, use `http://localhost:3000`.

---

### Credential #18: NEWSLETTER_CRON

**What it does:** Set to `0` on Vercel (GitHub Actions handles cron). Set to `1` only on self-hosted servers.

**Value:** `0`

---

### Credential #19: GA_PROPERTY_ID

**What it does:** Numeric Google Analytics property ID. Used by the admin dashboard to query analytics data.

**How to get it:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. **Admin** -> **Property settings**
3. Copy the **Property ID** (numeric, e.g., `123456789`)

---

### Credential #20: GOOGLE_SERVICE_ACCOUNT_JSON

**What it does:** A JSON key file that lets the admin panel query Google Analytics data server-side.

**How to get it:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project `sagarlad-analytics` (or use existing)
3. Enable **Google Analytics Data API v1**: [console.cloud.google.com/apis/library/analyticsdata.googleapis.com](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com)
4. Go to **APIs & Services -> Credentials**
5. Click **Create Credentials -> Service Account**
6. Name: `ga4-reader`, click **Create and Continue**, skip role, click **Done**
7. Click on `ga4-reader` -> **Keys** tab -> **Add Key -> Create new key -> JSON**
8. A `.json` file downloads
9. Open the JSON file, copy the ENTIRE content as a single line
10. Paste it as the value of `GOOGLE_SERVICE_ACCOUNT_JSON`

Then grant the service account access to your GA4 property:
1. In the JSON file, find `client_email` (e.g., `ga4-reader@sagarlad-analytics.iam.gserviceaccount.com`)
2. Go to [analytics.google.com](https://analytics.google.com) -> **Admin -> Property Access Management**
3. Click **+ -> Add users**
4. Paste the service account email, set role to **Viewer**, click **Add**

**Important:** Paste the JSON as a single line (remove all newlines). The entire value should start with `{` and end with `}`.

---

### Credential #21: ADMIN_PHASE

**What it does:** Controls which admin features are available. Set to `"2"` for full features.

**Value:** `"2"`

---

### Complete .env Files

#### apps/site/.env (for local development)

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
AUTH_SECRET="[generated value]"

ADMIN_EMAIL="your-email@gmail.com"
ADMIN_PASSWORD="your-strong-password"

SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="[anon key from Supabase]"
SUPABASE_SERVICE_ROLE_KEY="[service_role key from Supabase]"

NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
BREVO_API_KEY="xkeysib-..."
BREVO_FROM_EMAIL="no-reply@sagarlad.com"
BREVO_FROM_NAME="Sagar Lad"

DAILY_EMAIL_LIMIT=300
NEWSLETTER_BATCH_SIZE=20
CRON_SECRET="[generated value]"
NEWSLETTER_CRON=0

NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000
```

#### apps/admin/.env (for local development)

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
AUTH_SECRET="[generated value]"

ADMIN_EMAIL="your-email@gmail.com"
ADMIN_PASSWORD="your-strong-password"

SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="[anon key from Supabase]"
SUPABASE_SERVICE_ROLE_KEY="[service_role key from Supabase]"

NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
GA_PROPERTY_ID="[numeric property ID]"
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

BREVO_API_KEY="xkeysib-..."
BREVO_FROM_EMAIL="no-reply@sagarlad.com"
BREVO_FROM_NAME="Sagar Lad"

DAILY_EMAIL_LIMIT=300
NEWSLETTER_BATCH_SIZE=20
CRON_SECRET="[generated value]"
NEWSLETTER_CRON=0

SITE_URL=http://localhost:3000
ADMIN_PHASE="2"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 11. Database Migration to Supabase

This section covers migrating from your current database to a new Supabase instance.

### 11.1: Understanding the Schema

The platform uses Prisma ORM with PostgreSQL. The database has 14 tables:

| Table | Purpose |
|-------|---------|
| `User` | Admin accounts with 2FA support |
| `Account` | OAuth provider accounts |
| `Session` | Active login sessions |
| `VerificationToken` | Email verification tokens |
| `AuditLogEntry` | Security/admin audit trail |
| `Post` | Blog posts |
| `Category` | Post/video categories |
| `Comment` | Post comments |
| `NewsletterSubscriber` | Newsletter subscribers |
| `NewsletterCampaign` | Newsletter campaigns |
| `NewsletterDelivery` | Per-subscriber send records |
| `ContactRequest` | Contact form submissions |
| `Book` | Published books, reads, ebooks |
| `Video` | Video articles |
| `SocialLink` | Social media links |
| `Quote` | Quote library |
| `RateLimitEntry` | API rate limiting |

### 11.2: Option A - Fresh Start (No Data to Migrate)

If you have no data to migrate (new deployment):

```bash
# 1. Install dependencies
npm install

# 2. Set up your new Supabase project (see Section 4.2)

# 3. Update .env files with new Supabase credentials
# Edit apps/site/.env and apps/admin/.env

# 4. Run migrations
npm run db:migrate

# 5. Seed initial data (admin user, categories, etc.)
npm run db:seed

# 6. Verify
npm run db:generate
```

### 11.3: Option B - Migrate Existing Data

If you have data in another PostgreSQL database (e.g., local dev, old Supabase, Neon):

#### Step 1: Dump the Old Database

```bash
# Using pg_dump (replace with your actual credentials)
pg_dump -h [OLD_HOST] -U [OLD_USER] -d [OLD_DB] \
  --no-owner --no-acl \
  -f old_database_dump.sql

# Or for Supabase specifically:
pg_dump "postgresql://postgres.[OLD_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  --no-owner --no-acl \
  -f old_database_dump.sql
```

#### Step 2: Clean Up the Dump

Open `old_database_dump.sql` and remove:
- Schema creation lines (Prisma manages the schema)
- `SET` statements at the top
- Ownership commands

Keep only:
- `INSERT INTO` statements
- `COPY` commands (data only)

#### Step 3: Set Up the New Supabase Project

1. Create new Supabase project (see Section 4.2)
2. Run Prisma migrations first (creates the schema):

```bash
# Update .env with new Supabase credentials, then:
npm install
npm run db:migrate
npm run db:generate
```

#### Step 4: Import Data

**Method 1: Using Supabase SQL Editor (recommended)**

1. Go to Supabase dashboard -> **SQL Editor**
2. Open your `old_database_dump.sql`
3. Paste the INSERT statements
4. Click **Run**

**Method 2: Using psql directly**

```bash
psql "postgresql://postgres.[NEW_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  -f old_database_dump.sql
```

**Method 3: Table-by-table export/import**

```bash
# Export each table from old database
pg_dump -h [OLD_HOST] -U [OLD_USER] -d [OLD_DB] \
  -t "User" -t "Post" -t "Category" \
  --data-only \
  -f data_only.sql

# Import into new database
psql "postgresql://postgres.[NEW_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  -f data_only.sql
```

#### Step 5: Handle ID Conflicts

If migrating between Prisma databases, watch out for:
- `cuid()` IDs may collide
- Unique constraints on `email`, `slug`, etc.

**Solution:** Clear existing data first, or use `ON CONFLICT DO NOTHING`:

```sql
-- Example: skip duplicates
INSERT INTO "Post" (...) VALUES (...) ON CONFLICT DO NOTHING;
```

#### Step 6: Verify Migration

```bash
# Count rows in each table
psql "postgresql://postgres.[NEW_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  -c "SELECT schemaname, relname, n_live_tup 
      FROM pg_stat_user_tables 
      ORDER BY n_live_tup DESC;"

# Check referential integrity
psql "postgresql://postgres.[NEW_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  -c "SELECT conname, conrelid::regclass, confrelid::regclass 
      FROM pg_constraint 
      WHERE contype = 'f';"
```

### 11.4: Option C - Migrate Storage Buckets

If you have files in Supabase Storage:

```bash
# List buckets
supabase storage list

# Download all files from a bucket
supabase storage download media ./media-backup/

# Upload to new project
supabase storage create media --project [NEW_PROJECT_REF]
supabase storage upload media ./media-backup/ --project [NEW_PROJECT_REF]
```

Or use the Supabase dashboard:
1. Old project -> **Storage** -> select bucket -> **Download** all files
2. New project -> **Storage** -> create same bucket -> **Upload** all files

### 11.5: Update Connection Strings

After migration, update your `.env` files:

```env
# Old
DATABASE_URL="postgresql://postgres.oldref:password@aws-0-old-region.pooler.supabase.com:6543/postgres"

# New
DATABASE_URL="postgresql://postgres.newref:password@aws-0-new-region.pooler.supabase.com:6543/postgres"
```

Then update Vercel environment variables:
1. Go to Vercel -> **Settings -> Environment Variables**
2. Update `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy both apps

### 11.6: Migration Checklist

- [ ] New Supabase project created
- [ ] `npm run db:migrate` succeeds
- [ ] `npm run db:seed` succeeds (if fresh start)
- [ ] All data imported (if migrating data)
- [ ] Row counts match old database
- [ ] Storage buckets recreated
- [ ] Files uploaded to storage
- [ ] `.env` files updated with new credentials
- [ ] Vercel env vars updated
- [ ] Both apps redeployed
- [ ] Admin login works
- [ ] Blog posts display correctly
- [ ] Images load from storage
- [ ] Newsletter subscribers intact
- [ ] Contact form submissions present

---

## 12. Post-Deployment Checklist

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

## 13. Strengths, Weaknesses and Failure Modes

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

## 14. Long-Term Viability

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

## 15. Troubleshooting

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

### "Migration failed"
1. Check if DIRECT_URL is used (not DATABASE_URL) for `prisma migrate`
2. Check if the old database dump has conflicting data
3. Try `prisma db push` instead of `prisma migrate deploy` for quick sync
4. Check Supabase logs for constraint violations

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

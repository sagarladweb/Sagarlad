# Complete Step-by-Step 2-Phase Deployment & Handover Guide

Welcome! This simple, step-by-step guide will walk you through setting up, deploying, and managing the **Sagar Lad Website & Admin Platform**.

Even if you have zero coding experience, you can follow these exact steps to launch the platform in 2 phases using 100% free-tier services (**Vercel, Supabase, Brevo, Google Analytics**).

---

## 1. How the Platform Is Split (Two Apps, One Database)

The platform consists of **two separate applications living in ONE code repository**. Each app is deployed independently on Vercel, ensuring maximum performance:

| App | Folder in Repository | Public URL / Domain | Who Uses It |
| :--- | :--- | :--- | :--- |
| **Public Website** | `apps/site` | `https://sagarlad.com` | Everyone (Home, About, Books, Blogs, Videos, Speaking, Contact) |
| **Admin Panel** | `apps/admin` | `https://admin.sagarlad.com` | Sagar / Admins (2FA Login, Blog Writer, Books, Videos, Newsletter, Socials) |

- Both apps talk to the **same Supabase database**. Any content created in the Admin Panel appears on the public website instantly.
- The public site stays lightning-fast because zero admin or editor code is downloaded by visitors.

---

## 2. The 2-Phase Deployment Strategy

The platform is designed for a seamless **2-Phase rollout**, controlled by one setting (`ADMIN_PHASE`) inside the Vercel project for `apps/admin`:

### Phase 1: Blog Authoring & Public Site Release (Initial Launch)
- **Public Website (`sagarlad.com`)**: Live in full with all pages (Home, About Me, Books, Blog articles, Videos, Public Speaking, and Contact).
- **Admin Panel (`admin.sagarlad.com`)**: Live with secure 2FA login, giving direct access to create, edit, draft, and live-preview blog posts. Non-blog sections are cleanly hidden.
- **Environment Setting**: `ADMIN_PHASE="1"` in the `apps/admin` Vercel project.

### Phase 2: Full Admin Panel Unlock (Complete Control)
- **What Unlocks**: The entire admin platform unlocks: Dashboard analytics, Books manager, Video manager, Social links 3x4 manager, Newsletter composer & queue, Comment moderation, Security settings, and Sandbox.
- **How to Switch**: Simply change `ADMIN_PHASE` from `"1"` to `"2"` in Vercel environment variables and click **Redeploy** on the Admin project.
- **Zero Downtime & Zero Data Loss**: All existing blogs, images, comments, and database records remain 100% untouched.

---

## 3. Local Development Servers

To run both applications locally on your machine at the same time:

- **Public Website**: Runs permanently on **`http://localhost:3000`**
  ```bash
  npm run dev:site
  ```
- **Admin Panel**: Runs permanently on **`http://localhost:3001`**
  ```bash
  npm run dev:admin
  ```

---

## 4. Step-by-Step Deployment Instructions

### Step 1: Create Your Free Accounts
1. **GitHub** ([github.com](https://github.com)): To host your private code repository.
2. **Vercel** ([vercel.com](https://vercel.com)): To host both `apps/site` and `apps/admin` for free.
3. **Supabase** ([supabase.com](https://supabase.com)): Free PostgreSQL database & image storage.
4. **Brevo** ([brevo.com](https://brevo.com)): Free email service for newsletters and contact forms (300 emails/day).
5. **Google Analytics** ([analytics.google.com](https://analytics.google.com)): To track visitor analytics.

---

### Step 2: Set Up Supabase Database & Storage
1. Log in to [Supabase](https://supabase.com) and click **New Project** (e.g. `sagarlad-prod`).
2. Under **Project Settings -> Database**:
   - Copy **Transaction Pooler URL (port 6543)**. This is your `DATABASE_URL`.
   - Copy **Direct Connection URL (port 5432)**. This is your `DIRECT_URL`.
3. Under **Project Settings -> API**:
   - Copy **Project URL**. This is your `SUPABASE_URL`.
   - Copy `service_role` secret (reveal key). This is your `SUPABASE_SERVICE_ROLE_KEY`.
4. Initialize database schema & seed initial content in terminal:
   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   ```

#### 💡 Automated Keep-Alive Solution (Never-Pause Free Tier)
Supabase free tier automatically pauses projects after 7 days of zero database activity. To make sure your client's database stays active 24/7/365 forever without any manual action:
- **Built-in Vercel Cron**: Both `apps/site` and `apps/admin` include pre-configured `vercel.json` files that automatically trigger `/api/cron/keepalive` every single day at 00:00 UTC.
- **GitHub Action Backup**: A GitHub Action workflow (`.github/workflows/supabase-keepalive.yml`) runs every 3 days to ping the database automatically.
- **Result**: Zero maintenance, zero pause risk — set it up once during client deployment, and it runs forever automatically!

---

### Step 3: Set Up Brevo Email Service
1. Log in to [Brevo](https://brevo.com).
2. Go to **SMTP & API** -> **API Keys** -> click **Generate a new API key** (starts with `xkeysib-...`). This is your `BREVO_API_KEY`.
3. Verify your domain `sagarlad.com` under **Senders & IP -> Domains** for inbox delivery.

---

### Step 4: Set Up Google Analytics
1. Log in to [Google Analytics](https://analytics.google.com).
2. Create a Property for `sagarlad.com`.
3. Copy your **Measurement ID** (`G-XXXXXXXXXX`). This is your `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
4. Go to **Admin -> Property -> Property details** and copy the numeric **Property ID**. This is your `GA_PROPERTY_ID`.
5. For the admin analytics dashboard you also need a **service account JSON key** (see Appendix A5 below).

---

### Step 5: Push Code to GitHub
1. Create a private repository on GitHub named `sagarlad-platform`.
2. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/sagarlad-platform.git
   git add .
   git commit -m "Initial website and admin monorepo"
   git push -u origin main
   ```

---

### Step 6: Deploy Both Projects on Vercel

Each app is deployed as a separate Vercel project from the single code repository:

#### 6A. Deploy Public Website (`apps/site`)
1. In Vercel, click **Add New -> Project** and import your `sagarlad-platform` repository.
2. Under **Framework Preset**, keep **Next.js**.
3. Under **Root Directory**, click **Edit** and set it to: **`apps/site`**.
4. Add environment variables for `apps/site` (see checklist below).
5. Click **Deploy**. (Vercel automatically detects `vercel.json` and activates the daily Supabase keep-alive cron `/api/cron/keepalive`).
6. Connect custom domain `sagarlad.com` under **Project Settings -> Domains**.

#### 6B. Deploy Admin Panel (`apps/admin`)
1. In Vercel, click **Add New -> Project** again and import the **same repository**.
2. Under **Framework Preset**, keep **Next.js**.
3. Under **Root Directory**, click **Edit** and set it to: **`apps/admin`**.
4. Add environment variables for `apps/admin` (see checklist below). Set `ADMIN_PHASE="1"`.
5. Click **Deploy**. (Vercel automatically handles Prisma client generation and activates Vercel Crons).
6. Connect custom domain `admin.sagarlad.com` under **Project Settings -> Domains**.

---

### Step 7: Environment Variables Checklist

Set these in **Vercel -> Project -> Settings -> Environment Variables** (separately for the site and admin projects). All are already present in the repo as `apps/site/.env.example` and `apps/admin/.env.example`.

#### Shared (Both Projects)
| Variable | What it is / Where to get it |
| :--- | :--- |
| `DATABASE_URL` | Supabase Transaction Pooler URL (port 6543) |
| `AUTH_SECRET` | Random string, same in both apps (generate: `openssl rand -base64 32`) |
| `SUPABASE_URL` | Supabase Project URL (Settings -> API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` secret (Settings -> API) |
| `BREVO_API_KEY` | Brevo key (`xkeysib-...`, SMTP & API -> API Keys) |
| `BREVO_FROM_EMAIL` | A verified Brevo sender, e.g. `hello@sagarlad.com` |
| `BREVO_FROM_NAME` | Sender name, e.g. `Sagar Lad` |
| `CRON_SECRET` | Random string (generate: `openssl rand -hex 32`). Used to protect the newsletter auto-send endpoint |
| `DATABASE_POOL_MAX` | `5` |

> `DIRECT_URL` is only needed for running migrations locally, not on Vercel. `SUPABASE_ANON_KEY` and `ADMIN_EMAIL`/`ADMIN_PASSWORD` are only used by the local seed script.

#### Public Website Only (`apps/site`)
| Variable | What it is |
| :--- | :--- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID (`G-XXXXXXXXXX`) |
| `DAILY_EMAIL_LIMIT` | `300` (Brevo free daily cap) |
| `NEWSLETTER_BATCH_SIZE` | `20` (emails per send run) |
| `NEWSLETTER_CRON` | Schedule for the cron (any value, e.g. `30 4 * * *`) |

#### Admin Panel Only (`apps/admin`)
| Variable | What it is |
| :--- | :--- |
| `GA_PROPERTY_ID` | GA4 numeric Property ID |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON from the Google service account key (see Appendix A5) |
| `ADMIN_PHASE` | `"1"` (Phase 1) or `"2"` (Phase 2) |

---

## 5. How to Transition from Phase 1 to Phase 2

When you are ready to unlock Phase 2 (Full Admin Panel):

1. Log in to [Vercel](https://vercel.com).
2. Open the **`apps/admin` project** (Admin Panel).
3. Go to **Settings -> Environment Variables**.
4. Edit `ADMIN_PHASE` and change its value from `"1"` to `"2"`.
5. Go to **Deployments** -> click **Redeploy**.

**Result**: The complete Admin Panel (Dashboard, Books, Videos, Social Links, Newsletter, Comments, Security, Sandbox) is instantly active! Zero data is changed or lost.













// strictly follow after this //
## Do't remove this ## 

---

## 1. What is `ADMIN_PHASE` & How to Change It ("1" to "2")

`ADMIN_PHASE` is a single variable you set inside Vercel that controls what features appear in your Admin Panel.

### What happens in each Phase:
- **When set to `1` (Phase 1 - Initial Launch)**:
  - When Sagar logs into `https://admin.sagarlad.com`, the sidebar shows **Blog Writing, Editing, Drafting, and Live Previewing**, plus **Settings** (profile name, password and sign-in email always work in every phase).
  - All other admin sections (Books, Videos, Newsletter, Dashboard Analytics) are cleanly hidden.
 - **When changed to `2` (Phase 2 - Full Unlock)**:
  - All admin sections automatically unlock: Dashboard Analytics, Books Manager, Videos Manager, Social Links 3x4 Grid, Newsletter Composer & Queue, and Comment Moderation.
  - **Zero data is lost.** All your blogs, photos, and settings remain 100% intact.

---

### Step-by-Step: How to Change `ADMIN_PHASE` on Vercel (Button by Button)

1. Log in to [Vercel](https://vercel.com).
2. Click on your **Admin Project** (the project rooted at `apps/admin`).
3. Click **Settings** (top menu bar).
4. Click **Environment Variables** (left sidebar).
5. Scroll down to find `ADMIN_PHASE`:
   - Click the **3 dots `...`** on the right side of `ADMIN_PHASE` and click **Edit**.
   - Change the value from `1` to `2`.
   - Click **Save**.
6. Click **Deployments** (top menu bar).
7. Click the **3 dots `...`** next to your latest deployment and click **Redeploy**.

*Done! Your Admin Panel instantly updates to Phase 2 with full access.*

---

## 2. Step-by-Step BigRock DNS Setup (Domain + Subdomain)

Since your domain is purchased on **BigRock**, follow these exact steps to connect your main domain (`sagarlad.com`) and admin subdomain (`admin.sagarlad.com`) to Vercel:

### Step 1: Open DNS Management in BigRock
1. Log in to your [BigRock Control Panel](https://www.bigrock.in).
2. Click **Manage Orders** -> **List/Search Orders**.
3. Click on your domain name (e.g. `sagarlad.com`).
4. Scroll down to the **DNS Management** section and click **Manage DNS**.

---

### Step 2: Add DNS Records in BigRock

You will add **3 records** inside BigRock DNS Manager:

#### Record 1: Main Domain (`sagarlad.com`)
- Click **Add A Record**.
- **Host Name**: `@` *(or leave blank if BigRock leaves it empty)*
- **IP Address / Points to**: `76.76.21.21`
- Click **Add Record**.

#### Record 2: `www` Subdomain (`www.sagarlad.com`)
- Click **Add CNAME Record**.
- **Host Name**: `www`
- **Value / Points to**: `cname.vercel-dns.com`
- Click **Add Record**.

#### Record 3: Admin Subdomain (`admin.sagarlad.com`)
- Click **Add CNAME Record**.
- **Host Name**: `admin`
- **Value / Points to**: `cname.vercel-dns.com`
- Click **Add Record**.

---

### Step 3: Connect Domains on Vercel

1. In your **Public Site Vercel Project** (`apps/site`):
   - Go to **Settings -> Domains**.
   - Type `sagarlad.com` and click **Add**.
2. In your **Admin Vercel Project** (`apps/admin`):
   - Go to **Settings -> Domains**.
   - Type `admin.sagarlad.com` and click **Add**.

---

### What to Expect Next:
- BigRock DNS updates usually take **10 to 30 minutes**.
- Vercel will automatically generate **free SSL certificates** (`https://`) for both `sagarlad.com` and `admin.sagarlad.com`.
- Your public website will be live at `https://sagarlad.com` and your admin panel at `https://admin.sagarlad.com`!

---

## Appendix A: Full Credentials List & Step-by-Step How to Get Each

This is the complete list of every credential the platform needs. Use the tables to check what you already have, then follow the numbered steps for anything missing.

### A0. The Complete Checklist

| # | Credential | Where to put it | Needed? | How to get it |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `DATABASE_URL` | Vercel (both apps) | Required | Supabase, A2 |
| 2 | `DIRECT_URL` | Local only (migrations) | Optional | Supabase, A2 |
| 3 | `AUTH_SECRET` | Vercel (both apps) | Required | Generate, A6 |
| 4 | `SUPABASE_URL` | Vercel (both apps) | Required | Supabase, A2 |
| 5 | `SUPABASE_SERVICE_ROLE_KEY` | Vercel (both apps) | Required | Supabase, A2 |
| 6 | `SUPABASE_ANON_KEY` | Not used at runtime | Optional | Supabase, A2 |
| 7 | `BREVO_API_KEY` | Vercel (both apps) | Required | Brevo, A4 |
| 8 | `BREVO_FROM_EMAIL` | Vercel (both apps) | Required | Brevo, A4 |
| 9 | `BREVO_FROM_NAME` | Vercel (both apps) | Required | Your choice |
| 10 | `CRON_SECRET` | Vercel (both apps) + GitHub | Required | Generate, A6 |
| 11 | `DATABASE_POOL_MAX` | Vercel (both apps) | Optional | `5` |
| 12 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Vercel (site) | Required | GA4, A5 |
| 13 | `GA_PROPERTY_ID` | Vercel (admin) | Required | GA4, A5 |
| 14 | `GOOGLE_SERVICE_ACCOUNT_JSON` | Vercel (admin) | Required | Cloud Console, A5 |
| 15 | `ADMIN_PHASE` | Vercel (admin) | Required | `"1"` or `"2"` |
| 16 | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Local seed only | Optional | Your choice, A3 |
| 17 | `NEWSLETTER_PROCESS_URL` | GitHub repo secret | Required | `https://sagarlad.com/api/newsletter/process` |
| 18 | `NEWSLETTER_CRON_SECRET` | GitHub repo secret | Required | Same value as `CRON_SECRET` |

---

### A1. GitHub Repo Secrets (for the automatic newsletter sender)

The newsletter queue is drained every 30 minutes by a free GitHub Action. It needs 2 repo secrets. If these are missing the emails simply never go out.

1. Go to your repository on GitHub.
2. Click **Settings** -> **Secrets and variables** -> **Actions**.
3. Click **New repository secret** and add:
   - Name: `NEWSLETTER_PROCESS_URL` — Value: `https://sagarlad.com/api/newsletter/process`
   - Name: `NEWSLETTER_CRON_SECRET` — Value: the same random string you use for `CRON_SECRET`
4. (Optional, for the older daily workflow) Name: `CRON_SECRET` — same value again.

> Verify with the Actions tab: the **Newsletter queue drain** workflow should run and succeed.

---

### A2. Supabase (Database + Storage)

1. Log in at [supabase.com](https://supabase.com) and create a project.
2. Go to **Project Settings -> Database -> Connection string**:
   - **Transaction Pooler (port 6543)** -> `DATABASE_URL`
   - **Direct Connection (port 5432)** -> `DIRECT_URL` (local migrations only)
3. Go to **Project Settings -> API**:
   - **Project URL** -> `SUPABASE_URL`
   - **`service_role` secret** (click reveal) -> `SUPABASE_SERVICE_ROLE_KEY`
   - **`anon` public key** -> `SUPABASE_ANON_KEY` (optional, not required at runtime)

---

### A3. Admin Login (Seeded Admin Account)

1. Choose an email and password (min 8 characters).
2. They are set as `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` and used by:
   - the local seed script (`npm run db:seed`), and
   - a **bootstrap fallback** in the admin login: on the very first login, if the
     admin account has no password set in the database yet, the panel
     auto-creates it from these env vars.
3. On Vercel you do **not** need `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the account
   already exists in the database after seeding. Once a password exists in the
   database, the database is authoritative: changing the password in the admin
   panel (Profile page) **sticks** and env vars no longer override it.

---

### A4. Brevo (Newsletter Email Sending)

1. Sign up at [brevo.com](https://brevo.com) (free plan: 300 emails/day).
2. **SMTP & API -> API Keys -> Generate a new API key**. Copy it (starts with `xkeysib-`). This is `BREVO_API_KEY`.
3. **Senders & IP -> Domains -> Add a domain** and add `sagarlad.com`. Then add the 3 DNS records Brevo shows you in **BigRock DNS Management** (CNAME + 2 TXT records) and click **Verify**. This must succeed or your emails land in spam or get rejected.
4. **Senders & IP -> Senders -> Add a sender** with the email you want to send from (e.g. `hello@sagarlad.com`). This is `BREVO_FROM_EMAIL`. `BREVO_FROM_NAME` is the display name (`Sagar Lad`).

---

### A5. Google Analytics (Site Tracking + Admin Dashboard)

You need 3 values: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GA_PROPERTY_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`.

1. Log in at [analytics.google.com](https://analytics.google.com), create a property, add a web data stream for `sagarlad.com`.
2. Copy the **Measurement ID** (`G-XXXXXXXXXX`) -> `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
3. **Admin -> Property -> Property details** -> copy the numeric **Property ID** -> `GA_PROPERTY_ID`.
4. Get the service account JSON:
   1. Go to [console.cloud.google.com](https://console.cloud.google.com) and open the project for your GA account.
   2. **APIs & Services -> Enable APIs -> search "Google Analytics Data API" -> Enable**.
   3. **APIs & Services -> Credentials -> Create Credentials -> Service Account**.
   4. Give it a name, then click the created service account -> **Keys -> Add Key -> Create new key -> JSON** -> download the file.
   5. Open the downloaded JSON file, copy its **entire content**, and paste it as `GOOGLE_SERVICE_ACCOUNT_JSON` (it is one long JSON object with quotes — paste exactly).
5. Add the service account email to your GA4 property as a viewer:
   - In GA4 **Admin -> Property access management -> Add users** -> paste the service account email (ends in `@...iam.gserviceaccount.com`) -> role **Viewer**.

---

### A6. Generated Secrets (No Account Needed)

Generate these once on your computer (macOS/Linux terminal) and reuse the same value across apps:

```bash
# For AUTH_SECRET
openssl rand -base64 32

# For CRON_SECRET
openssl rand -hex 32
```

`CRON_SECRET` must be the **same value** in 3 places: site Vercel env, admin Vercel env, and the GitHub secret `NEWSLETTER_CRON_SECRET`.

---

### A7. Where Everything Lives

| Where | What goes there |
| :--- | :--- |
| Vercel project `apps/site` | All shared vars + `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `DAILY_EMAIL_LIMIT`, `NEWSLETTER_BATCH_SIZE`, `NEWSLETTER_CRON`, `CRON_SECRET` |
| Vercel project `apps/admin` | All shared vars + `GA_PROPERTY_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `ADMIN_PHASE`, `CRON_SECRET` |
| GitHub repo secrets | `NEWSLETTER_PROCESS_URL`, `NEWSLETTER_CRON_SECRET`, `CRON_SECRET` |
| Local `.env` files only | `DIRECT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SUPABASE_ANON_KEY` |

> Missing any credential? Run the checklist against the A0 table — every credential maps to one of the steps above (A1-A6).
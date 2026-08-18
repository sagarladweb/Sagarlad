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

---

### Step 3: Set Up Brevo Email Service
1. Log in to [Brevo](https://brevo.com).
2. Go to **SMTP & API** -> **API Keys** -> click **Generate a new API key** (starts with `xkeysib-...`). This is your `BREVO_API_KEY`.
3. Verify your domain `sagarlad.com` under **Senders & IP -> Domains** for inbox delivery.

---

### Step 4: Set Up Google Analytics
1. Log in to [Google Analytics](https://analytics.google.com).
2. Create a Property for `sagarlad.com` and copy your **Measurement ID** (`G-XXXXXXXXXX`). This is your `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

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

#### 6A. Deploy Public Website (`apps/site`)
1. In Vercel, click **Add New -> Project** and select your `sagarlad-platform` repository.
2. Set **Root Directory** to: **`apps/site`**.
3. Add environment variables for `apps/site` (see table below).
4. Click **Deploy**. (Connect custom domain `sagarlad.com` in Project Settings -> Domains).

#### 6B. Deploy Admin Panel (`apps/admin`)
1. In Vercel, click **Add New -> Project** again and select the **same repository**.
2. Set **Root Directory** to: **`apps/admin`**.
3. Add environment variables for `apps/admin` (see table below). Set `ADMIN_PHASE="1"`.
4. Click **Deploy**. (Connect custom domain `admin.sagarlad.com` in Project Settings -> Domains).

---

### Step 7: Environment Variables Checklist

#### Environment Variables for BOTH Projects (Shared Database & Services)
- `DATABASE_URL`: Supabase Transaction Pooler URL (port 6543)
- `DIRECT_URL`: Supabase Direct Connection URL (port 5432)
- `AUTH_SECRET`: Secret random string (same in both apps, e.g. `your-super-secret-key-123456`)
- `SUPABASE_URL`: Supabase Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase `service_role` secret
- `BREVO_API_KEY`: Brevo Key (`xkeysib-...`)
- `BREVO_FROM_EMAIL`: `hello@sagarlad.com`
- `BREVO_FROM_NAME`: `Sagar Lad`
- `DATABASE_POOL_MAX`: `5`

#### Environment Variables for PUBLIC WEBSITE (`apps/site`)
- `AUTH_URL`: `https://sagarlad.com`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: `G-XXXXXXXXXX`
- `DAILY_EMAIL_LIMIT`: `300`
- `NEWSLETTER_BATCH_SIZE`: `20`

#### Environment Variables for ADMIN PANEL (`apps/admin`)
- `AUTH_URL`: `https://admin.sagarlad.com`
- `ADMIN_EMAIL`: `sagarlad692@gmail.com`
- `ADMIN_PASSWORD`: Your chosen admin password
- `ADMIN_PHASE`: `"1"` *(for Phase 1)* or `"2"` *(for Phase 2)*

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
  - When Sagar logs into `https://admin.sagarlad.com`, the sidebar shows **only Blog Writing, Editing, Drafting, and Live Previewing**.
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
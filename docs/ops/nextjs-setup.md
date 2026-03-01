# Pedie Tech — Next.js 16 Production Setup Guide

> **A complete guide to deploying the Pedie Tech store built with Next.js 16, Bun, Supabase, and Vercel — covering every integration from M-Pesa to Google Sheets inventory sync.**

---

## 📋 Table of Contents

- [Quick Overview](#-quick-overview)
- [Prerequisites](#-prerequisites)
- [Step 1: Supabase Project](#step-1-supabase-project)
- [Step 2: Google OAuth (Sign-In with Google)](#step-2-google-oauth-sign-in-with-google)
- [Step 3: Gmail API (Transactional Emails)](#step-3-gmail-api-transactional-emails)
- [Step 4: Supabase SMTP (Auth Emails)](#step-4-supabase-smtp-auth-emails)
- [Step 5: M-Pesa Daraja API](#step-5-m-pesa-daraja-api)
- [Step 6: PayPal](#step-6-paypal)
- [Step 7: Google Sheets Inventory Sync (Apps Script)](#step-7-google-sheets-inventory-sync-apps-script)
- [Step 8: On-Demand Revalidation](#step-8-on-demand-revalidation)
- [Step 9: Vercel Deployment](#step-9-vercel-deployment)
- [Step 10: Cloudflare Domain & DNS](#step-10-cloudflare-domain--dns)
- [Step 11: Docker / VPS Deployment (Alternative)](#step-11-docker--vps-deployment-alternative)
- [Step 12: CI/CD Pipeline](#step-12-cicd-pipeline)
- [Step 13: Security Hardening](#step-13-security-hardening)
- [Step 14: Monitoring & Maintenance](#step-14-monitoring--maintenance)
- [Environment Variables Reference](#-environment-variables-reference)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Quick Overview

| Component           | Details                                        |
| ------------------- | ---------------------------------------------- |
| **Framework**       | Next.js 16 (App Router, React 19)              |
| **Runtime**         | Bun 1.3+                                       |
| **Database**        | Supabase (PostgreSQL + Auth + Storage)          |
| **Hosting**         | Vercel (primary) / Docker on VPS (alternative)  |
| **Payments**        | M-Pesa (Daraja API) + PayPal                   |
| **Email**           | Gmail API (transactional) + SMTP (auth emails) |
| **Inventory Sync**  | Google Sheets → Apps Script → Supabase          |
| **CDN / DNS**       | Cloudflare                                     |
| **CI/CD**           | GitHub Actions (lint, test, Docker, releases)   |
| **Region**          | `jnb1` (Johannesburg, South Africa)            |
| **Image Formats**   | AVIF, WebP (automatic optimization)            |

---

## 📋 Prerequisites

- [Bun](https://bun.sh) 1.3+ installed
- [Git](https://git-scm.com/) installed
- A [Supabase](https://supabase.com) account (free tier is sufficient for launch)
- A [Google Cloud](https://console.cloud.google.com) project (for OAuth, Gmail, Sheets)
- A [Safaricom Developer](https://developer.safaricom.co.ke) account (M-Pesa)
- A [PayPal Developer](https://developer.paypal.com) account
- A [Vercel](https://vercel.com) account (for production hosting)
- A [Cloudflare](https://cloudflare.com) account (for DNS / domain)

### Clone & Install

```bash
git clone https://github.com/iamvikshan/pedie.git
cd pedie
bun install
cp .env.example .env
```

### Available Scripts

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `bun dev`       | Start the development server       |
| `bun build`     | Production build                   |
| `bun start`     | Start the production server        |
| `bun test`      | Run the test suite                 |
| `bun lint`      | Run ESLint                         |
| `bun check`     | Run lint + TypeScript type check   |
| `bun f`         | Format all files with Prettier     |

---

## Step 1: Supabase Project

### Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Choose your organization, name the project (e.g., `pedie-store`), set a database password, and select a region close to Kenya (e.g., `eu-west-1` or `af-south-1` if available).

### Get Credentials

1. **Dashboard → Settings → API**
2. Copy these values into `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key (legacy)>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```
   > **Note:** `@supabase/ssr` uses the **anon key (legacy)** format (`eyJhbG...`), not the newer publishable key (`sb_publishable_...`). Both are available in the dashboard.

### Run Migrations

```bash
# Install Supabase CLI if not already
bun add -g supabase

# Link to your project
supabase link --project-ref <project-ref>

# Apply all migrations
supabase db push
```

### Set Admin User

After signing up with your email, run this SQL in the Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<your-user-id>';
```

Or set it via the Table Editor on the `profiles` table.

### Storage Buckets

Create the following storage buckets in **Dashboard → Storage**:

1. **`product-images`** — public bucket for product photos
2. **`uploads`** — private bucket for admin file uploads

Set RLS policies to allow:
- Public read on `product-images`
- Authenticated admin write on both buckets

---

## Step 2: Google OAuth (Sign-In with Google)

This enables "Continue with Google" on the sign-in/sign-up pages.

### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → select your project (e.g., `pedie-odoo`)
2. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
3. Application type: **Web application**
4. Authorized redirect URIs — add:
   ```
   https://<your-supabase-ref>.supabase.co/auth/v1/callback
   ```
5. Note the **Client ID** and **Client Secret**

### Configure in Supabase

1. **Dashboard → Authentication → Providers → Google**
2. Toggle **Enable**
3. Paste the **Client ID** and **Client Secret**
4. **Authorized Client IDs**: paste the same Client ID
5. Save

> No `.env` changes needed — Supabase handles Google OAuth server-side.

---

## Step 3: Gmail API (Transactional Emails)

Used for sending order confirmations, payment receipts, welcome emails, etc.

### Enable Gmail API

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Library**
2. Search for **Gmail API** → click **Enable**

### Create OAuth2 Credentials (if not reusing Google Sign-In ones)

1. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
2. Application type: **Web application**
3. Authorized redirect URIs — add:
   ```
   https://developers.google.com/oauthplayground
   ```
4. Note the **Client ID** and **Client Secret**

### Get Refresh Token

1. Go to [OAuth Playground](https://developers.google.com/oauthplayground)
2. Click ⚙️ (Settings gear, top right) → check **"Use your own OAuth credentials"**
3. Paste your **Client ID** and **Client Secret**
4. **Step 1**: In the left panel, find **Gmail API v1** → select `https://www.googleapis.com/auth/gmail.send`
5. Click **"Authorize APIs"** → sign in as `pedietech@gmail.com` (or your sender email)
6. **Step 2**: Click **"Exchange authorization code for tokens"**
7. Copy the **Refresh Token** (long string starting with `1//`)

### Set Environment Variables

```
GCP_CLIENT_ID=<client-id>.apps.googleusercontent.com
GCP_CLIENT_SECRET=GOCSPX-<secret>
GMAIL_REFRESH_TOKEN=1//<long-refresh-token>
GMAIL_SENDER_EMAIL=pedietech@gmail.com
```

> **Rate limit:** Gmail API free tier allows ~100 emails/day (~3,000/mo). Sufficient for launch. If you outgrow it, swap to [Resend](https://resend.com) (3,000/mo free) or [Brevo](https://brevo.com) (300/day free) by modifying `src/lib/email/gmail.ts`.

---

## Step 4: Supabase SMTP (Auth Emails)

Supabase sends its own emails for password resets, email confirmations, and magic links. The built-in mailer is **rate-limited to 3 emails/hour** on the free tier. Configure custom SMTP for production:

1. **Dashboard → Project Settings → Authentication → SMTP Settings**
2. Toggle **Enable Custom SMTP**
3. Fill in:
   ```
   Host:        smtp.gmail.com
   Port:        587
   Username:    pedietech@gmail.com
   Password:    <app-password>
   Sender name: Pedie Tech
   Sender email: pedietech@gmail.com
   ```

### Generate App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already)
3. Go to **2-Step Verification → App passwords** (or search "App passwords" in Google Account)
4. Generate one for "Mail" / "Other (Supabase)"
5. Use the 16-character password as the SMTP password above

---

## Step 5: M-Pesa Daraja API

### Sandbox Setup

1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)
2. Create an app → get **Consumer Key** and **Consumer Secret**
3. Use the sandbox shortcode and passkey provided by Safaricom

```
DARAJA_CONSUMER_KEY=<consumer-key>
DARAJA_CONSUMER_SECRET=<consumer-secret>
DARAJA_SHORTCODE=<sandbox-shortcode>
DARAJA_PASSKEY=<sandbox-passkey>
DARAJA_CALLBACK_URL=https://<your-domain>/api/payments/mpesa/callback
DARAJA_ENV=sandbox
```

### Production Migration

1. Go Live on the Safaricom developer portal
2. Replace sandbox credentials with production ones
3. Set `DARAJA_ENV=production`
4. Update `DARAJA_CALLBACK_URL` to your production domain

### Security Notes

The M-Pesa callback endpoint (`/api/payments/mpesa/callback`) includes:
- **IP allowlisting** — only Safaricom IPs (`196.201.214.*`, `196.201.213.*`) are accepted
- **Callback secret** validation via `x-callback-secret` header
- **Idempotent processing** — duplicate callbacks are safely ignored
- **Fire-and-forget email** notifications on successful payments

---

## Step 6: PayPal

### Sandbox Setup

1. Go to [developer.paypal.com](https://developer.paypal.com/) → **Dashboard → My Apps & Credentials**
2. Create a **Sandbox** app → get **Client ID** and **Secret**

```
PAYPAL_CLIENT_ID=<sandbox-client-id>
PAYPAL_CLIENT_SECRET=<sandbox-client-secret>
PAYPAL_ENV=sandbox
```

### Production Migration

1. Switch to **Live** tab in PayPal Developer Dashboard
2. Create a Live app → get production **Client ID** and **Secret**
3. Set `PAYPAL_ENV=production`

---

## Step 7: Google Sheets Inventory Sync (Apps Script)

The inventory sync uses **Google Apps Script** instead of GitHub Actions, providing **immediate** cache revalidation whenever a cell is edited in the inventory spreadsheet — no polling, no cron delay.

### Service Account Setup

1. [Google Cloud Console](https://console.cloud.google.com/) → **IAM & Admin → Service Accounts**
2. Create a service account (e.g., `sheets-sync@pedie-odoo.iam.gserviceaccount.com`)
3. Download the JSON key file

#### Base64 Encode the Key

```bash
# Linux
base64 -w 0 service-account.json

# macOS
base64 -i service-account.json | tr -d '\n'
```

#### Share the Spreadsheet

1. Open your Google Sheets spreadsheet
2. Click **Share** → add the service account email as **Editor**

```
GCP_SERVICE_ACC=<base64-encoded-json>
GS_SPREADSHEET_ID=<spreadsheet-id-from-url>
```

> **Note:** The sheet tab name is configured in `src/config/index.ts` (`SHEETS_TAB_NAME`), not as an env var.

### Install the Apps Script

The Apps Script code lives at `scripts/gAppS/sheetsSync.gs` in this repo.

1. Open your inventory spreadsheet in Google Sheets
2. Go to **Extensions → Apps Script**
3. Replace the default `Code.gs` with the contents of `scripts/gAppS/sheetsSync.gs`
4. Set **Script Properties** (Project Settings → Script Properties):

   | Property              | Value                                           |
   | --------------------- | ----------------------------------------------- |
   | `SITE_URL`            | `https://pedie.tech` (no trailing /)             |
   | `REVALIDATION_SECRET` | Same as your `REVALIDATION_SECRET`               |
   | `SYNC_API_KEY`        | Same as your `SYNC_API_KEY`                      |
   | `SHEET_TAB_NAME`      | Inventory tab name (default: `inv`)              |

5. Save and run `testRevalidation()` once to authorize the script
6. Add a trigger:
   - Click the **Triggers** icon (clock) → **Add Trigger**
   - Function: `onSheetEdit`
   - Event type: **On edit**
   - Source: **From spreadsheet**

### How It Works

```
    ┌─────────────────┐      onEdit()       ┌──────────────────┐
    │  Google Sheets   │ ──────────────────→ │  Apps Script     │
    │  (Inventory tab) │   (debounced 30s)   │  sheets-sync.gs  │
    └─────────────────┘                      └──────┬───────────┘
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼                               ▼
                          POST /api/sync              POST /api/revalidate
                          (push data to               (bust ISR cache)
                           Supabase)
                                    │                               │
                                    ▼                               ▼
                            ┌──────────────┐              ┌──────────────┐
                            │   Supabase   │              │  Next.js ISR │
                            │   Database   │              │    Cache     │
                            └──────────────┘              └──────────────┘
```

- Edits are **debounced** — rapid edits within 30 seconds trigger only one sync
- The sync pushes spreadsheet data to Supabase, then revalidates the ISR cache
- Changes appear on the live site within **seconds**, not minutes

---

## Step 8: On-Demand Revalidation

The store uses **ISR (Incremental Static Regeneration)** for product/collection pages. The `/api/revalidate` endpoint triggers on-demand cache purging:

### API Endpoint

```
POST /api/revalidate
Headers:
  x-revalidation-secret: <REVALIDATION_SECRET>
Body (JSON):
  { "tag": "products" }           — revalidate by cache tag
  { "path": "/", "type": "layout" }  — revalidate by path
```

### Environment Variable

```
REVALIDATION_SECRET=<generate-a-secure-random-string>
```

Generate with:
```bash
openssl rand -base64 32
```

### Usage

The revalidation endpoint is called by:
1. **Apps Script** — after inventory edits in Google Sheets
2. **Admin panel** — after product CRUD operations
3. **Webhooks** — from external systems if needed

---

## Step 9: Vercel Deployment

Vercel is the primary deployment target.

### Import Project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the `iamvikshan/pedie` repository
3. Framework: **Next.js** (auto-detected)
4. Build command: `bun run build`
5. Install command: `bun install`

### Environment Variables

Go to **Project Settings → Environment Variables** and add all variables from the [Environment Variables Reference](#-environment-variables-reference) section below.

> **Tip:** You can paste the entire `.env` file contents — Vercel will parse it automatically.

### Region Configuration

The project is configured to deploy to **Johannesburg (`jnb1`)** via `vercel.json` for lowest latency to Kenya:

```json
{
  "regions": ["jnb1"]
}
```

### Security Headers

`vercel.json` also configures production security headers:

| Header                  | Value                                |
| ----------------------- | ------------------------------------ |
| `X-Content-Type-Options`| `nosniff`                            |
| `X-Frame-Options`       | `DENY`                               |
| `Referrer-Policy`       | `strict-origin-when-cross-origin`    |
| API `Cache-Control`     | `no-store`                           |

### Image Optimization

The `next.config.ts` is tuned for e-commerce:
- **Formats:** AVIF → WebP (automatic negotiation)
- **Device sizes:** 640, 750, 828, 1080, 1200
- **Image sizes:** 16, 32, 48, 64, 96, 128, 256
- **Remote patterns:** Supabase Storage public URLs

### Post-Deployment Verification

```bash
# Check the site is live
curl -I https://pedie.tech

# Verify security headers
curl -sI https://pedie.tech | grep -i "x-content-type\|x-frame\|referrer"

# Test revalidation endpoint
curl -X POST https://pedie.tech/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidation-secret: $REVALIDATION_SECRET" \
  -d '{"path": "/", "type": "layout"}'
```

---

## Step 10: Cloudflare Domain & DNS

### Add Domain to Cloudflare

1. Add `pedie.tech` to Cloudflare
2. Update nameservers at your registrar to Cloudflare's

### DNS Records

| Type  | Name | Content                   | Proxy |
| ----- | ---- | ------------------------- | ----- |
| CNAME | `@`  | `cname.vercel-dns.com`    | ✅    |
| CNAME | `www`| `cname.vercel-dns.com`    | ✅    |

### Vercel Domain Configuration

1. In Vercel: **Settings → Domains → Add**
2. Add `pedie.tech` and `www.pedie.tech`
3. Set `www.pedie.tech` to redirect to `pedie.tech`

### Cloudflare SSL/TLS

- SSL mode: **Full (strict)**
- Always Use HTTPS: **On**
- Minimum TLS Version: **1.2**
- Automatic HTTPS Rewrites: **On**

### Cloudflare Performance

- Auto Minify: **JavaScript, CSS, HTML** (all on)
- Brotli: **On**
- Early Hints: **On**
- HTTP/2: **On** (default)

---

## Step 11: Docker / VPS Deployment (Alternative)

For self-hosted deployment on a VPS (e.g., for crawlers/workers or if you prefer not to use Vercel).

### Dockerfile

The project includes a multi-stage `Dockerfile` optimized for Bun:

```
Stage 1 (deps):    bun install --frozen-lockfile
Stage 2 (builder): bun run build (standalone output)
Stage 3 (runner):  Minimal alpine image, non-root user, port 3000
```

### Quick Deploy

```bash
# On the VPS
git clone https://github.com/iamvikshan/pedie.git
cd pedie
cp .env.example .env    # fill in production values
bash scripts/deploy.sh
```

The deploy script handles:
- Docker image build
- Container creation with env vars
- Health check verification
- Automatic restart on failure

### Docker Compose (Production)

```yaml
services:
  pedie:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Reverse Proxy (Nginx)

If running behind Nginx on the VPS:

```nginx
server {
    listen 443 ssl http2;
    server_name pedie.tech;

    ssl_certificate     /etc/ssl/certs/pedie.tech.pem;
    ssl_certificate_key /etc/ssl/private/pedie.tech.key;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Cloudflare Tunnel (Alternative to Nginx + SSL)

If you'd rather avoid managing SSL certificates:

1. Install `cloudflared` on the VPS
2. Create a tunnel: `cloudflared tunnel create pedie`
3. Configure the tunnel to point to `http://localhost:3000`

```
CF_TUNNEL=<tunnel-token>
```

---

## Step 12: CI/CD Pipeline

### GitHub Actions Workflows

The repository includes two workflows in `.github/workflows/`:

#### `docker.yml` — Main CI/CD Pipeline

Triggered on push to `main`:

1. **Lint Job**
   - Checkout + setup Bun
   - `bun run check` (ESLint + TypeScript)
   - `bun test` (full test suite)

2. **Release Job** (depends on lint)
   - Runs [semantic-release](https://semantic-release.gitbook.io/) for automated versioning
   - Creates GitHub releases with changelogs

3. **Docker Job** (depends on release)
   - Builds multi-arch Docker image
   - Pushes to GitHub Container Registry (GHCR)

#### `crawler.yml` — Scheduled Product Crawler

- Runs daily at **3:00 AM UTC**
- Executes `bun scripts/crawlers/index.ts`
- Requires `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` secrets

### Required GitHub Secrets

| Secret                          | Description                              |
| ------------------------------- | ---------------------------------------- |
| `SITE_URL`                      | Production URL (e.g., `https://pedie.tech`) |
| `REVALIDATION_SECRET`           | Same as the env var                      |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key                        |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key                |

---

## Step 13: Security Hardening

### Proxy Middleware (`src/proxy.ts`)

Next.js 16 uses `proxy.ts` (instead of `middleware.ts`) for request interception. The project middleware:

- **Supabase SSR session refresh** — keeps auth sessions alive across requests
- **Security headers injection** — adds protective headers on every response:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### File Upload Security (`src/lib/security/magic-bytes.ts`)

Admin file uploads are validated at multiple levels:
1. **MIME type** from `Content-Type` header
2. **Magic bytes** — the first bytes of the file buffer are checked against known signatures (JPEG `FF D8 FF`, PNG `89 50 4E 47`, GIF `47 49 46`, WebP `52 49 46 46`)
3. **File size** — maximum 5 MB

### M-Pesa Callback Security

- Safaricom IP allowlist (`196.201.214.*`, `196.201.213.*`)
- `x-callback-secret` header validation
- Idempotent processing (duplicate callbacks ignored)

### Privacy Policy

A comprehensive privacy policy page is available at `/privacy`, covering:
- Data collection practices
- Usage and sharing policies
- Security measures
- User rights under the Kenya Data Protection Act 2019
- Cookie usage
- Contact information

### Best Practices Checklist

- [ ] All secrets stored in environment variables, never committed
- [ ] `REVALIDATION_SECRET` is a strong random string (≥32 chars)
- [ ] Supabase RLS policies enabled on all tables
- [ ] Google OAuth redirect URIs are exact matches (no wildcards)
- [ ] M-Pesa callback URL uses HTTPS
- [ ] Gmail App Password (not your actual Google password) used for SMTP
- [ ] `.env` is in `.gitignore`

---

## Step 14: Monitoring & Maintenance

### Vercel Dashboard

- **Analytics** — page views, Web Vitals (LCP, CLS, FID)
- **Logs** — serverless function logs, edge function logs
- **Speed Insights** — per-page performance metrics

### Supabase Dashboard

- **Database** — table usage, active connections, query performance
- **Auth** — user sign-ups, active sessions
- **Storage** — bucket sizes, bandwidth usage
- **Edge Functions** — invocation counts, errors

### Automated Monitoring

- GitHub Actions runs the test suite on every push
- Docker image builds are tested before pushing to GHCR
- Crawler runs daily and logs errors to GitHub Actions

### Update Dependencies

```bash
# Check for updates
bun outdated

# Update all dependencies
bun update

# Run checks after updating
bun check && bun test
```

The repo uses [Renovate](https://renovatebot.com/) for automated dependency updates (see `renovate.json`).

---

## 📑 Environment Variables Reference

| Variable | Required | Where to Get |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Settings → API (legacy anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Dashboard → Settings → API |
| `GCP_SERVICE_ACC` | ✅ | Google Cloud → Service Account JSON → base64 |
| `GS_SPREADSHEET_ID` | ✅ | From Google Sheets URL |
| `SYNC_API_KEY` | ✅ | Generate any secure string |
| `REVALIDATION_SECRET` | ✅ | Generate: `openssl rand -base64 32` |
| `DARAJA_CONSUMER_KEY` | ✅ | Safaricom Developer Portal |
| `DARAJA_CONSUMER_SECRET` | ✅ | Safaricom Developer Portal |
| `DARAJA_SHORTCODE` | ✅ | Safaricom Developer Portal |
| `DARAJA_PASSKEY` | ✅ | Safaricom Developer Portal |
| `DARAJA_CALLBACK_URL` | ✅ | Your domain + `/api/payments/mpesa/callback` |
| `DARAJA_ENV` | ✅ | `sandbox` or `production` |
| `MPESA_CALLBACK_SECRET` | ✅ | Generate any secure string |
| `PAYPAL_CLIENT_ID` | ✅ | PayPal Developer Dashboard |
| `PAYPAL_CLIENT_SECRET` | ✅ | PayPal Developer Dashboard |
| `PAYPAL_ENV` | ✅ | `sandbox` or `production` |
| `GCP_CLIENT_ID` | ⚡ | Google Cloud → OAuth2 Credentials |
| `GCP_CLIENT_SECRET` | ⚡ | Google Cloud → OAuth2 Credentials |
| `GMAIL_REFRESH_TOKEN` | ⚡ | OAuth Playground (see Step 3) |
| `GMAIL_SENDER_EMAIL` | ⚡ | Your sender email address |
| `CF_TUNNEL` | 🔧 | Cloudflare Dashboard (for VPS) |

 = Required for core functionality | ⚡ = Required for email features | 🔧 = Required for self-hosted deployment

> **Note:** `GS_SHEET_NAME` has been removed. The sheet tab name is now configured in `src/config/index.ts` as `SHEETS_TAB_NAME`.

---

## 🔧 Troubleshooting

### Common Issues

#### `bun check` fails with TypeScript errors
```bash
# Check if types are out of date
bun install
bun check
```

#### Supabase connection refused
- Verify `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`
- Check if the project is paused in the Supabase dashboard (free-tier projects pause after 7 days of inactivity)
- Ensure the anon key is the **legacy** format (`eyJhbG...`)

#### M-Pesa callback not received
- Ensure `DARAJA_CALLBACK_URL` is publicly accessible (HTTPS)
- Verify your IP is not being blocked by Cloudflare
- Check that `DARAJA_ENV` matches your credentials (sandbox vs production)
- In sandbox, use the Safaricom test phone numbers

#### Gmail API "Token has been revoked"
- Refresh tokens can expire if the Google project is in "Testing" mode
- Go to Google Cloud Console → **OAuth consent screen** → move to **Production** (requires verification)
- Re-generate the refresh token via OAuth Playground

#### Google Sheets sync not triggering
- Verify Apps Script trigger is installed (Extensions → Apps Script → Triggers)
- Check Script Properties are set correctly (`SITE_URL`, `REVALIDATION_SECRET`)
- Run `testRevalidation()` manually from the Apps Script editor to check logs
- Ensure the spreadsheet tab name matches `inv` (configurable via `SHEET_TAB_NAME` Script Property; default configured in `src/config/index.ts`)

#### Images

Images are stored as Supabase Storage public URLs in the `images TEXT[]` column on listings. In the Google Sheet, images are stored as comma-separated URLs in the `images` column. During sync, the comma-separated string is parsed into a `string[]` for the database.

#### DB → Sheets export

Use `POST /api/sync/export` (with `x-api-key` header) to push all listings from the database back to Google Sheets. This is useful for seeding the sheet from existing DB data.

#### Docker build fails
- Ensure `bun.lock` is committed (the Dockerfile uses `--frozen-lockfile`)
- Check that all required env vars are in `.env` before building
- Verify the `standalone` output works: `bun run build && bun .next/standalone/server.js`

#### Vercel deployment fails
- Check the build logs in the Vercel dashboard
- Verify all env vars are set in Project Settings
- Ensure the `jnb1` region is available (check Vercel status page)

### Debug Commands

```bash
# Type check only (no lint)
bunx tsc --noEmit

# Run a specific test file
bun test tests/seo/sitemap.test.ts

# Check env vars are loaded
bun -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Verify the build output
bun run build && ls -la .next/standalone/
```

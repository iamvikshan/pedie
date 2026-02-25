# Pedie Tech — Production Setup Guide

This guide covers all the external service credentials and configurations needed to run the Pedie Tech store.

---

## 1. Supabase Project

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

---

## 2. Google OAuth (Sign-In with Google)

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

## 3. Gmail API (Transactional Emails)

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
GMAIL_CLIENT_ID=<client-id>.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-<secret>
GMAIL_REFRESH_TOKEN=1//<long-refresh-token>
GMAIL_SENDER_EMAIL=pedietech@gmail.com
```

> **Rate limit:** Gmail API free tier allows ~100 emails/day (~3,000/mo). Sufficient for launch. If you outgrow it, swap to [Resend](https://resend.com) (3,000/mo free) or [Brevo](https://brevo.com) (300/day free) by modifying `src/lib/email/gmail.ts`.

---

## 4. Supabase SMTP (Auth Emails)

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

## 5. M-Pesa Daraja API

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

---

## 6. PayPal

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

## 7. Google Sheets (Inventory Sync)

### Service Account
1. [Google Cloud Console](https://console.cloud.google.com/) → **IAM & Admin → Service Accounts**
2. Create a service account (e.g., `sheets-sync@pedie-odoo.iam.gserviceaccount.com`)
3. Download the JSON key file

### Base64 Encode the Key
```bash
# Linux
base64 -w 0 service-account.json

# macOS
base64 -i service-account.json | tr -d '\n'
```

### Share the Spreadsheet
1. Open your Google Sheets spreadsheet
2. Click **Share** → add the service account email as **Editor**

```
GOOGLE_SHEETS_CREDENTIALS_BASE64=<base64-encoded-json>
GOOGLE_SHEETS_SPREADSHEET_ID=<spreadsheet-id-from-url>
GOOGLE_SHEETS_SHEET_NAME=Inventory
```

---

## 8. Deployment (Vercel + Cloudflare)

### Vercel
1. Import the `iamvikshan/pedie` repo on [vercel.com](https://vercel.com)
2. Set all environment variables from `.env` in Project Settings → Environment Variables
3. Framework preset: **Next.js**, Build command: `bun run build`

### Cloudflare (Domain)
1. Add `pedie.tech` to Cloudflare
2. Set DNS: CNAME `@` → `cname.vercel-dns.com`
3. In Vercel: Settings → Domains → add `pedie.tech`

### Docker (GCP VM for crawlers/workers)
```bash
# On the VPS
git clone https://github.com/iamvikshan/pedie
cd pedie
cp .env.example .env  # fill in production values
bash scripts/deploy.sh
```

---

## Environment Variables Checklist

| Variable | Required | Where to Get |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Settings → API (legacy anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Dashboard → Settings → API |
| `GOOGLE_SHEETS_CREDENTIALS_BASE64` | ✅ | Google Cloud → Service Account JSON → base64 |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ✅ | From Google Sheets URL |
| `GOOGLE_SHEETS_SHEET_NAME` | ✅ | Sheet tab name (default: `Inventory`) |
| `SYNC_API_KEY` | ✅ | Generate any secure string |
| `DARAJA_CONSUMER_KEY` | ✅ | Safaricom Developer Portal |
| `DARAJA_CONSUMER_SECRET` | ✅ | Safaricom Developer Portal |
| `DARAJA_SHORTCODE` | ✅ | Safaricom Developer Portal |
| `DARAJA_PASSKEY` | ✅ | Safaricom Developer Portal |
| `DARAJA_CALLBACK_URL` | ✅ | Your domain + `/api/payments/mpesa/callback` |
| `DARAJA_ENV` | ✅ | `sandbox` or `production` |
| `PAYPAL_CLIENT_ID` | ✅ | PayPal Developer Dashboard |
| `PAYPAL_CLIENT_SECRET` | ✅ | PayPal Developer Dashboard |
| `PAYPAL_ENV` | ✅ | `sandbox` or `production` |
| `GMAIL_CLIENT_ID` | ⚡ | Google Cloud → OAuth2 Credentials |
| `GMAIL_CLIENT_SECRET` | ⚡ | Google Cloud → OAuth2 Credentials |
| `GMAIL_REFRESH_TOKEN` | ⚡ | OAuth Playground (see Section 3) |
| `GMAIL_SENDER_EMAIL` | ⚡ | Your sender email address |
| `CLOUDFLARE_TUNNEL_TOKEN` | 🔧 | Cloudflare Dashboard (for GCP VM) |

✅ = Required for core functionality | ⚡ = Required for email features | 🔧 = Required for self-hosted deployment

# Pedie Tech — WordPress + WooCommerce Setup on AWS Lightsail

> **A complete guide to deploying a WooCommerce store on AWS Lightsail with M-Pesa payments, preorder deposits, and Google Sign-In**

---

## 📋 Table of Contents

- [Quick Overview](#-quick-overview)
- [Why WooCommerce over Odoo?](#-why-woocommerce-over-odoo)
- [Prerequisites](#-prerequisites)
- [Step 1: Launch AWS Lightsail Instance](#step-1-launch-aws-lightsail-instance)
- [Step 2: Initial Server Configuration](#step-2-initial-server-configuration)
- [Step 3: Domain & SSL Setup (Cloudflare)](#step-3-domain--ssl-setup-cloudflare)
- [Step 4: WordPress Core Configuration](#step-4-wordpress-core-configuration)
- [Step 5: Install Kadence Theme](#step-5-install-kadence-theme)
- [Step 6: WooCommerce Setup](#step-6-woocommerce-setup)
- [Step 7: Payment Gateway (IntaSend M-Pesa)](#step-7-payment-gateway-intasend-m-pesa)
- [Step 8: Preorder & Deposit System](#step-8-preorder--deposit-system)
- [Step 9: Google Sign-In & Social Login](#step-9-google-sign-in--social-login)
- [Step 10: Google Sheets Inventory Sync](#step-10-google-sheets-inventory-sync)
- [Step 11: Store Design & Homepage](#step-11-store-design--homepage)
- [Step 12: Essential Plugins & Optimization](#step-12-essential-plugins--optimization)
- [Step 13: Backups & Maintenance](#step-13-backups--maintenance)
- [Troubleshooting](#-troubleshooting)
- [Appendix: Plugin Reference](#-appendix-plugin-reference)

---

## 🎯 Quick Overview

| Component        | Details                              |
| ---------------- | ------------------------------------ |
| **Platform**     | AWS Lightsail                        |
| **OS**           | Ubuntu 24.04 LTS (Bitnami WordPress) |
| **CMS**          | WordPress 6.x                        |
| **eCommerce**    | WooCommerce 10.x                     |
| **Theme**        | Kadence (Free)                       |
| **Web Server**   | Apache (Bitnami stack)               |
| **Database**     | MariaDB 10.6                         |
| **SSL**          | Let's Encrypt (via bncert-tool)      |
| **CDN/DNS**      | Cloudflare (Full Strict)             |
| **Payments**     | IntaSend (M-Pesa + Cards)            |
| **Monthly Cost** | ~$7 USD                              |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (DNS + CDN)                       │
│                    SSL/TLS: Full (Strict)                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS (443)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AWS LIGHTSAIL INSTANCE                        │
│                   Bitnami WordPress ($7/mo)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      APACHE                               │  │
│  │              (Web Server + SSL Termination)               │  │
│  │                    Port 80 → 443                          │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   WORDPRESS + PHP                         │  │
│  │                  (WooCommerce Store)                      │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      MariaDB                              │  │
│  │                   (Database)                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Why WooCommerce over Odoo?

| Feature               | Odoo 19 Community         | WordPress + WooCommerce                |
| --------------------- | ------------------------- | -------------------------------------- |
| **Website Builder**   | Limited blocks, rigid     | Unlimited (Elementor, Gutenberg, etc.) |
| **Theme Flexibility** | ~10 themes                | 10,000+ themes                         |
| **Plugin Ecosystem**  | ~500 modules              | 60,000+ plugins                        |
| **Sliders/Carousels** | Basic, limited            | Smart Slider 3, Revolution, etc.       |
| **M-Pesa Options**    | Pesapal only              | IntaSend, Flutterwave, 5+ options      |
| **Preorder/Deposits** | Custom development needed | Free plugins available                 |
| **Google Sign-In**    | Built-in                  | Free plugin (Super Socializer)         |
| **Inventory Sync**    | Built-in ERP              | Google Sheets (FlexStock)              |
| **Learning Curve**    | Steep (ERP mindset)       | Moderate (huge community)              |
| **Design Control**    | ⚠️ Limited                | ✅ Unlimited                           |

### Trade-offs Accepted

- **Inventory Management:** Using Google Sheets + FlexStock plugin instead of built-in ERP
- **CRM/Accounting:** External tools (optional) instead of integrated modules
- **Complexity:** More plugins to manage, but each does one thing well

---

## 📦 Prerequisites

Before starting, ensure you have:

- [ ] AWS account with Lightsail access
- [ ] Domain name (e.g., `pedie.tech`)
- [ ] Cloudflare account (free tier works)
- [ ] Google Cloud Console access (for OAuth credentials)
- [ ] Google account (for Sheets inventory sync)
- [ ] IntaSend merchant account ([intasend.com](https://intasend.com))
- [ ] SSH client (Terminal on Mac/Linux, PuTTY on Windows)
- [ ] ~120 minutes of uninterrupted time

---

## Step 1: Launch AWS Lightsail Instance

### 1.1 Create Instance

1. Navigate to [Lightsail Console](https://lightsail.aws.amazon.com)
2. Click **Create instance**

### 1.2 Instance Configuration

| Setting               | Value                                                         |
| --------------------- | ------------------------------------------------------------- |
| **Region**            | Europe (Frankfurt) or Africa (Cape Town) _(closest to Kenya)_ |
| **Availability Zone** | Default                                                       |
| **Platform**          | Linux/Unix                                                    |
| **Blueprint**         | Apps + OS → **WordPress** (Bitnami)                           |
| **Instance Plan**     | **$7/month** (1 GB RAM, 2 vCPU, 40 GB SSD)                    |
| **Instance Name**     | `pedie-woo`                                                   |

> ⚠️ **Note:** The $7/month plan has limited RAM. We'll add swap memory and optimize aggressively to compensate.
>
> **When to upgrade:**
>
> - Sustained swap usage above 50% (check with `free -h`)
> - Frequent OOM kills or service restarts (check `dmesg | grep -i oom`)
> - High CPU load average >2.0 (check with `uptime`)
> - Slow site response times (>3s page loads)
>
> **Recommended upgrade path:**
>
> | Plan        | RAM | Monthly Cost | Use Case                         |
> | ----------- | --- | ------------ | -------------------------------- |
> | Current     | 1GB | $7           | Low traffic, <50 orders/mo       |
> | Next tier   | 2GB | $12          | Medium traffic, 50-200 orders/mo |
> | Recommended | 4GB | $24          | Higher traffic, 200+ orders/mo   |
>
> **Upgrade steps:** Create snapshot → Launch new instance from snapshot with higher plan → Update static IP attachment → Test → Terminate old instance.

### 1.3 SSH Key Pair

1. Click **Create new key pair** (or use existing `pedoo` key if you have it)
2. Name it: `pedie-woo`
3. Download `pedie-woo.pem` — **save this securely!**

### 1.4 Launch & Get Static IP

1. Click **Create instance**
2. Wait 2–3 minutes for the instance to start (green checkmark appears)
3. Go to **Networking** tab → **Create static IP**
4. Name: `pedie-woo-ip`
5. Attach to your instance

> 📝 **Your Static IP:** `___.___.___.___ ` _(write this down)_

### 1.5 Configure Firewall

In the Lightsail console, under your instance's **Networking** tab, verify these firewall rules exist:

| Application | Protocol | Port | Source   |
| ----------- | -------- | ---- | -------- |
| SSH         | TCP      | 22   | Anywhere |
| HTTP        | TCP      | 80   | Anywhere |
| HTTPS       | TCP      | 443  | Anywhere |

> 💡 Bitnami WordPress blueprint already has these configured by default.

---

## Step 2: Initial Server Configuration

### 2.1 Connect via SSH

**macOS / Linux:**

```bash
# Make key readable (run once)
chmod 400 pedie-woo.pem

# Connect to server
ssh -i pedie-woo.pem bitnami@YOUR_STATIC_IP
```

> ⚠️ **Important:** Bitnami instances use `bitnami` as the username, not `ubuntu`.

**Success indicator:**

```
bitnami@ip-172-31-xx-xx:~$
```

### 2.1.1 SSH Hardening (Recommended for Production)

After verifying you can connect with your SSH key, harden SSH access:

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config
```

Find and update these settings:

```
# Disable password authentication (key-only access)
PasswordAuthentication no

# Ensure public key authentication is enabled
PubkeyAuthentication yes

# Disable root login
PermitRootLogin no

# Optional: Change default SSH port (uncomment and set)
# Port 2222
```

> 🚨 **CRITICAL WARNING - Changing SSH Port:**
>
> If you change the SSH port from 22 to another port (e.g., 2222):
>
> 1. **BEFORE restarting SSH**, add the new port to AWS Lightsail firewall:
>    - Go to Lightsail Console → Your Instance → **Networking** tab
>    - Under **IPv4 Firewall**, click **Add rule**
>    - Application: **Custom**, Protocol: **TCP**, Port: **2222**
>    - Click **Create**
> 2. **Keep your current SSH session open** until you verify the new connection works
> 3. **Open a NEW terminal** and test the new port:
>    ```bash
>    ssh -i pedie-woo.pem -p 2222 bitnami@YOUR_STATIC_IP
>    ```
> 4. **Only after successful connection**, close the original session
>
> ⚠️ If you skip these steps, you will be **permanently locked out** of your server!

Save the configuration file.

> ⚠️ **Warning:** Before restarting SSH, open a **NEW terminal** and verify you can still connect:
>
> - **If you changed the port:** `ssh -i pedie-woo.pem -p 2222 bitnami@YOUR_STATIC_IP` (replace 2222 with your chosen port)
> - **If you kept port 22:** `ssh -i pedie-woo.pem bitnami@YOUR_STATIC_IP`
>
> Only proceed with the restart after confirming connectivity.
> Once you have verified connectivity in the new terminal, restart SSH:

```bash
sudo systemctl restart sshd
```

**Install fail2ban to block brute-force attacks:**

```bash
sudo apt install -y fail2ban

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Find the `[sshd]` section and ensure:

```
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
```

Start fail2ban:

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Verify it's running
sudo fail2ban-client status sshd
```

### 2.2 Get WordPress Admin Password

Bitnami generates a random admin password on first boot. Retrieve it:

```bash
cat /home/bitnami/bitnami_credentials
```

**Output:**

```
Welcome to the Bitnami WordPress Stack

The default username and password is 'user' and 'XXXXXXXXXXXXXXXX'.
```

> 📝 **Save this password** — you'll use it for initial WordPress login.

### 2.3 Create Swap Memory

> ⚠️ **Critical for $7/month instance:** Swap prevents out-of-memory crashes.

```bash
# Check current memory (should show no swap)
free -h

# Create 2GB swap file (conservative for 40GB SSD)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
sudo cp /etc/fstab /etc/fstab.bak
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize swappiness (reduce swap usage when possible)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Verify swap is active
free -h
```

**Expected output:**

```
              total        used        free      shared  buff/cache   available
Mem:          966Mi       XXXMi       XXXMi       XXXMi       XXXMi       XXXMi
Swap:         2.0Gi          0B       2.0Gi
```

### 2.4 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.5 Install Useful Tools

```bash
sudo apt install -y htop ncdu
```

---

## Step 3: Domain & SSL Setup (Cloudflare)

### Phase 1: Configure Cloudflare DNS

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain (e.g., `pedie.tech`)
3. Go to **DNS** → **Records**
4. Add/update these A records:

| Type | Name  | Content          | Proxy Status                 |
| ---- | ----- | ---------------- | ---------------------------- |
| A    | `@`   | `YOUR_STATIC_IP` | **DNS only** (gray cloud) ⚠️ |
| A    | `www` | `YOUR_STATIC_IP` | **DNS only** (gray cloud) ⚠️ |

> ⚠️ **Important:** Keep proxy OFF (gray cloud) until SSL is configured!

### Phase 2: Generate SSL Certificate with Bitnami Tool

Bitnami provides a convenient SSL tool:

```bash
sudo /opt/bitnami/bncert-tool
```

Follow the prompts:

1. **Domain list:** `pedie.tech www.pedie.tech`
2. **Enable HTTP to HTTPS redirection?** `Y`
3. **Enable non-www to www redirection?** `N` (or `Y` if you prefer www)
4. **Enable www to non-www redirection?** `Y` (recommended)
5. **Agree to Let's Encrypt terms:** `Y`
6. **Email for notifications:** `hello@pedie.tech`

**Success message:**

```
Congratulations! The certificate was generated successfully.

The configuration was successfully applied.
```

### Phase 3: Verify SSL

```bash
# Check certificate
sudo /opt/bitnami/ctlscript.sh status

# Test HTTPS
curl -I https://pedie.tech
```

### Phase 3.1: SSL Renewal Verification

Bitnami's `bncert-tool` sets up automatic certificate renewal via Let's Encrypt. Verify auto-renewal is configured:

```bash
# Check certificate expiry date
sudo openssl x509 -noout -enddate -in /opt/bitnami/apache/conf/bitnami/certs/server.crt

# Test renewal process (dry-run, won't actually renew)
sudo /opt/bitnami/letsencrypt/lego --path /opt/bitnami/letsencrypt renew --days 90 --dry-run

# Check bncert-tool cron job exists
sudo crontab -l | grep -i lego
```

**Verify cron job content and frequency:**

```bash
# Show the actual cron entry for lego renewal
sudo crontab -l | grep -i lego | head -1
```

**Expected output (twice-daily renewal check):**

```
0 0,12 * * * /opt/bitnami/letsencrypt/lego --path /opt/bitnami/letsencrypt --email="hello@pedie.tech" --domains="pedie.tech" --domains="www.pedie.tech" renew && /opt/bitnami/ctlscript.sh restart apache
```

> 💡 **If cron entry is missing or incorrect:** Re-run `sudo /opt/bitnami/bncert-tool` to regenerate the certificate and cron job. The tool will reconfigure automatic renewal.

> 🔔 **Set up certificate expiry alerts:** Configure monitoring to alert when certificates are within 14 days of expiration. Options:
>
> - **Wordfence:** Enable "SSL certificate expiration" scan under **Wordfence → Scan Options**
> - **External:** Use [UptimeRobot](https://uptimerobot.com/) or [StatusCake](https://statuscake.com/) with SSL monitoring (free tiers available)
> - This catches silent renewal failures before they cause downtime

**Expected output for expiry check:**

```
notAfter=May  7 12:00:00 2026 GMT
```

> 💡 **Add to weekly maintenance:** Verify certificate has >30 days until expiry. If renewal fails, re-run `sudo /opt/bitnami/bncert-tool` to regenerate.

### Phase 4: Enable Cloudflare Proxy

1. Go back to **Cloudflare DNS**
2. Edit both A records → Change to **Proxied** (orange cloud) ☁️
3. Go to **SSL/TLS** → Set mode to **Full (Strict)**

### Phase 5: Test in Browser

- Open `http://pedie.tech` → Should auto-redirect to `https://pedie.tech`
- Check the lock icon 🔒 → Connection is secure

---

## Step 4: WordPress Core Configuration

### 4.1 Access WordPress Admin

1. Go to `https://pedie.tech/wp-admin`
2. Login with:
   - **Username:** `user`
   - **Password:** _(from Step 2.2)_

### 4.2 Change Admin Credentials

**Immediately change the default credentials:**

1. Go to **Users** → **All Users** → Click on `user`
2. Update:
   - **Username:** Cannot be changed (create new admin instead)
   - **Email:** `hello@pedie.tech`
   - **New Password:** Generate a strong password
3. Click **Update Profile**

**Create a new admin user (recommended):**

1. **Users** → **Add New User**
2. Fill in:
   - **Username:** Choose a non-obvious name (avoid `admin`, `administrator`, or publicly known names)
   - **Email:** Your admin email
   - **Password:** Use a password manager to generate 20+ characters
   - **Role:** Administrator
3. Click **Add New User**
4. Log out and log in with the new admin
5. Delete the old `user` account (assign posts to new admin)

**Security Best Practices:**

- ✅ **Non-obvious username:** Avoid `admin`, `administrator`, or names from your public business documents
- ✅ **Enable 2FA:** Install "Two Factor Authentication" or "Wordfence Login Security" plugin
- ✅ **Limit login attempts:** Wordfence (installed in Step 12) provides this automatically
- ✅ **Strong password:** Use a password manager, minimum 20 characters with mixed case, numbers, symbols

**After creating the new admin:**

1. Go to **Users** → Filter by **Administrator** role
2. Verify only your new admin account exists (no unauthorized admins)
3. When deleting the old `user` account, select "Attribute all content to" your new admin
4. Consider creating a separate "Editor" account for daily content work (principle of least privilege)

### 4.3 Configure General Settings

**Settings** → **General:**

| Setting       | Value                     |
| ------------- | ------------------------- |
| Site Title    | Pedie Tech                |
| Tagline       | Your Trusted Tech Peddler |
| WordPress URL | `https://pedie.tech`      |
| Site URL      | `https://pedie.tech`      |
| Admin Email   | `hello@pedie.tech`        |
| Timezone      | Africa/Nairobi (UTC+3)    |
| Date Format   | F j, Y                    |
| Time Format   | g:i a                     |

Click **Save Changes**.

### 4.4 Configure Permalinks

**Settings** → **Permalinks:**

- Select: **Post name** (`/%postname%/`)
- Click **Save Changes**

### 4.5 Remove Default Content

**Delete these:**

1. **Posts** → Delete "Hello World!" post
2. **Pages** → Delete "Sample Page"
3. **Plugins** → Deactivate and delete unused plugins:
   - Jetpack (if installed)
   - Akismet (unless using it)
   - Hello Dolly

### 4.6 Increase PHP Memory Limit

Edit WordPress configuration:

```bash
sudo nano /opt/bitnami/wordpress/wp-config.php
```

Find the line `/* That's all, stop editing! */` and add **above** it:

```php
/* Performance optimizations for low-memory instance (1GB RAM) */
/* Keep limits conservative to leave headroom for OS, Apache, and MariaDB */
define('WP_MEMORY_LIMIT', '128M');
define('WP_MAX_MEMORY_LIMIT', '256M');

/* Production debug settings */
/* WP_DEBUG: controls whether PHP errors/notices are generated (does not control logging) */
define('WP_DEBUG', false);
/* WP_DEBUG_DISPLAY: controls whether errors are printed to the screen */
define('WP_DEBUG_DISPLAY', false);
/* WP_DEBUG_LOG: operates independently of WP_DEBUG — when true, PHP errors
   are written to wp-content/debug.log even when WP_DEBUG is false */
define('WP_DEBUG_LOG', true);
define('SCRIPT_DEBUG', false);

/* Disable file editing in admin (security) */
define('DISALLOW_FILE_EDIT', true);

/* Reduce post revisions to save database space */
define('WP_POST_REVISIONS', 3);

/* Optimize autosave interval */
define('AUTOSAVE_INTERVAL', 120);
```

> 💡 **Troubleshooting:** When debugging issues, temporarily set `WP_DEBUG` to `true` and check `/opt/bitnami/wordpress/wp-content/debug.log`. Remember to set it back to `false` in production.

Save and exit: `Ctrl+O` → `Enter` → `Ctrl+X`

Restart Apache:

```bash
sudo /opt/bitnami/ctlscript.sh restart apache
```

---

## Step 5: Install Kadence Theme

### Why Kadence?

- **Lightweight:** Fast loading, minimal bloat
- **Free Header/Footer Builder:** Highly customizable
- **Block-based:** Works with Gutenberg, no page builder required
- **WooCommerce-ready:** Built-in shop layouts
- **Starter Templates:** Quick import of professional designs

### 5.1 Install Kadence Theme

1. Go to **Appearance** → **Themes** → **Add New**
2. Search for **"Kadence"**
3. Click **Install** → **Activate**

### 5.2 Install Kadence Blocks Plugin

1. Go to **Plugins** → **Add New**
2. Search for **"Kadence Blocks"**
3. Click **Install Now** → **Activate**

### 5.3 Install Starter Templates

1. Go to **Plugins** → **Add New**
2. Search for **"Starter Templates"** (by Starter Templates)
3. Click **Install Now** → **Activate**

### 5.4 Import a Starter Template (Optional)

1. Go to **Appearance** → **Starter Templates**
2. Select **Kadence** as your page builder
3. Browse templates — look for:
   - **eCommerce** category
   - **Shopping** or **Store** layouts
   - Clean, modern designs similar to Reebelo
4. Click on a template → **Import Complete Site**

> 💡 **Tip:** If no template matches exactly, import a minimal one and customize. The Reebelo look can be built manually with Kadence's header builder and product grid blocks.

### 5.5 Configure Kadence Customizer

**Appearance** → **Customize:**

**Colors & Fonts:**

1. **Global** → **Colors** → Set your brand colors:
   - Primary: Your accent color
   - Background: White or light gray
2. **Global** → **Typography** → Choose clean fonts:
   - Headings: Inter, Poppins, or system fonts
   - Body: System fonts (fastest)

**Header:**

1. **Header** → **Header Layout** → Choose a layout
2. Add:
   - Logo (left)
   - Navigation (center or right)
   - Cart icon
   - Account/Login icon
3. **Sticky Header:** Enable for better UX

**Footer:**

1. **Footer** → **Footer Layout** → Choose a clean layout
2. Add widgets for:
   - About Pedie
   - Quick Links
   - Contact Info
   - Social Icons

Click **Publish** to save.

---

## Step 6: WooCommerce Setup

### 6.1 Install WooCommerce

1. Go to **Plugins** → **Add New**
2. Search for **"WooCommerce"**
3. Click **Install Now** → **Activate**
4. The WooCommerce Setup Wizard will launch

### 6.2 WooCommerce Setup Wizard

Follow the wizard:

**Step 1: Store Details**

| Field    | Value           |
| -------- | --------------- |
| Country  | Kenya           |
| Address  | Your address    |
| City     | Nairobi         |
| Postcode | (Your postcode) |

**Step 2: Industry**

- Select: **Electronics and computers**

**Step 3: Product Types**

- Select: **Physical products**

**Step 4: Business Details**

- Products to sell: **1-10** (initially)
- Currently selling: **No** (or Yes if applicable)

**Step 5: Theme**

- Skip (we're using Kadence)

**Step 6: Skip or complete additional steps**

### 6.3 Configure WooCommerce Settings

**WooCommerce** → **Settings:**

**General Tab:**

| Setting                   | Value                              |
| ------------------------- | ---------------------------------- |
| Store Address             | Your Nairobi address               |
| Selling Location(s)       | Sell to specific countries → Kenya |
| Shipping Location(s)      | Ship to specific countries → Kenya |
| Default Customer Location | Shop base address                  |
| Enable Taxes              | Yes (if applicable)                |
| Currency                  | Kenyan shilling (KES)              |
| Currency Position         | Left                               |
| Thousand Separator        | ,                                  |
| Decimal Separator         | .                                  |
| Number of Decimals        | 0 (Kenyans don't use cents)        |

Click **Save changes**.

**Products Tab:**

| Setting                                     | Value |
| ------------------------------------------- | ----- |
| Weight unit                                 | kg    |
| Dimensions unit                             | cm    |
| Enable Reviews                              | Yes   |
| Show verified owner label                   | Yes   |
| Reviews can only be left by verified owners | Yes   |

**Tax Configuration for Kenya:**

> 💡 Kenya has a 16% VAT on most goods. Configure this for compliance.

1. Go to **WooCommerce** → **Settings** → **Tax** (enable taxes in General tab first)
2. Under **Tax Options:**
   - Prices entered with tax: **No, I will enter prices exclusive of tax**
   - Display prices in the shop: **Including tax**
   - Display prices during cart and checkout: **Including tax**
   - Price display suffix: `(incl. VAT)` or leave empty
3. Click **Standard Rates** tab → **Insert row**
4. Configure:

| Country Code | State | Rate %  | Tax Name | Compound | Shipping |
| ------------ | ----- | ------- | -------- | -------- | -------- |
| KE           | \*    | 16.0000 | VAT      | No       | Yes      |

5. Click **Save changes**

> 📝 **For VAT-compliant receipts:** Install the **WooCommerce PDF Invoices & Packing Slips** plugin. Configure it to display your KRA PIN and VAT breakdown on invoices.

**Shipping Tab:**

1. Click **Add shipping zone**
2. Create zones:

**Zone: Nairobi**

| Setting         | Value                         |
| --------------- | ----------------------------- |
| Zone name       | Nairobi                       |
| Zone regions    | Kenya — Nairobi               |
| Shipping method | Flat rate: KES 500 (delivery) |
| Shipping method | Local pickup: Free            |

**Zone: Rest of Kenya**

| Setting         | Value                     |
| --------------- | ------------------------- |
| Zone name       | Rest of Kenya             |
| Zone regions    | Kenya (all other regions) |
| Shipping method | Flat rate: KES 1,500      |

**Accounts & Privacy Tab:**

| Setting                                              | Value |
| ---------------------------------------------------- | ----- |
| Allow customers to place orders without account      | No    |
| Allow customers to create account during checkout    | Yes   |
| Allow customers to create account on My Account page | Yes   |
| When creating an account, send the new user an email | Yes   |

**Emails Tab:**

Configure email sender:

| Setting    | Value            |
| ---------- | ---------------- |
| From name  | Pedie Tech       |
| From email | hello@pedie.tech |

Click **Save changes**.

### 6.4 Create Essential Pages

WooCommerce creates these automatically, but verify they exist:

1. **Shop** (product listing)
2. **Cart**
3. **Checkout**
4. **My Account**

Create additional pages:

1. **Pages** → **Add New**
2. Create:
   - **About Us** — Company story
   - **Contact** — Contact form + WhatsApp
   - **FAQ** — Common questions
   - **Warranty Policy** — 3-month warranty terms
   - **Shipping & Delivery** — Timelines and costs
   - **Preorder Policy** — 5% deposit, refund terms

---

## Step 7: Payment Gateway (IntaSend M-Pesa)

### Why IntaSend?

- **M-Pesa + Cards:** Single integration for both
- **Kenya-focused:** Built for local merchants
- **3% fee:** Competitive rates
- **Good documentation:** Easy setup
- **Webhook support:** Automatic order updates

### 7.1 Create IntaSend Account

1. Go to [intasend.com](https://intasend.com)
2. Click **Get Started** or **Sign Up**
3. Complete merchant registration:
   - Business name: Pedie Tech
   - Business type: Sole Proprietor (or LLC when registered)
   - KRA PIN: (Your tax PIN)
   - ID verification: Upload documents
4. Wait for account approval (usually 1-2 business days)

### 7.2 Get API Credentials

Once approved:

1. Log in to [IntaSend Dashboard](https://payment.intasend.com)
2. Go to **Settings** → **API Keys**
3. Copy:
   - **Publishable Key:** `ISPubKey_test_...` (starts with test\_ for sandbox)
   - **Secret Key:** `ISSecretKey_test_...`

> 💡 Use **test keys** first to verify the integration, then switch to **live keys**.

### 7.3 Install IntaSend Plugin

1. Go to **Plugins** → **Add New**
2. Search for **"IntaSend Payment"**
3. Click **Install Now** → **Activate**

### 7.4 Configure IntaSend

1. Go to **WooCommerce** → **Settings** → **Payments**
2. Find **IntaSend Payment Gateway** → Click **Manage**
3. Configure:

| Setting             | Value                                       |
| ------------------- | ------------------------------------------- |
| Enable/Disable      | ✅ Enable IntaSend Payment Gateway          |
| Title               | M-Pesa / Card Payment                       |
| Description         | Pay securely with M-Pesa or Visa/Mastercard |
| API Publishable Key | `ISPubKey_test_...` (your key)              |
| API Secret Key      | `ISSecretKey_test_...` (your secret)        |
| Test Mode           | ✅ Enable (uncheck for live)                |

4. Click **Save changes**

### 7.5 Webhook Security

Configure webhooks for automatic order status updates:

1. Log in to [IntaSend Dashboard](https://payment.intasend.com)
2. Go to **Settings** → **Webhooks**
3. Add webhook URL: `https://pedie.tech/wc-api/intasend_gateway/` (or check plugin docs for exact endpoint)
4. Enable webhook events: `payment.completed`, `payment.failed`
5. Copy the **Webhook Secret** provided by IntaSend

**In WooCommerce:**

1. Go to **WooCommerce** → **Settings** → **Payments** → **IntaSend**
2. If the plugin supports it, enable **Signature Verification**
3. Enter the Webhook Secret
4. Click **Save changes**

> ⚠️ **Security:** Store the Webhook Secret separately from API keys. Consider using environment variables (see "Additional security measures" below).

### 7.6 Payment Monitoring

**Set up monitoring to catch payment issues early:**

1. **Email notifications:** In IntaSend dashboard, enable email alerts for failed payments
2. **Regular order review:** Check **WooCommerce** → **Orders** → Filter by "Failed" status daily
3. **IntaSend dashboard:** Monitor for declined transactions, fraud flags, or unusual patterns
4. **Large payment alerts:** In IntaSend, set alerts for payments above KES 100,000 (unusual for phone/laptop orders)

<details>
<summary><strong>Additional security measures (recommended for production)</strong></summary>

Store API credentials as environment variables instead of in the WordPress admin:

**In `/opt/bitnami/wordpress/wp-config.php`:**

```php
/* IntaSend credentials from environment */
define('INTASEND_PUBLISHABLE_KEY', getenv('INTASEND_PUBLISHABLE_KEY'));
define('INTASEND_SECRET_KEY', getenv('INTASEND_SECRET_KEY'));
```

**Set environment variables for Apache (Bitnami):**

> ⚠️ **Important:** Setting vars in `.bashrc` won't work for web requests. Apache needs them in its config.

```bash
# Edit Bitnami Apache config
sudo nano /opt/bitnami/apache/conf/bitnami/bitnami.conf
```

Add inside the `<VirtualHost>` block (before `</VirtualHost>`):

```apache
# IntaSend API credentials
SetEnv INTASEND_PUBLISHABLE_KEY "ISPubKey_live_XXXXX"
SetEnv INTASEND_SECRET_KEY "ISSecretKey_live_XXXXX"
```

Restart Apache:

```bash
sudo /opt/bitnami/ctlscript.sh restart apache
```

**Alternative: PHP-FPM (if used instead of mod_php):**

```bash
sudo nano /opt/bitnami/php/etc/php-fpm.d/www.conf
```

Add at the end:

```ini
env[INTASEND_PUBLISHABLE_KEY] = "ISPubKey_live_XXXXX"
env[INTASEND_SECRET_KEY] = "ISSecretKey_live_XXXXX"
```

Restart PHP-FPM: `sudo /opt/bitnami/ctlscript.sh restart php-fpm`

**Verify environment variables are working:**

**Option A: Command-line check (recommended - no file created):**

```bash
# Test from command line - does not expose key value
/opt/bitnami/php/bin/php -r 'echo getenv("INTASEND_PUBLISHABLE_KEY") ? "SET" : "NOT_SET"; echo "\n";'
```

Expected output: `SET`

**Option B: Web-based check (if Option A doesn't reflect Apache env):**

```bash
# Create a SAFE test file that doesn't expose the actual key
echo '<?php echo getenv("INTASEND_PUBLISHABLE_KEY") ? "Environment variable is SET" : "Environment variable NOT FOUND"; ?>' | sudo tee /opt/bitnami/wordpress/env-test.php
```

Visit `https://pedie.tech/env-test.php` - should show "Environment variable is SET".

> ⚠️ **Delete immediately after testing - do not leave test files in production:**

```bash
sudo rm /opt/bitnami/wordpress/env-test.php
```

> 💡 **Note:** Check if the IntaSend plugin supports reading from constants. If not, this approach won't work and you'll need to use the admin settings.

</details>

### 7.7 Test Payment Flow

1. Add a product to cart
2. Go to checkout
3. Fill in test customer details
4. Select **M-Pesa / Card Payment**
5. Complete the test payment
6. Verify order appears in **WooCommerce** → **Orders**
7. Verify webhook updated order status automatically

### 7.8 Switch to Live Mode

Once testing is successful:

1. Get **live API keys** from IntaSend dashboard
2. Update plugin settings with live keys
3. Uncheck **Test Mode**
4. Process a real small transaction to verify

---

## Step 8: Preorder & Deposit System

### Business Requirement

From Pedie's business plan:

- **5% deposit** on preorders (e.g., KES 2,900 on KES 58,000)
- **Refundable** if Pedie hasn't ordered from supplier yet
- **Non-refundable** once order is placed with supplier

### 8.1 Install Deposits Plugin

1. Go to **Plugins** → **Add New**
2. Search for **"Deposits Partial Payments WooCommerce"** (by Acowebs)
3. Click **Install Now** → **Activate**

### 8.2 Configure Deposits

1. Go to **WooCommerce** → **Deposits** (or check Settings)
2. Configure global settings:

| Setting                | Value                                     |
| ---------------------- | ----------------------------------------- |
| Enable Deposits        | Yes                                       |
| Default Deposit Type   | Percentage                                |
| Default Deposit Amount | 5                                         |
| Force Deposit          | No (let customer choose)                  |
| Deposit Text           | "Pay 5% deposit now, balance on delivery" |

3. Click **Save changes**

### 8.3 Install Pre-Orders Plugin

1. Go to **Plugins** → **Add New**
2. Search for **"Pre-Orders for WooCommerce"** (by Bright Vessel)
3. Click **Install Now** → **Activate**

### 8.4 Configure Pre-Orders

1. Go to **WooCommerce** → **Settings** → **Pre-Orders**
2. Configure:

| Setting                | Value                                                |
| ---------------------- | ---------------------------------------------------- |
| Pre-Order Button Text  | Pre-Order Now                                        |
| Availability Date Text | Available: {date}                                    |
| Pre-Order Message      | This item is available for pre-order with 5% deposit |

### 8.5 Set Up a Pre-Order Product

For products not in stock (typical Pedie workflow):

1. Go to **Products** → **Add New**
2. Fill in product details
3. In **Product Data** panel:
   - Check **Pre-Order** option
   - Set **Availability Date** (estimated arrival + buffer)
4. In **Deposits** section:
   - Enable deposits for this product
   - Set 5% (or use global default)
5. Publish the product

### 8.6 Customer Experience Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Customer Journey for Pre-Order Product                     │
├─────────────────────────────────────────────────────────────┤
│  1. Browse → Sees "Pre-Order Now" button                    │
│  2. Add to Cart → Sees deposit amount (5%)                  │
│  3. Checkout → Pays KES 2,900 deposit (on KES 58,000 phone) │
│  4. Confirmation → Email with pre-order details             │
│  5. Product Arrives → Pedie contacts customer               │
│  6. Balance Payment → Customer pays remaining 95%           │
│  7. Delivery → Product delivered/picked up                  │
└─────────────────────────────────────────────────────────────┘
```

### 8.7 Deposit Refund Management

**Refund Policy (from Business Plan):**

| Supplier Order Status | Deposit Refundable? | Action                                |
| --------------------- | ------------------- | ------------------------------------- |
| Not Ordered           | ✅ Yes              | Full 5% deposit refund                |
| Ordered               | ❌ No               | Deposit retained (item in transit)    |
| Received              | ❌ No               | Deposit retained (ready for delivery) |

**Operational Tracking:**

Add a "Supplier Order Status" column to your Google Sheets inventory with values:

- `Not Ordered` — Customer deposit received, awaiting consolidation
- `Ordered` — Order placed with US supplier
- `Received` — Item arrived at Aquantuo/Kenya

Alternatively, use WooCommerce order notes:

1. Open order → **Order notes** (right sidebar)
2. Add private note: "Supplier order placed [DATE]" or "Item received [DATE]"

**Refund Handling Steps:**

1. **Customer requests refund:**
   - Check Google Sheets or order notes for Supplier Order Status
2. **If Status = "Not Ordered":**
   - Go to **WooCommerce** → **Orders** → Select order
   - Click **Refund** → Enter deposit amount (5%)
   - Select refund method (IntaSend processes in 3-5 business days)
   - Add order note: "Deposit refunded - supplier not yet ordered"

3. **If Status = "Ordered" or "Received":**
   - Deny refund with templated response:

   > "Thank you for reaching out. Per our preorder policy, deposits become non-refundable once we've placed the order with our supplier. Your order status shows the item is [in transit / received]. We'll contact you shortly to arrange delivery and balance payment. If you have questions, please WhatsApp us at +254XXXXXXXXX."

**Display Policy Clearly:**

- ✅ Product descriptions (each preorder item)
- ✅ Cart page (use WooCommerce notice)
- ✅ Checkout page (before payment)
- ✅ Order confirmation email (template customization)
- ✅ Dedicated "Preorder Policy" page (link in footer)

**Optional: Custom Order Status**

Install **WooCommerce Order Status Manager** (free) to add:

- `Supplier Ordered` status (after placing US order)
- `In Transit` status (shipped from US)
- `Ready for Pickup` status (arrived in Kenya)

---

## Step 9: Google Sign-In & Social Login

### 9.1 Install Super Socializer

1. Go to **Plugins** → **Add New**
2. Search for **"Super Socializer"**
3. Click **Install Now** → **Activate**

### 9.2 Create Google OAuth Credentials

> ⚠️ **Note:** Google+ API is deprecated. Use **Google Identity Services** instead.

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing):
   - Project name: `Pedie Tech`
3. **Configure OAuth Consent Screen** (required first):
   - Go to **APIs & Services** → **OAuth consent screen**
   - User Type: **External** (for customer login)
   - Fill in app information:
     - App name: `Pedie Tech`
     - User support email: `hello@pedie.tech`
     - Developer contact: `hello@pedie.tech`
   - **Scopes:** Add these scopes:
     - `openid`
     - `email`
     - `profile`
   - Save and continue through Test users (can skip for production)
4. **Enable required APIs:**
   - Go to **APIs & Services** → **Library**
   - Search for and enable:
     - **Google Identity Toolkit API** (for Sign-In)
     - Or **Google People API** (alternative, for profile data)
   - Click **Enable** on each
5. **Create OAuth credentials:**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Pedie WooCommerce`
   - **Authorized JavaScript origins:**
     - `https://pedie.tech`
   - **Authorized redirect URIs:**
     - `https://pedie.tech`
     - `https://pedie.tech/wp-admin/admin-ajax.php` (some plugins need this)
   - Click **Create**
6. Copy your:
   - **Client ID:** `XXXXX.apps.googleusercontent.com`
   - **Client Secret:** `GOCSPX-XXXXX`

> 💡 **Plugin Compatibility:** Super Socializer supports Google Identity Services. If issues arise, alternatives include:
>
> - **Nextend Social Login** (200k+ installs, actively maintained)
> - **Login with Google** by rtCamp (minimal, Google-only)

### 9.3 Configure Super Socializer

1. Go to **Super Socializer** → **Social Login**
2. Enable **Social Login**
3. Under **Google**:
   - Check **Enable**
   - Paste **Client ID**
   - Paste **Client Secret**
4. Configure display options:
   - Enable on: Login page, Registration page, WooCommerce checkout
   - Button style: Choose icon or text style
5. Click **Save Changes**

### 9.4 Test Google Login

1. Log out of WordPress
2. Go to your site's login page or My Account page
3. You should see "Sign in with Google" button
4. Test the flow:
   - Click Google button
   - Authorize with Google account
   - Verify account is created in WordPress

---

## Step 10: Google Sheets Inventory Sync

### Why Google Sheets?

- **Free:** No cost for inventory management
- **Familiar:** Easy to use, no learning curve
- **Accessible:** View/edit from any device
- **Two-way sync:** Update stock from Sheets or WooCommerce

### 10.1 Install FlexStock Plugin

1. Go to **Plugins** → **Add New**
2. Search for **"FlexStock Google Sheets WooCommerce"**
3. Click **Install Now** → **Activate**

> 💡 Free tier supports up to **500 products** — more than enough for Pedie.

### 10.2 Configure Google Sheets Connection

1. Go to **WooCommerce** → **FlexStock** (or Settings → FlexStock)
2. Click **Connect Google Account**
3. Authorize the plugin to access your Google Drive
4. Create a new spreadsheet or select existing

### 10.3 Set Up Inventory Spreadsheet

The plugin will create columns like:

| SKU        | Product Name            | Stock Quantity | Price  | Status    |
| ---------- | ----------------------- | -------------- | ------ | --------- |
| IP12PM256  | iPhone 12 Pro Max 256GB | 0              | 58000  | Pre-order |
| MBA-M1-256 | MacBook Air M1 256GB    | 0              | 120000 | Pre-order |

### 10.4 Sync Workflow

**When new stock arrives:**

1. Update quantity in Google Sheet
2. FlexStock syncs to WooCommerce
3. Product becomes "In Stock"

**When order is placed:**

1. WooCommerce reduces stock
2. FlexStock syncs to Google Sheet
3. You see updated inventory

### 10.5 Alternative: Manual with WC Product Stock

If FlexStock doesn't work well for your workflow:

1. Export products to CSV from WooCommerce
2. Import to Google Sheets
3. Track manually
4. Re-import to WooCommerce as needed

---

## Step 11: Store Design & Homepage

### 11.1 Install Smart Slider 3

For Reebelo-style homepage sliders:

1. Go to **Plugins** → **Add New**
2. Search for **"Smart Slider 3"**
3. Click **Install Now** → **Activate**

### 11.2 Create Homepage Slider

1. Go to **Smart Slider** → **Add New**
2. Choose **Start with Template** or **Create Empty**
3. For Reebelo-style:
   - Full-width slider
   - Product images with text overlays
   - Call-to-action buttons
4. Add slides:
   - **Slide 1:** Hero image + "Premium Refurbished Tech" + CTA
   - **Slide 2:** Featured iPhone + price + pre-order button
   - **Slide 3:** MacBook promotion + specs
5. Configure:
   - Autoplay: Yes
   - Arrows: Yes
   - Dots: Yes
   - Animation: Fade or Slide

### 11.3 Build Homepage

1. Go to **Pages** → **Add New** → Name: "Home"
2. Use Kadence Blocks to build:

**Section 1: Hero Slider**

- Add Smart Slider block
- Select your slider

**Section 2: Trust Badges**

- Row with 4 columns
- Icons + text: "Certified Refurbished", "3-Month Warranty", "7-10 Day Delivery", "M-Pesa Payment"

**Section 3: Featured Categories**

- Category grid: iPhones, MacBooks, Accessories
- Use Kadence Image blocks with links

**Section 4: Featured Products**

- WooCommerce Products block
- Filter: Featured products
- Layout: Grid (4 columns)

**Section 5: Why Choose Pedie**

- Text + image section
- Key value propositions

**Section 6: Customer Reviews/Testimonials**

- Testimonial carousel (Kadence has this)

**Section 7: Pre-Order CTA**

- Full-width banner
- "Pre-Order Your Dream Device" + button

3. Set as Homepage:
   - Go to **Settings** → **Reading**
   - Select: "A static page"
   - Homepage: Select "Home"
   - Click **Save Changes**

### 11.4 Create Product Categories

1. Go to **Products** → **Categories**
2. Create:

| Category    | Slug        | Description                         |
| ----------- | ----------- | ----------------------------------- |
| iPhones     | iphones     | Certified Refurbished iPhones       |
| MacBooks    | macbooks    | Certified Refurbished MacBooks      |
| iPads       | ipads       | Certified Refurbished iPads         |
| Accessories | accessories | Cases, chargers, cables             |
| Pre-Orders  | preorders   | Coming soon, available to pre-order |

### 11.5 Add Sample Products

Create your first products:

**Example: iPhone 12 Pro Max 256GB**

1. **Products** → **Add New**
2. Fill in:
   - **Name:** iPhone 12 Pro Max 256GB - Graphite
   - **Description:** Detailed specs, condition description
   - **Short Description:** Certified refurbished, 85%+ battery, unlocked
   - **Regular Price:** 58000
   - **Categories:** iPhones, Pre-Orders
   - **Tags:** iPhone, Apple, 256GB, Graphite
   - **Product Image:** High-quality photo
   - **Product Gallery:** Multiple angles
3. **Product Data:**
   - **SKU:** IP12PM256-GR
   - **Stock Status:** On backorder (for pre-orders)
   - **Pre-Order:** Enable
   - **Deposits:** Enable, 5%
4. **Publish**

---

## Step 12: Essential Plugins & Optimization

### 12.1 Security: Wordfence

1. Go to **Plugins** → **Add New**
2. Search for **"Wordfence"**
3. Click **Install Now** → **Activate**
4. Complete setup wizard:
   - Enter email for alerts
   - Enable firewall
   - Enable malware scanner

### 12.2 SEO: Rank Math

1. Go to **Plugins** → **Add New**
2. Search for **"Rank Math"**
3. Click **Install Now** → **Activate**
4. Complete setup wizard:
   - Business type: Online Store
   - Connect Rank Math account (free)
   - Import settings if migrating

### 12.3 Backups: UpdraftPlus

1. Go to **Plugins** → **Add New**
2. Search for **"UpdraftPlus"**
3. Click **Install Now** → **Activate**
4. Configure:
   - Go to **Settings** → **UpdraftPlus Backups**
   - Schedule: Daily (files), Weekly (database)
   - Remote storage: Google Drive (free 15GB)

### 12.4 Caching: WP Super Cache

1. Go to **Plugins** → **Add New**
2. Search for **"WP Super Cache"**
3. Click **Install Now** → **Activate**
4. Configure:
   - Go to **Settings** → **WP Super Cache**
   - Enable: **Caching On**
   - Simple or Expert mode

> ⚠️ **Important for $7 instance:** Caching is critical for performance. Enable and test.

### 12.5 Rate Limiting & API Security

**Configure Wordfence Rate Limiting:**

1. Go to **Wordfence** → **Firewall** → **Rate Limiting**
2. Enable and configure:

| Setting                               | Recommended Value                              |
| ------------------------------------- | ---------------------------------------------- |
| Enable Rate Limiting                  | ✅ On                                          |
| How should we treat Google's crawlers | Verified Google crawlers have unlimited access |
| If anyone's requests exceed           | 240 per minute → throttle it                   |
| If a crawler's page views exceed      | 240 per minute → throttle it                   |
| If a crawler's pages not found exceed | 30 per minute → block it                       |
| If a human's page views exceed        | 240 per minute → throttle it                   |
| If a human's pages not found exceed   | 30 per minute → block it                       |
| If anyone posts more than             | 15 per minute → block it                       |
| How long to block IPs                 | 5 minutes                                      |

3. Click **Save Changes**

**Harden WooCommerce REST API:**

Add to `/opt/bitnami/wordpress/wp-config.php`:

```php
/* Limit WooCommerce API requests (production hardening) */
define('WC_API_REQUEST_THROTTLE_LIMIT', 25); /* requests per minute */
```

**Block Common Attack Vectors:**

> 🚨 **WARNING: Blocking xmlrpc.php can break important features!**
>
> XML-RPC is used by:
>
> - 📱 **WordPress mobile apps** (iOS/Android)
> - ⚡ **Jetpack** plugin (stats, security, backups)
> - ✉️ **Post-by-email** functionality
> - 📝 **Remote publishing tools** (Windows Live Writer, etc.)
> - 🔗 **Pingbacks and trackbacks**
> - 🔌 **Some third-party integrations** (IFTTT, Zapier, etc.)
>
> **Only block if you're certain you don't need these features!**

**Before blocking, test for xmlrpc.php usage:**

```bash
# 1. Check if any plugins use xmlrpc
grep -r "xmlrpc" /opt/bitnami/wordpress/wp-content/plugins/ --include="*.php" | head -10

# 2. Monitor access logs for xmlrpc usage (run for 1 week)
sudo tail -f /opt/bitnami/apache/logs/access_log | grep xmlrpc

# Or check historical usage
sudo grep xmlrpc /opt/bitnami/apache/logs/access_log | wc -l
```

**Option A: Full block (only if testing shows no legitimate usage):**

```bash
sudo nano /opt/bitnami/wordpress/.htaccess
```

Add at the top:

```apache
# Block XML-RPC (WARNING: breaks mobile apps, Jetpack, remote publishing)
<Files xmlrpc.php>
    Order Deny,Allow
    Deny from all
</Files>
```

**Option B: Rate-limit instead of blocking (recommended):**

Wordfence (installed in Step 12.1) can rate-limit xmlrpc.php without breaking functionality:

- Go to **Wordfence** → **Firewall** → **Brute Force Protection**
- Enable "Block IPs that send POST requests to xmlrpc.php"
- This blocks brute-force attempts while allowing legitimate single requests

### 12.6 WhatsApp: Click to Chat

1. Go to **Plugins** → **Add New**
2. Search for **"Click to Chat"** (by HoliThemes)
3. Click **Install Now** → **Activate**
4. Configure:
   - Go to **Click to Chat** settings
   - WhatsApp number: `+254XXXXXXXXX`
   - Pre-filled message: "Hi! I'm interested in your products"
   - Display: Floating button on all pages
   - Position: Bottom right

### 12.6 Performance Optimization

**Disable unused features:**

```bash
# SSH into server
ssh -i pedie-woo.pem bitnami@YOUR_STATIC_IP

# Disable WordPress Cron (use system cron instead)
sudo nano /opt/bitnami/wordpress/wp-config.php
```

Add above `/* That's all, stop editing! */`:

```php
/* Use system cron instead of WP-Cron for better performance */
define('DISABLE_WP_CRON', true);
```

Set up system cron:

```bash
# Create log directory
mkdir -p /home/bitnami/logs

# Edit crontab
crontab -e

# Add this line (runs every 5 minutes with proper logging)
*/5 * * * * /usr/bin/curl --max-time 60 --retry 2 -s "https://pedie.tech/wp-cron.php?doing_wp_cron" >> /home/bitnami/logs/wp-cron.log 2>&1
```

**Verify cron setup:**

```bash
# Confirm cron entry was saved
crontab -l | grep wp-cron

# Wait 5 minutes, then check log for output
tail -20 /home/bitnami/logs/wp-cron.log

# Verify WordPress scheduled tasks are running
cd /opt/bitnami/wordpress

# Check WP-CLI availability before running cron commands
if [[ ! -x "./wp-cli.phar" ]]; then
    echo "ERROR: wp-cli.phar not found or not executable"
    echo "Download WP-CLI: curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x wp-cli.phar"
    echo "Alternative: Visit WooCommerce → Status → Scheduled Actions in admin panel"
else
    ./wp-cli.phar cron event list
fi
```

**Troubleshooting cron issues:**

If you see 403 errors or connection failures in the log:

```bash
# Option 1: Use localhost instead of domain (bypasses Cloudflare)
*/5 * * * * /usr/bin/curl --max-time 60 --retry 2 -s "http://127.0.0.1/wp-cron.php?doing_wp_cron" >> /home/bitnami/logs/wp-cron.log 2>&1

# Option 2: Add WordPress user-agent (some security plugins block unknown agents)
*/5 * * * * /usr/bin/curl --max-time 60 --retry 2 -s -A "WordPress" "https://pedie.tech/wp-cron.php?doing_wp_cron" >> /home/bitnami/logs/wp-cron.log 2>&1
```

**Set up log rotation (prevent disk growth):**

```bash
sudo nano /etc/logrotate.d/wp-cron
```

Add:

```
/home/bitnami/logs/wp-cron.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
```

> 💡 **Weekly maintenance:** Review `/home/bitnami/logs/wp-cron.log` for errors.

**Image Optimization:**

1. Install **Smush** or **ShortPixel** (free tiers available)
2. Compress all uploaded images
3. Enable lazy loading (Kadence has this built-in)

---

## Step 13: Backups & Maintenance

### 13.1 UpdraftPlus Configuration

1. Go to **Settings** → **UpdraftPlus Backups**
2. Click **Settings** tab
3. Configure schedule:

| Backup Type | Frequency | Retention |
| ----------- | --------- | --------- |
| Files       | Daily     | 7 copies  |
| Database    | Daily     | 14 copies |

4. Configure remote storage:
   - Click **Google Drive**
   - Authenticate with Google
   - Select/create folder: "Pedie Backups"
5. Click **Save Changes**
6. Click **Backup Now** to create initial backup

### 13.2 Lightsail Snapshots

**Manual Snapshot:**

1. Go to Lightsail Console → Your instance → **Snapshots**
2. Click **Create snapshot**
3. Name: `pedie-woo-YYYY-MM-DD`

**Enable Auto-Snapshots:**

1. Lightsail Console → Your Instance → **Snapshots**
2. Click **Enable automatic snapshots**
3. Choose time: Early morning (low traffic)

### 13.3 Weekly Maintenance Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│                 WEEKLY MAINTENANCE CHECKLIST                     │
├─────────────────────────────────────────────────────────────────┤
│ □ 1. Check backup status (UpdraftPlus → Last backup date)       │
│ □ 2. Update plugins (if updates available)                       │
│ □ 3. Update WordPress core (if update available)                 │
│ □ 4. Update theme (if update available)                          │
│ □ 5. Review Wordfence scan results                               │
│ □ 6. Check server resources: ssh → htop, df -h                   │
│ □ 7. Review orders and sync inventory                            │
│ □ 8. Test checkout flow (optional but recommended)               │
│ □ 9. Check SSL certificate expiry (>30 days remaining)           │
│ □ 10. Review /home/bitnami/logs/wp-cron.log for errors           │
└─────────────────────────────────────────────────────────────────┘
```

### 13.4 Update Procedure

> ⚠️ **Always backup before updating!**

1. Create a backup (UpdraftPlus → Backup Now)
2. Update plugins one at a time
3. Test site after each major update
4. If something breaks:
   - Try deactivating the last updated plugin
   - Or restore from backup

### 13.5 Database Maintenance

**Monthly database optimization:**

> ⚠️ **WARNING:** These commands modify your database. Always backup first!

```bash
# SSH into server
ssh -i pedie-woo.pem bitnami@YOUR_STATIC_IP

# Navigate to WordPress directory
cd /opt/bitnami/wordpress

# Verify WP-CLI exists and is executable
if [[ ! -x "./wp-cli.phar" ]]; then
    echo "ERROR: wp-cli.phar not found or not executable at $(pwd)"
    echo "Download from: https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar"
    exit 1
fi

# BACKUP FIRST - export database before any changes
echo "Creating database backup..."
./wp-cli.phar db export /home/bitnami/backups/db-backup-$(date +%Y%m%d-%H%M%S).sql
echo "Backup saved to /home/bitnami/backups/"

# Optimize database tables (reduces bloat)
./wp-cli.phar db optimize
```

> 💡 **Note:** Use `wp-cli db optimize` instead of direct MySQL commands to avoid exposing credentials in command history.

**Monthly cleanup tasks:**

1. **Delete spam comments:**
   - **Comments** → **Spam** → **Empty Spam**

2. **Delete old post revisions (safe batch method):**

   ```bash
   cd /opt/bitnami/wordpress

   # First, count how many revisions exist
   REVISION_COUNT=$(./wp-cli.phar post list --post_type=revision --format=count)
   echo "Found $REVISION_COUNT revisions to delete"

   # If more than 100 revisions, delete in batches to avoid timeout
   if [[ $REVISION_COUNT -gt 100 ]]; then
       echo "Deleting in batches of 100..."
       ITERATION=0
       MAX_ITERATIONS=1000
       while true; do
           # Safety counter to prevent runaway loops
           ((ITERATION++))
           if [[ $ITERATION -ge $MAX_ITERATIONS ]]; then
               echo "ERROR: Exceeded maximum iterations ($MAX_ITERATIONS). Exiting to prevent runaway loop."
               exit 1
           fi

           # Fetch at most 100 revision IDs
           BATCH_IDS=$(./wp-cli.phar post list --post_type=revision --posts_per_page=100 --format=ids)

           # Break if no more revisions
           if [[ -z "$BATCH_IDS" ]]; then
               echo "All revisions deleted."
               break
           fi

           # Delete this batch
           ./wp-cli.phar post delete $BATCH_IDS --force
           if [[ $? -ne 0 ]]; then
               echo "ERROR: Failed to delete batch. Command exited with non-zero status."
               exit 1
           fi

           # Update remaining count
           REVISION_COUNT=$(./wp-cli.phar post list --post_type=revision --format=count)
           echo "Batch deleted (iteration $ITERATION). Remaining: $REVISION_COUNT"

           # Brief pause to avoid database overload
           sleep 1
       done
   elif [[ $REVISION_COUNT -gt 0 ]]; then
       # Small number, delete all at once
       ./wp-cli.phar post delete $(./wp-cli.phar post list --post_type=revision --format=ids) --force
   else
       echo "No revisions to delete"
   fi
   ```

3. **Clean transients:**
   ```bash
   ./wp-cli.phar transient delete --expired
   ```

> 💡 **Optional:** Install **WP-Optimize** plugin for GUI-based database cleanup.

### 13.6 Test Backup Restoration (Quarterly)

> ⚠️ **Critical:** Backups are useless if you can't restore from them. Test quarterly.

**Quarterly Restoration Test:**

1. **Create test environment:**
   - Go to Lightsail Console → **Snapshots**
   - Create snapshot from production: `pedie-woo-test-YYYY-MM-DD`
   - Launch new instance from snapshot (use $7 plan temporarily)
   - Attach temporary static IP

2. **Test UpdraftPlus restoration:**
   - SSH into test instance
   - Access WordPress admin (use IP address directly)
   - Go to **Settings** → **UpdraftPlus Backups**
   - Click **Restore** on latest backup
   - Select all components: Plugins, Themes, Uploads, Database
   - Complete restoration

3. **Verify functionality:**
   - [ ] Site loads without errors
   - [ ] All plugins activate correctly
   - [ ] Products display properly
   - [ ] Test checkout flow (don't complete real payment)
   - [ ] Database queries execute without errors
   - [ ] Images/uploads display correctly

4. **Document any issues:**
   - Note any errors or missing data
   - Update backup configuration if needed

5. **Tear down test environment:**
   - Delete test instance (Lightsail Console)
   - Delete test snapshot
   - Release temporary static IP

**Quarterly Maintenance Checklist:**

```
┌─────────────────────────────────────────────────────────────────┐
│                 QUARTERLY MAINTENANCE CHECKLIST                  │
├─────────────────────────────────────────────────────────────────┤
│ □ 1. Test full site restoration from backup                     │
│ □ 2. Verify all plugins activate after restore                  │
│ □ 3. Test checkout flow on restored site                        │
│ □ 4. Confirm database queries execute without errors            │
│ □ 5. Review and update emergency recovery documentation         │
│ □ 6. Check SSL certificate expiry (>60 days remaining)          │
│ □ 7. Review server metrics and consider instance upgrade        │
│ □ 8. Audit administrator accounts for unauthorized access       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Quick Reference Commands

```bash
# SSH into server
ssh -i pedie-woo.pem bitnami@YOUR_STATIC_IP

# Check disk space
df -h

# Check memory usage
free -h

# Monitor processes
htop

# Restart all Bitnami services
sudo /opt/bitnami/ctlscript.sh restart

# Restart only Apache
sudo /opt/bitnami/ctlscript.sh restart apache

# Restart only MariaDB
sudo /opt/bitnami/ctlscript.sh restart mariadb

# View Apache error logs
sudo tail -100 /opt/bitnami/apache/logs/error_log

# View WordPress debug log (if enabled)
sudo tail -100 /opt/bitnami/wordpress/wp-content/debug.log

# Check Bitnami service status
sudo /opt/bitnami/ctlscript.sh status
```

### Common Issues & Solutions

<details>
<summary><strong>❌ White Screen of Death (WSOD)</strong></summary>

**Cause:** PHP error, plugin conflict, or memory exhaustion.

**Solution:**

1. Enable WordPress debug mode:

```bash
sudo nano /opt/bitnami/wordpress/wp-config.php
```

Add/modify:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

2. Check the debug log:

```bash
sudo tail -50 /opt/bitnami/wordpress/wp-content/debug.log
```

3. If plugin-related, disable via database or rename plugin folder:

```bash
cd /opt/bitnami/wordpress/wp-content/plugins
sudo mv problematic-plugin problematic-plugin.disabled
```

</details>

<details>
<summary><strong>❌ 503 Service Unavailable</strong></summary>

**Cause:** Server overloaded or services crashed.

**Solution:**

```bash
# Check memory
free -h

# Restart services
sudo /opt/bitnami/ctlscript.sh restart

# If swap is full, check for runaway processes
htop
# Kill any stuck PHP processes
```

</details>

<details>
<summary><strong>❌ Cannot Upload Images (HTTP Error)</strong></summary>

**Cause:** PHP memory limit or file permissions.

**Solution:**

1. Check/increase PHP memory (see Step 4.6)
2. Fix permissions:

```bash
sudo chown -R bitnami:daemon /opt/bitnami/wordpress/wp-content/uploads
sudo chmod -R 775 /opt/bitnami/wordpress/wp-content/uploads
```

</details>

<details>
<summary><strong>❌ WooCommerce Emails Not Sending</strong></summary>

**Cause:** Server mail not configured properly.

**Solution:**

Install SMTP plugin:

1. **Plugins** → **Add New** → Search "WP Mail SMTP"
2. Configure with your email provider (Gmail, Mailgun, etc.)
3. Use Gmail SMTP:
   - SMTP Host: smtp.gmail.com
   - SMTP Port: 587
   - Encryption: TLS
   - Authentication: Yes
   - Username: your-email@gmail.com
   - Password: App-specific password (create in Google account)

</details>

<details>
<summary><strong>❌ Slow Site Performance</strong></summary>

**Solutions:**

1. Check caching is enabled (WP Super Cache)
2. Optimize images (Smush plugin)
3. Reduce active plugins
4. Check htop for high CPU/memory usage
5. Consider upgrading instance if traffic increases

</details>

<details>
<summary><strong>❌ IntaSend Payment Failed</strong></summary>

**Causes:** Invalid API keys, test mode mismatch, or network issues.

**Solution:**

1. Verify API keys are correct (no extra spaces)
2. Ensure test mode matches your keys (test keys = test mode ON)
3. Check IntaSend dashboard for error logs
4. Test with minimal cart (single cheap product)

</details>

<details>
<summary><strong>❌ Google Login Not Working</strong></summary>

**Causes:** OAuth misconfiguration or redirect URI mismatch.

**Solution:**

1. Verify redirect URI in Google Console matches exactly: `https://pedie.tech`
2. Ensure Google Identity Toolkit API is enabled (not deprecated Google+ API)
3. Check OAuth consent screen is configured with correct scopes (openid, email, profile)
4. Check if popup blockers are interfering
5. Clear browser cache and try again

</details>

---

## 📚 Appendix: Plugin Reference

### Essential Plugins (Install All)

| Plugin                      | Purpose                 | Free Tier       |
| --------------------------- | ----------------------- | --------------- |
| WooCommerce                 | eCommerce core          | ✅ Full         |
| Kadence Blocks              | Page builder blocks     | ✅ Full         |
| IntaSend Payment            | M-Pesa + Card payments  | ✅ Full         |
| Pre-Orders for WooCommerce  | Pre-order functionality | ✅ Full         |
| Deposits & Partial Payments | 5% deposit collection   | ✅ Full         |
| Super Socializer            | Google Sign-In          | ✅ Full         |
| FlexStock                   | Google Sheets inventory | ✅ 500 products |
| Smart Slider 3              | Homepage sliders        | ✅ 3 sliders    |
| Click to Chat               | WhatsApp integration    | ✅ Full         |
| Rank Math                   | SEO optimization        | ✅ Full         |
| Wordfence                   | Security                | ✅ Full         |
| UpdraftPlus                 | Backups                 | ✅ Full         |
| WP Super Cache              | Performance caching     | ✅ Full         |

### Optional Plugins (As Needed)

| Plugin                    | Purpose            | Free Tier         |
| ------------------------- | ------------------ | ----------------- |
| WP Mail SMTP              | Email delivery     | ✅ Full           |
| Smush                     | Image optimization | ✅ 50 images/bulk |
| Mailchimp for WooCommerce | Email marketing    | ✅ Full           |
| YITH WooCommerce Wishlist | Product wishlists  | ✅ Full           |
| Starter Templates         | Template imports   | ✅ Limited        |

---

## 📊 Setup Summary

| Step      | Time         | Description                        |
| --------- | ------------ | ---------------------------------- |
| 1         | 5 min        | Launch Lightsail instance          |
| 2         | 10 min       | Server configuration + swap        |
| 3         | 15 min       | Domain & SSL setup                 |
| 4         | 15 min       | WordPress core configuration       |
| 5         | 15 min       | Kadence theme setup                |
| 6         | 20 min       | WooCommerce configuration          |
| 7         | 15 min       | IntaSend payment gateway           |
| 8         | 15 min       | Preorder & deposit system          |
| 9         | 10 min       | Google Sign-In setup               |
| 10        | 10 min       | Google Sheets inventory sync       |
| 11        | 30 min       | Store design & homepage            |
| 12        | 15 min       | Essential plugins & optimization   |
| 13        | 10 min       | Backup configuration               |
| **Total** | **~3 hours** | Production-ready WooCommerce store |

---

## 📚 Resources

- [WordPress Documentation](https://wordpress.org/documentation/)
- [WooCommerce Documentation](https://woocommerce.com/documentation/)
- [Kadence Theme Documentation](https://www.kadencewp.com/kadence-theme/documentation/)
- [IntaSend Documentation](https://developers.intasend.com/)
- [Bitnami WordPress Documentation](https://docs.bitnami.com/aws/apps/wordpress/)
- [AWS Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)

---

## 🚀 Next Steps After Setup

1. **Add all products** with proper images, descriptions, and pricing
2. **Test complete checkout flow** with a real small purchase
3. **Announce launch** on social media and WhatsApp
4. **Monitor** orders, payments, and any errors
5. **Iterate** on design based on customer feedback

---

**Created:** February 2026  
**Last Updated:** February 2026  
**Author:** Pedie Tech  
**Version:** 1.0

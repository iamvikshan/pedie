# Pedie Tech — Odoo 19 Setup on AWS Lightsail

> **A complete guide to deploying Odoo 19 Community Edition on AWS Lightsail with SSL, Nginx, and Cloudflare**

---

## 📋 Table of Contents

- [Quick Overview](#-quick-overview)
- [Prerequisites](#-prerequisites)
- [Step 1: Launch AWS Lightsail Instance](#step-1-launch-aws-lightsail-instance)
- [Step 2: Configure Firewall](#step-2-configure-firewall)
- [Step 3: Connect via SSH](#step-3-connect-via-ssh)
- [Step 4: Install Odoo 19](#step-4-install-odoo-19)
- [Step 5: Domain & SSL Setup](#step-5-domain--ssl-setup-cloudflare)
- [Step 6: Initial Odoo Configuration](#step-6-initial-odoo-configuration)
- [Step 7: Payment Gateway](#step-7-payment-gateway-pesapalm-pesa)
- [Step 8: Backups & Maintenance](#step-8-backups--maintenance)
- [Troubleshooting](#-troubleshooting)
- [Scaling Guide](#-scaling-guide)

---

## 🎯 Quick Overview

| Component        | Details                     |
| ---------------- | --------------------------- |
| **Platform**     | AWS Lightsail               |
| **OS**           | Ubuntu 24.04 LTS            |
| **Odoo Version** | 19.0 Community Edition      |
| **Web Server**   | Nginx (reverse proxy)       |
| **Database**     | PostgreSQL 16               |
| **SSL**          | Let's Encrypt (via Certbot) |
| **CDN/DNS**      | Cloudflare (Full Strict)    |
| **Monthly Cost** | ~$7 USD                     |

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
│                   Ubuntu 24.04 LTS ($7/mo)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      NGINX                                │  │
│  │              (Reverse Proxy + SSL Termination)            │  │
│  │                    Port 80 → 443                          │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │ localhost:8069                     │
│                            ▼                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     ODOO 19                               │  │
│  │              (Python + PostgreSQL)                        │  │
│  │                    Port 8069                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

Before starting, ensure you have:

- [ ] AWS account with Lightsail access
- [ ] Domain name (e.g., `pedie.tech`)
- [ ] Cloudflare account (free tier works)
- [ ] SSH client (Terminal on Mac/Linux, PuTTY on Windows)
- [ ] ~90 minutes of uninterrupted time

---

## Step 1: Launch AWS Lightsail Instance

### 1.1 Create Instance

1. Navigate to [Lightsail Console](https://lightsail.aws.amazon.com)
2. Click **Create instance**

### 1.2 Instance Configuration

| Setting               | Value                                                                |
| --------------------- | -------------------------------------------------------------------- |
| **Region**            | Europe (Frankfurt) or US East _(closest to Kenya for lower latency)_ |
| **Availability Zone** | Default                                                              |
| **Platform**          | Linux/Unix                                                           |
| **Blueprint**         | OS Only → **Ubuntu 24.04 LTS**                                       |
| **Instance Plan**     | **$7/month** (1 GB RAM, 2 vCPU, 40 GB SSD)                           |
| **Instance Name**     | `pedie`                                                              |

> ⚠️ **Note:** The $7/month plan has limited RAM. We'll add swap memory in [Step 4.4](#44-create-swap-memory) to compensate.

### 1.3 SSH Key Pair

1. Click **Create new key pair**
2. Name it: `pedoo`
3. Download `pedoo.pem` — **save this securely!** (you cannot regenerate it)

### 1.4 Launch & Get Static IP

1. Click **Create instance**
2. Wait 2–3 minutes for the instance to start (green checkmark appears)
3. Go to **Networking** tab → **Create static IP**
4. Name: `pediIP`
5. Attach to your instance

> 📝 **Your Static IP:** `___.___.___.___ ` _(write this down)_

---

## Step 2: Configure Firewall

In the Lightsail console, under your instance's **Networking** tab, add these firewall rules:

| Application   | Protocol | Port | Source   |
| ------------- | -------- | ---- | -------- |
| SSH           | TCP      | 22   | Anywhere |
| HTTP          | TCP      | 80   | Anywhere |
| HTTPS         | TCP      | 443  | Anywhere |
| Custom (Odoo) | TCP      | 8069 | Anywhere |

> 💡 **Tip:** Remove port 8069 after SSL is configured — access will be through Nginx on port 443.

---

## Step 3: Connect via SSH

### macOS / Linux

```bash
# Make key readable (run once)
chmod 400 pedoo.pem

# Connect to server
ssh -i pedoo.pem ubuntu@YOUR_STATIC_IP
```

### VS Code (Any OS)

1. Install **Remote - SSH** extension
2. Press `Ctrl+Shift+P` → `Remote-SSH: Connect to Host`
3. Enter: `ubuntu@YOUR_STATIC_IP`
4. Select your key file when prompted

**Success indicator:**

```
ubuntu@ip-172-31-xx-xx:~$
```

---

## Step 4: Install Odoo 19

### 4.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 4.2 Install Dependencies

```bash
sudo apt install -y \
    git python3-pip python3-venv python3-dev \
    build-essential libpq-dev libldap2-dev libsasl2-dev \
    libxml2-dev libxslt1-dev libssl-dev libffi-dev \
    zlib1g-dev libjpeg-dev libbz2-dev libreadline-dev \
    libsqlite3-dev libharfbuzz-dev libharfbuzz0b \
    wget curl gnupg2 ca-certificates \
    postgresql postgresql-contrib \
    nginx certbot python3-certbot-nginx \
    btop unzip
```

> ⏱️ This takes 2–3 minutes.

### 4.3 Configure PostgreSQL

```bash
# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create Odoo database user
sudo -u postgres createuser --createdb --no-createrole --no-superuser --pwprompt odoo
```

When prompted, enter a **strong password** (e.g., `YourSecurePassword123!`)

> 📝 **Save this password** — you'll need it for the Odoo config file.

### 4.4 Create Swap Memory

> ⚠️ **Critical for $7/month instance:** Swap prevents out-of-memory crashes with limited RAM.

```bash
# Create 3GB swap file
sudo fallocate -l 3G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
sudo cp /etc/fstab /etc/fstab.bak
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap is active
free -h
```

**Expected output:**

```
              total        used        free      shared  buff/cache   available
Mem:          966Mi       XXXMi       XXXMi       XXXMi       XXXMi       XXXMi
Swap:         3.0Gi          0B       3.0Gi
```

### 4.5 Create Odoo Directories

```bash
# Create directories
sudo mkdir -p /opt/odoo /etc/odoo /var/log/odoo

# Set ownership (so we don't need sudo for subsequent commands)
sudo chown -R ubuntu:ubuntu /opt/odoo /etc/odoo /var/log/odoo
```

### 4.6 Install Odoo 19

```bash
# Clone Odoo 19 (no sudo needed - we own the directory)
cd /opt/odoo
git clone https://github.com/odoo/odoo.git --depth 1 --branch 19.0 .

# Create virtual environment
python3 -m venv /opt/odoo/venv

# Activate and install dependencies
source /opt/odoo/venv/bin/activate
pip install --upgrade pip wheel
pip install -r requirements.txt

# Install additional module dependencies
pip install dropbox pyncclient nextcloud-api-wrapper boto3 paramiko

deactivate
```

> ⏱️ This step takes **5–10 minutes**. Be patient.

### 4.7 Install Custom Modules (Optional)

<details>
<summary>Click to expand custom module installation</summary>

```bash
cd /tmp

# Download modules
wget -q 'https://pub-90d0d76b14794ea1be91133a913d1c56.r2.dev/000e6a4bb1f2c910e0c71b115867c9fd?token=1770041180' -O crest_theme_core.zip
wget -q 'https://pub-acaeebdb26c442ce92ef891dfe093492.r2.dev/340a9307a0e7951c57b13249fbb34cdd?token=1770041295' -O theme_crest.zip
wget -q 'https://pub-d0649960c5764caeb533b5a320a963a0.r2.dev/49589d64e2354f4ab32e990569c6cd12?token=1770041374' -O odoo_gpt_chat.zip
wget -q 'https://pub-5b514716c7ca4141ae9bf955611e2f1b.r2.dev/6a8f91225df44f04d4573b2dacb6b14b?token=1770050350' -O jazzy_backend_theme.zip
wget -q 'https://pub-5b514716c7ca4141ae9bf955611e2f1b.r2.dev/fd53e760552fee65a0d91deb459aa601?token=1770074407' -O auto_database_backup.zip
wget -q 'https://pub-acaeebdb26c442ce92ef891dfe093492.r2.dev/f1172e31561eb6eff1bc15af9a41e1f6?token=1770074893' -O website_denomination.zip

# Extract and install each module
for module in crest_theme_core theme_crest odoo_gpt_chat jazzy_backend_theme auto_database_backup website_denomination; do
    unzip -q ${module}.zip && mv ${module} /opt/odoo/addons/ && rm ${module}.zip
done

# Verify installation
ls -la /opt/odoo/addons/ | grep -E 'crest|jazzy|odoo_gpt|auto_database|website_denomination'
```

</details>

### 4.8 Create Odoo Configuration

```bash
sudo nano /etc/odoo/odoo.conf
```

Paste the following configuration:

```ini
[options]
; === Security ===
admin_passwd = YourMasterPassword!Change-This

; === Database ===
db_host = localhost
db_port = 5432
db_user = odoo
db_password = YourPostgresPassword
db_name = False

; === Paths ===
addons_path = /opt/odoo/addons,/opt/odoo/odoo/addons

; === Server ===
http_port = 8069
proxy_mode = True

; === Performance (optimized for 1GB RAM) ===
workers = 2
max_cron_threads = 1
limit_memory_hard = 1677721600
limit_memory_soft = 629145600
limit_time_cpu = 600
limit_time_real = 1200

; === Logging ===
logfile = /var/log/odoo/odoo.log
log_level = warn
```

> ⚠️ **Security:** Replace `admin_passwd` and `db_password` with your own secure passwords!

Save and exit: `Ctrl+O` → `Enter` → `Ctrl+X`

### 4.9 Set Permissions

```bash
# Set config file permissions (directories already owned by ubuntu from 4.5)
sudo chown ubuntu:ubuntu /etc/odoo/odoo.conf
sudo chmod 640 /etc/odoo/odoo.conf
```

### 4.10 Create Systemd Service

```bash
sudo nano /etc/systemd/system/odoo.service
```

Paste:

```ini
[Unit]
Description=Odoo 19
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
ExecStart=/opt/odoo/venv/bin/python3 /opt/odoo/odoo-bin -c /etc/odoo/odoo.conf
WorkingDirectory=/opt/odoo
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Save and exit.

### 4.11 Start Odoo

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable and start Odoo
sudo systemctl enable odoo
sudo systemctl start odoo

# Check status
sudo systemctl status odoo
```

**Verify Odoo is running:**

```bash
sudo ss -tlnp | grep 8069
```

Expected output:

```
LISTEN  0  128  0.0.0.0:8069  0.0.0.0:*  users:(("python3",pid=XXXX,fd=X))
```

### 4.12 Test Initial Access

Open in browser: `http://YOUR_STATIC_IP:8069`

You should see the Odoo database creation page! 🎉

---

## Step 5: Domain & SSL Setup (Cloudflare)

### Phase 1: Configure Cloudflare DNS

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain (e.g., `pedie.tech`)
3. Go to **DNS** → **Records**
4. Add these A records:

| Type | Name  | Content          | Proxy Status                 |
| ---- | ----- | ---------------- | ---------------------------- |
| A    | `@`   | `YOUR_STATIC_IP` | **DNS only** (gray cloud) ⚠️ |
| A    | `www` | `YOUR_STATIC_IP` | **DNS only** (gray cloud) ⚠️ |

> ⚠️ **Important:** Keep proxy OFF (gray cloud) until SSL is configured! This allows Certbot to verify your domain.

### Phase 2: Generate SSL Certificate

```bash
sudo certbot --nginx -d pedie.tech -d www.pedie.tech
```

- Enter your email when prompted
- Agree to terms (`Y`)
- Choose to redirect HTTP to HTTPS (recommended: `2`)

**Success message:**

```
Congratulations! Your certificate and chain have been saved at:
/etc/letsencrypt/live/pedie.tech/fullchain.pem
```

### Phase 3: Configure Nginx

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Create Odoo config
sudo nano /etc/nginx/sites-available/odoo
```

Paste:

```nginx
# Upstream Odoo Server
upstream odoo {
    server 127.0.0.1:8069;
}

upstream odoo-chat {
    server 127.0.0.1:8072;
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name pedie.tech www.pedie.tech;
    return 301 https://$host$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name pedie.tech www.pedie.tech;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/pedie.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pedie.tech/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy Timeouts
    proxy_read_timeout 720s;
    proxy_connect_timeout 720s;
    proxy_send_timeout 720s;

    # Logging
    access_log /var/log/nginx/odoo.access.log;
    error_log /var/log/nginx/odoo.error.log;

    # Gzip Compression
    gzip on;
    gzip_types text/css text/plain application/json application/javascript;

    # Main Location
    location / {
        proxy_pass http://odoo;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }

    # Longpolling (for live chat)
    location /longpolling {
        proxy_pass http://odoo-chat;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Files Caching
    location ~* /web/static/ {
        proxy_cache_valid 200 90m;
        proxy_buffering on;
        expires 90d;
        proxy_pass http://odoo;
    }

    # Block common exploits
    location ~* \.(git|env|bak|old|sql)$ {
        deny all;
    }
}
```

Save and exit.

**Enable and test configuration:**

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/odoo /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Phase 4: Enable Cloudflare Proxy

1. Go back to **Cloudflare DNS**
2. Edit both A records → Change to **Proxied** (orange cloud) ☁️
3. Go to **SSL/TLS** → Set mode to **Full (Strict)**

### Phase 5: Verify Setup

```bash
curl -I https://pedie.tech
```

Expected response:

```
HTTP/2 200
server: cloudflare
```

✅ **Test in browser:**

- Open `http://pedie.tech` → Should auto-redirect to `https://pedie.tech`
- Check the lock icon 🔒 → Connection is secure
- Navigate through Odoo menus → Should stay on HTTPS

---

## Step 6: Initial Odoo Configuration

### 6.1 Create Database

1. Go to `https://pedie.tech`
2. Fill in the database creation form:

| Field           | Value                           |
| --------------- | ------------------------------- |
| Master Password | Your `admin_passwd` from config |
| Database Name   | `pedi_tech_prod`                |
| Email           | `hello@pedie.tech`              |
| Password        | Your admin login password       |
| Language        | English                         |
| Country         | Kenya                           |

3. Click **Create Database** (wait 2–3 minutes)

### 6.2 Install Essential Modules

Navigate to **Apps** and install:

| Module     | Purpose                  |
| ---------- | ------------------------ |
| Website    | Storefront               |
| eCommerce  | Shopping cart & checkout |
| Sales      | Order management         |
| Inventory  | Stock tracking           |
| CRM        | Customer management      |
| Accounting | Invoicing & payments     |

> 💡 **Tip:** Wait for each module to fully install before installing the next one.

### 6.3 Configure Company

**Settings** → **Users & Companies** → **Companies** → Edit:

| Field        | Value            |
| ------------ | ---------------- |
| Company Name | Pedie Tech       |
| Email        | hello@pedie.tech |
| Phone        | +254 XXX XXX XXX |
| Currency     | KES              |
| Country      | Kenya            |

### 6.4 Configure Website Settings

**Website** → **Configuration** → **Settings**:

| Setting        | Value                     |
| -------------- | ------------------------- |
| Website Name   | Pedie Tech                |
| Website Domain | pedie.tech                |
| Tagline        | Your Trusted Tech Peddler |

---

## Step 7: Payment Gateway (Pesapal/M-Pesa)

### 7.1 Get Pesapal Credentials

1. Register at [Pesapal Developer Portal](https://developer.pesapal.com)
2. Create an application
3. Get your **Consumer Key** and **Consumer Secret**

### 7.2 Configure in Odoo

**Accounting** → **Configuration** → **Payment Providers** → **Create**

| Field           | Value                       |
| --------------- | --------------------------- |
| Name            | M-Pesa (Pesapal)            |
| Provider        | Pesapal                     |
| State           | Test (switch to Live later) |
| Consumer Key    | _from Pesapal_              |
| Consumer Secret | _from Pesapal_              |

---

## Step 8: Backups & Maintenance

### Automatic Database Backup

If you installed the `auto_database_backup` module:

1. Go to **Settings** → **Database Backup**
2. Configure backup destination (S3, Dropbox, etc.)
3. Set backup frequency (daily recommended)

### Manual Backup via Lightsail

1. Go to Lightsail Console → Your instance → **Snapshots**
2. Click **Create snapshot**
3. Name: `pedie-backup-YYYY-MM-DD`

### Enable Auto-Snapshots

**Lightsail Console** → **Your Instance** → **Snapshots** → **Enable automatic snapshots**

### SSL Certificate Renewal

Certbot automatically renews certificates. Verify the renewal process works:

```bash
sudo certbot renew --dry-run
```

---

## 🔧 Troubleshooting

### Quick Reference Commands

```bash
# View Odoo logs (live)
sudo journalctl -u odoo -f

# View Odoo log file
sudo tail -100 /var/log/odoo/odoo.log

# Restart all services
sudo systemctl restart postgresql nginx odoo

# Check service status
sudo systemctl status odoo

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
btop
```

### Common Issues & Solutions

<details>
<summary><strong>❌ 502 Bad Gateway</strong></summary>

**Cause:** Odoo service isn't running.

**Solution:**

```bash
sudo systemctl start odoo
sudo systemctl status odoo
```

If it fails to start, check logs:

```bash
sudo journalctl -u odoo -n 50
```

</details>

<details>
<summary><strong>❌ Odoo crashes / Out of Memory</strong></summary>

**Cause:** Insufficient RAM and swap not configured.

**Solution:** Check swap is enabled:

```bash
free -h
```

If swap shows `0B`, run the swap setup commands from [Step 4.4](#44-create-swap-memory).

</details>

<details>
<summary><strong>❌ Can't access port 8069</strong></summary>

**Causes:** Firewall blocking or Odoo not running.

**Solution:**

1. Check Lightsail firewall: Console → Networking → Verify port 8069 is listed
2. Check Odoo status: `sudo systemctl status odoo`
3. Check logs: `sudo tail -f /var/log/odoo/odoo.log`
</details>

<details>
<summary><strong>❌ Mixed content warnings (HTTP/HTTPS)</strong></summary>

**Cause:** `proxy_mode` not enabled in Odoo config.

**Solution:**

```bash
sudo nano /etc/odoo/odoo.conf
# Ensure this line exists under [options]:
# proxy_mode = True

sudo systemctl restart odoo
```

</details>

<details>
<summary><strong>❌ Slow performance</strong></summary>

**Solutions:**

1. Check memory: `free -h` (swap should be available)
2. Check CPU: `btop`
3. Reduce workers in `/etc/odoo/odoo.conf` to `1`
4. Consider upgrading to $12/month plan (2GB RAM)
</details>

<details>
<summary><strong>❌ Products not showing on website</strong></summary>

**Solutions:**

1. Ensure **Published** checkbox is checked on the product
2. Ensure category is set to **Visible on Website**
3. Clear browser cache (`Ctrl+Shift+Delete`)
4. Check website settings: **Website** → **Configuration** → **Settings**
</details>

---

## 📈 Scaling Guide

### When to Upgrade

| Orders/Month | Recommended Action             |
| ------------ | ------------------------------ |
| 0–50         | Current setup is sufficient    |
| 50–200       | Upgrade to $12/month (2GB RAM) |
| 200–500      | Upgrade to $24/month (4GB RAM) |
| 500+         | Consider dedicated EC2 + RDS   |

### Performance Optimization Tips

1. **Enable Redis caching** for sessions
2. **Use S3** for attachment storage
3. **Enable CloudFront CDN** for static assets
4. **Regular database maintenance** (vacuum, reindex)

---

## 📊 Setup Summary

| Step      | Time        | Description                    |
| --------- | ----------- | ------------------------------ |
| 1         | 5 min       | Launch Lightsail instance      |
| 2         | 2 min       | Configure firewall             |
| 3         | 1 min       | SSH connection                 |
| 4         | 25 min      | Install Odoo 19 + dependencies |
| 5         | 15 min      | Domain & SSL setup             |
| 6         | 10 min      | Initial Odoo configuration     |
| 7         | 10 min      | Payment gateway setup          |
| 8         | 5 min       | Backup configuration           |
| **Total** | **~75 min** | Production-ready Odoo store    |

---

## 📚 Resources

- [Odoo 19 Documentation](https://www.odoo.com/documentation/19.0/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [AWS Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)
- [Cloudflare SSL Documentation](https://developers.cloudflare.com/ssl/)
- [Pesapal Developer Docs](https://developer.pesapal.com/)

---

<div align="center">

**Document Version:** 2.0  
**Last Updated:** February 4, 2026  
**Author:** Pedie Tech Team  
**Estimated Monthly Cost:** ~$7 USD

---

_Pedie Tech — Your Trusted Tech Peddler_

</div>

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

| Setting               | Value                                                                                                                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Region**            | Africa (Cape Town) - `af-south-1` or Middle East (Bahrain) - `me-south-1` _(geographically closest to Kenya)_. If these regions are unavailable in Lightsail, choose the nearest available region (e.g., Europe Frankfurt or US East). |
| **Availability Zone** | Default                                                                                                                                                                                                                                |
| **Platform**          | Linux/Unix                                                                                                                                                                                                                             |
| **Blueprint**         | OS Only → **Ubuntu 24.04 LTS**                                                                                                                                                                                                         |
| **Instance Plan**     | **$7/month** (1 GB RAM, 2 vCPU, 40 GB SSD)                                                                                                                                                                                             |
| **Instance Name**     | `pedie`                                                                                                                                                                                                                                |

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

> 💡 **Tip:** Remove port 8069 after SSL is configured — access will be through Nginx on port 443. See [Phase 6: Secure Port 8069](#phase-6-secure-port-8069) for full instructions.

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

### 4.5 Create Odoo User & Directories

```bash
# Create a dedicated system user for Odoo (no sudo/SSH access)
# This also creates the /opt/odoo home directory
sudo adduser --system --group --home /opt/odoo --shell /usr/sbin/nologin odoo

# Create additional directories
sudo mkdir -p /etc/odoo /var/log/odoo

# Set ownership to the dedicated odoo user
sudo chown -R odoo:odoo /opt/odoo /etc/odoo /var/log/odoo
```

> 🔒 **Security:** Running Odoo under a dedicated `odoo` user (instead of `ubuntu`) follows the principle of least privilege. The `--shell /usr/sbin/nologin` flag prevents interactive login. For maintenance tasks, use `sudo -u odoo <command>`.

### 4.6 Install Odoo 19

```bash
# Clone Odoo 19 (running as the dedicated odoo user)
cd /opt/odoo
sudo -u odoo git clone https://github.com/odoo/odoo.git --depth 1 --branch 19.0 .

# Create virtual environment
sudo -u odoo python3 -m venv /opt/odoo/venv

# Install dependencies (using venv pip directly, no activate needed)
sudo -u odoo /opt/odoo/venv/bin/pip install --upgrade pip wheel
sudo -u odoo /opt/odoo/venv/bin/pip install -r requirements.txt

# Install additional module dependencies
sudo -u odoo /opt/odoo/venv/bin/pip install dropbox pyncclient nextcloud-api-wrapper boto3 paramiko
```

> ⚠️ **Compatibility:** The additional packages (`dropbox`, `pyncclient`, `nextcloud-api-wrapper`, `boto3`, `paramiko`) are installed without version pins. Before deploying to production, validate that the installed versions are compatible with Odoo 19. Consider maintaining a `requirements-extra.txt` file with pinned versions tested against your Odoo deployment.

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
    unzip -q ${module}.zip && sudo mv ${module} /opt/odoo/addons/ && rm ${module}.zip
done

# Set ownership of new addons to odoo user
sudo chown -R odoo:odoo /opt/odoo/addons/

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
admin_passwd = REPLACE_WITH_STRONG_PASSWORD_MIN_20_CHARS
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
workers = 1
max_cron_threads = 1
gevent_port = 8072
limit_memory_hard = 1677721600
limit_memory_soft = 629145600
limit_time_cpu = 600
limit_time_real = 1200

; === Logging ===
logfile = /var/log/odoo/odoo.log
log_level = warn
```

> ⚠️ **Security:** Replace `admin_passwd` and `db_password` with your own secure passwords!

> � **Security — `db_name = False` (Multi-Database Mode):**
> Setting `db_name = False` enables multi-database mode, which exposes the database manager at `/web/database/manager` (e.g., `https://pedie.tech/web/database/manager`). This allows creating, duplicating, and dropping databases via the web interface.
>
> **Recommendations:**
>
> - Set a **strong `admin_passwd`** (the master password protects database management operations)
> - **Restrict access** to `/web/database/manager` via Nginx IP allowlisting or firewall rules
> - If you only run a single database, set `db_name = your_database_name` and add `list_db = False` to disable the database manager entirely
> - Never leave `admin_passwd` as the default or a weak value in production

> �💡 **Memory Tip:** After starting Odoo, monitor RAM usage with `free -h` or `btop`. Only increase `workers` to `2` if you have >200MB free after startup to avoid swap thrashing on 1GB instances.

Save and exit: `Ctrl+O` → `Enter` → `Ctrl+X`

### 4.9 Set Permissions

```bash
# Set config file permissions (directories already owned by odoo from 4.5)
sudo chown odoo:odoo /etc/odoo/odoo.conf
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
User=odoo
Group=odoo
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
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self';" always;

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

### Phase 6: Secure Port 8069

Now that SSL is configured, remove the direct Odoo access through port 8069 so all traffic flows through Nginx on port 443:

1. Go to **Lightsail Console** → **Your Instance** → **Networking** tab
2. Find the **Custom (Odoo) TCP 8069** rule in the firewall table
3. Click the menu (⋮) next to the rule and select **Delete**
4. Confirm deletion

> ✅ Odoo is now only accessible via HTTPS through Nginx. Direct access to port 8069 is blocked.

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

### PostgreSQL-Native Backup

Create an executable backup script that dumps the Odoo database daily and rotates old backups:

```bash
sudo nano /usr/local/bin/odoo-db-backup.sh
```

Paste:

```bash
#!/bin/bash
# Odoo PostgreSQL Backup Script
BACKUP_DIR="/opt/odoo/backups"
DB_NAME="odoo"  # Replace with your database name
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Dump database (gzipped)
sudo -u postgres pg_dump "$DB_NAME" | gzip > "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Delete backups older than retention period
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "$(date): Backup completed — ${DB_NAME}_${TIMESTAMP}.sql.gz" >> /var/log/odoo/backup.log
```

Make the script executable and create the backup directory:

```bash
sudo chmod +x /usr/local/bin/odoo-db-backup.sh
sudo mkdir -p /opt/odoo/backups
sudo chown odoo:odoo /opt/odoo/backups
```

Add a cron entry to run the backup daily at 02:00:

```bash
sudo crontab -e
```

Add this line:

```
0 2 * * * /usr/local/bin/odoo-db-backup.sh
```

> 💡 **Tip:** Test the script manually first with `sudo /usr/local/bin/odoo-db-backup.sh` and verify a `.sql.gz` file appears in `/opt/odoo/backups/`.

### Log Rotation

Create a logrotate configuration to manage Odoo log files:

```bash
sudo nano /etc/logrotate.d/odoo
```

Paste:

```
/var/log/odoo/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    postrotate
        systemctl reload odoo > /dev/null 2>&1 || true
    endscript
}
```

> 💡 **Verify:** Test the configuration with `sudo logrotate -d /etc/logrotate.d/odoo` (dry-run mode).

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

### System Monitoring

Set up proactive monitoring to detect issues before they affect users.

**Install Prometheus Node Exporter:**

```bash
sudo apt install -y prometheus-node-exporter
sudo systemctl enable prometheus-node-exporter
sudo systemctl start prometheus-node-exporter
```

> 💡 Node Exporter exposes system metrics on port `9100`. Connect it to a Prometheus/Grafana instance for dashboards, or use it with external monitoring services.

**Disk Space Check Script:**

```bash
sudo nano /usr/local/bin/check-disk-space.sh
```

Paste:

```bash
#!/bin/bash
# Alert when disk usage exceeds threshold
THRESHOLD=80  # percent
MAILTO="admin@pedie.tech"  # Replace with your email

USAGE=$(df / | tail -1 | awk '{print $5}' | tr -d '%')

if [ "$USAGE" -ge "$THRESHOLD" ]; then
    echo "⚠️ Disk usage at ${USAGE}% on $(hostname)" | \
        mail -s "Disk Alert: $(hostname)" "$MAILTO"
fi
```

```bash
sudo chmod +x /usr/local/bin/check-disk-space.sh
```

Add a cron entry to check every 6 hours:

```bash
# Add to root's crontab (sudo crontab -e)
0 */6 * * * /usr/local/bin/check-disk-space.sh
```

> 💡 **Email Setup:** For the `mail` command to work, install a mail utility: `sudo apt install -y mailutils` and configure an SMTP relay (e.g., AWS SES, SendGrid) via `/etc/ssmtp/ssmtp.conf` or Postfix.

**External Uptime Monitoring:**

Configure [UptimeRobot](https://uptimerobot.com/) (free tier available) for:

| Monitor Type | Target                         | Interval | Alert                |
| ------------ | ------------------------------ | -------- | -------------------- |
| HTTP(s)      | `https://pedie.tech`           | 5 min    | Email/Slack/Telegram |
| Port         | `pedie.tech:443`               | 5 min    | Email                |
| Keyword      | `https://pedie.tech/web/login` | 5 min    | Check for "Log in"   |

Also set up **SSL expiration alerts** in UptimeRobot or use Certbot's built-in check:

```bash
# Check SSL expiry (add to weekly cron)
openssl s_client -connect pedie.tech:443 -servername pedie.tech 2>/dev/null | \
    openssl x509 -noout -enddate
```

**Log Alert Cron Entry:**

Scan Odoo logs for errors and send alerts:

```bash
sudo nano /usr/local/bin/check-odoo-errors.sh
```

Paste:

```bash
#!/bin/bash
# Scan Odoo log for recent errors
LOG="/var/log/odoo/odoo.log"
MAILTO="admin@pedie.tech"  # Replace with your email
ERRORS=$(grep -c "ERROR" "$LOG" 2>/dev/null || echo 0)

if [ "$ERRORS" -gt 0 ]; then
    tail -50 "$LOG" | grep "ERROR" | \
        mail -s "Odoo Errors Detected: ${ERRORS} on $(hostname)" "$MAILTO"
fi
```

```bash
sudo chmod +x /usr/local/bin/check-odoo-errors.sh
```

```bash
# Add to root's crontab — run every hour
0 * * * * /usr/local/bin/check-odoo-errors.sh
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

#### Implementing Redis Session Caching

Redis offloads session storage from PostgreSQL, reducing database load and improving response times.

**Install Redis and the Python client:**

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install the Python Redis client in the Odoo venv
sudo -u odoo /opt/odoo/venv/bin/pip install redis
```

**Configure Odoo** — add these keys to `/etc/odoo/odoo.conf`:

```ini
; === Session Store (Redis) ===
session_store = redis
redis_host = 127.0.0.1
redis_port = 6379
```

Restart Odoo to apply: `sudo systemctl restart odoo`

> 💡 **Verify:** Run `redis-cli ping` — you should get `PONG`. After restarting Odoo, check `redis-cli keys '*'` to confirm sessions are being stored.

#### Configure S3 for Attachments

Offloading file attachments to Amazon S3 frees local disk space and improves scalability.

**1. Create an S3 bucket and IAM user:**

- Create a private S3 bucket (e.g., `pedie-odoo-attachments`) in your preferred AWS region
- Create an IAM user with programmatic access and attach a policy granting `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, and `s3:ListBucket` on the bucket
- Note the **Access Key ID** and **Secret Access Key**

**2. Install boto3** (if not already installed):

```bash
sudo -u odoo /opt/odoo/venv/bin/pip install boto3
```

**3. Configure Odoo** — add these keys to `/etc/odoo/odoo.conf`:

```ini
; === S3 Attachment Storage ===
ir_attachment_location = s3
s3_access_key = YOUR_AWS_ACCESS_KEY_ID
s3_secret_key = YOUR_AWS_SECRET_ACCESS_KEY
s3_bucket = pedie-odoo-attachments
s3_region = af-south-1
data_dir = /opt/odoo/.local/share/Odoo
```

Restart Odoo to apply: `sudo systemctl restart odoo`

> ⚠️ **Security:** Never commit AWS credentials to version control. Consider using IAM instance roles instead of access keys when running on AWS infrastructure.

#### Database Maintenance

Regular PostgreSQL maintenance prevents performance degradation from table bloat and index fragmentation.

**Run maintenance commands:**

```bash
# VACUUM ANALYZE — reclaims storage and updates query planner statistics
sudo -u postgres psql -d odoo -c "VACUUM ANALYZE;"

# REINDEX — rebuilds indexes to eliminate bloat
sudo -u postgres psql -d odoo -c "REINDEX DATABASE odoo;"
```

**Recommended cadence:**

| Task             | Frequency | Command                                                     |
| ---------------- | --------- | ----------------------------------------------------------- |
| `VACUUM ANALYZE` | Weekly    | `sudo -u postgres psql -d odoo -c "VACUUM ANALYZE;"`        |
| `REINDEX`        | Monthly   | `sudo -u postgres psql -d odoo -c "REINDEX DATABASE odoo;"` |

Add a weekly cron entry for VACUUM:

```bash
# Add to postgres user's crontab
sudo -u postgres crontab -e
```

```
# Weekly VACUUM ANALYZE — Sundays at 03:00
0 3 * * 0 psql -d odoo -c "VACUUM ANALYZE;" >> /var/log/odoo/vacuum.log 2>&1
```

> 💡 **CloudFront CDN:** For static assets, enable Amazon CloudFront or Cloudflare in front of your domain to cache CSS, JS, and images at edge locations. Configure the CDN to forward requests to your Odoo origin and set appropriate cache headers.

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

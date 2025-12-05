# 🚀 PROFITHACK AI - Migration Guide (Replit → Self-Hosted)
**Timeline:** Ready to migrate by next week  
**Difficulty:** Intermediate  
**Estimated Time:** 4-6 hours

---

## 📋 **PRE-MIGRATION CHECKLIST**

### Required Before You Start
- [ ] Domain name registered (profithackai.com)
- [ ] Cloud hosting account (AWS, Google Cloud, DigitalOcean, or Linode)
- [ ] Database hosting (Neon PostgreSQL or similar)
- [ ] Object storage provider (AWS S3, Cloudflare R2, or Backblaze B2)
- [ ] Email service (SendGrid, AWS SES, or Postmark)
- [ ] Payment provider accounts (PayPal, Square, Payoneer, etc.)
- [ ] SSL certificate (Let's Encrypt free or paid)

---

## 📦 **STEP 1: EXPORT FROM REPLIT**

### Option A: Download as ZIP (Recommended)
1. **Go to your Replit project**
2. **Click the three dots (⋮) menu**
3. **Select "Download as ZIP"**
4. **Extract the ZIP file to your local machine**

### Option B: Use Git/GitHub
```bash
# In Replit Shell
git init
git add .
git commit -m "Export PROFITHACK AI from Replit"
git remote add origin https://github.com/yourusername/profithack-ai.git
git push -u origin main
```

Then clone on your server:
```bash
git clone https://github.com/yourusername/profithack-ai.git
cd profithack-ai
```

### Option C: Use rsync/SSH (Advanced)
```bash
# From your local machine
rsync -avz --progress replit-user@your-repl.replit.dev:/home/runner/your-repl/ ./profithack-ai/
```

---

## 🖥️ **STEP 2: SET UP CLOUD SERVER**

### Recommended Providers
1. **DigitalOcean Droplet** - $12/mo (4GB RAM, 2 vCPUs)
2. **AWS EC2** - t3.medium instance (~$30/mo)
3. **Google Cloud Compute Engine** - e2-medium (~$25/mo)
4. **Linode** - Shared CPU 4GB (~$24/mo)

### Server Requirements
- **OS:** Ubuntu 22.04 LTS (recommended)
- **RAM:** Minimum 4GB (8GB recommended for production)
- **Storage:** 40GB SSD minimum
- **CPU:** 2 cores minimum

### Initial Server Setup
```bash
# Connect to your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install PostgreSQL client
apt install -y postgresql-client

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Certbot (SSL certificates)
apt install -y certbot python3-certbot-nginx

# Create app user (security best practice)
adduser --disabled-password --gecos "" profithack
```

---

## 📂 **STEP 3: DEPLOY APPLICATION**

### Upload Your Code
```bash
# Option 1: Using SCP from local machine
scp -r ./profithack-ai root@your-server-ip:/home/profithack/

# Option 2: Clone from Git on server
su - profithack
git clone https://github.com/yourusername/profithack-ai.git
cd profithack-ai
```

### Install Dependencies
```bash
cd /home/profithack/profithack-ai
npm install --production
```

### Build Frontend
```bash
npm run build
```

---

## 🗄️ **STEP 4: SET UP DATABASE**

### Option A: Use Neon PostgreSQL (Easiest)
1. Keep your existing Neon database from Replit
2. Update `DATABASE_URL` in your environment variables
3. **Done!** No migration needed.

### Option B: Self-Hosted PostgreSQL
```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE profithack_ai;
CREATE USER profithack WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE profithack_ai TO profithack;
\q

# Export data from Replit database
# In Replit Shell:
pg_dump $DATABASE_URL > profithack_backup.sql

# Import to new server
psql -U profithack -d profithack_ai < profithack_backup.sql
```

### Run Migrations
```bash
cd /home/profithack/profithack-ai
npm run db:push
```

---

## 🔐 **STEP 5: ENVIRONMENT VARIABLES**

Create `.env` file:
```bash
nano /home/profithack/profithack-ai/.env
```

Add all your secrets:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/profithack_ai

# Server
NODE_ENV=production
PORT=5000
SESSION_SECRET=generate-a-random-32-character-string

# Replit Auth (if keeping)
REPLIT_CLIENT_ID=your-client-id
REPLIT_CLIENT_SECRET=your-client-secret
REPLIT_REDIRECT_URI=https://profithackai.com/auth/callback

# Payment Providers
PAYPAL_CLIENT_ID=your-paypal-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
SQUARE_ACCESS_TOKEN=your-square-token
PAYONEER_API_KEY=your-payoneer-key
PAYEER_ACCOUNT_ID=your-payeer-id
NOWPAYMENTS_API_KEY=your-nowpayments-key

# Social Media APIs
FACEBOOK_APP_ID=4370633919848483
FACEBOOK_APP_SECRET=your-secret
THREADS_APP_ID=4370633919848483
THREADS_APP_SECRET=your-secret
REDDIT_CLIENT_ID=sDlxOm8AEeGOtnfojHTsuA
REDDIT_CLIENT_SECRET=your-secret
DISCORD_BOT_TOKEN=your-bot-token
TELEGRAM_BOT_TOKEN=your-bot-token

# Email Service
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@profithackai.com

# AI Services (optional - users provide their own)
OPENAI_API_KEY=optional
```

**Security:** Set proper file permissions
```bash
chmod 600 /home/profithack/profithack-ai/.env
```

---

## 🌐 **STEP 6: CONFIGURE NGINX (Reverse Proxy)**

Create Nginx configuration:
```bash
nano /etc/nginx/sites-available/profithackai.com
```

Add this configuration:
```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name profithackai.com www.profithackai.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name profithackai.com www.profithackai.com;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/profithackai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/profithackai.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static files (if serving from Nginx)
    location /assets {
        alias /home/profithack/profithack-ai/dist/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/profithackai.com /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl reload nginx
```

---

## 🔒 **STEP 7: SSL CERTIFICATE (HTTPS)**

```bash
# Obtain free SSL certificate from Let's Encrypt
certbot --nginx -d profithackai.com -d www.profithackai.com

# Follow prompts, select:
# - Enter email for renewal notices
# - Agree to Terms of Service
# - Choose: Redirect all HTTP to HTTPS (option 2)

# Auto-renewal (already configured, verify):
certbot renew --dry-run
```

---

## 🚀 **STEP 8: START APPLICATION WITH PM2**

```bash
# Switch to app user
su - profithack
cd profithack-ai

# Start app with PM2
pm2 start npm --name "profithack-ai" -- run start

# Or directly with node (after building)
pm2 start server/index.ts --name "profithack-ai" --interpreter=node

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u profithack --hp /home/profithack
# Run the command it outputs

# Monitor app
pm2 monit

# View logs
pm2 logs profithack-ai

# Restart app
pm2 restart profithack-ai
```

---

## ☁️ **STEP 9: OBJECT STORAGE (Videos & Media)**

### Option A: AWS S3
```bash
# Install AWS CLI
apt install -y awscli

# Configure
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1)

# Create bucket
aws s3 mb s3://profithack-ai-videos

# Set public access (for video serving)
aws s3api put-bucket-cors --bucket profithack-ai-videos --cors-configuration file://cors.json
```

`cors.json`:
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["https://profithackai.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }]
}
```

### Option B: Cloudflare R2 (Cheaper than S3)
1. Create Cloudflare account
2. Go to R2 Storage
3. Create bucket: `profithack-ai-videos`
4. Get API credentials
5. Update app to use R2 (S3-compatible API)

### Option C: Backblaze B2 (Cheapest)
- Storage: $0.005/GB/month (vs S3: $0.023/GB)
- Download: $0.01/GB (first 3x storage free)

---

## 📧 **STEP 10: EMAIL SERVICE**

### Option A: SendGrid (Recommended)
1. Sign up at sendgrid.com
2. Verify domain (profithackai.com)
3. Create API key
4. Add to `.env`: `SENDGRID_API_KEY=...`

### Option B: AWS SES (Cheapest)
- $0.10 per 1,000 emails
- Requires domain verification

### Option C: Postmark (Best deliverability)
- First 100 emails/month free
- $15/month for 10,000 emails

---

## 🔄 **STEP 11: DNS CONFIGURATION**

Point your domain to your server:

### A Records
```
Type: A
Name: @
Value: your-server-ip
TTL: 3600

Type: A
Name: www
Value: your-server-ip
TTL: 3600
```

### Optional: CDN (Cloudflare)
1. Add domain to Cloudflare
2. Update nameservers at domain registrar
3. Enable "Proxied" (orange cloud) for caching
4. Set SSL mode to "Full (strict)"

---

## 📊 **STEP 12: MONITORING & LOGGING**

### System Monitoring
```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-logrotate

# Set log retention
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Application Monitoring
Consider these services:
- **Sentry** - Error tracking (free tier: 5K events/month)
- **Logtail** - Log management
- **UptimeRobot** - Uptime monitoring (free: 50 monitors)
- **Google Analytics** - User analytics

---

## 🔥 **STEP 13: FIREWALL & SECURITY**

```bash
# Install and configure UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable

# Disable root SSH login (security)
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
systemctl restart ssh

# Install fail2ban (brute force protection)
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## ✅ **STEP 14: FINAL CHECKLIST**

Before going live:

- [ ] App running on server (check `pm2 status`)
- [ ] Database connected (test login)
- [ ] SSL certificate active (https:// working)
- [ ] DNS pointing to server (profithackai.com loads)
- [ ] Environment variables set correctly
- [ ] Object storage working (upload test video)
- [ ] Email service configured (send test email)
- [ ] Payment providers connected (test transactions)
- [ ] Firewall enabled
- [ ] PM2 auto-start configured
- [ ] Nginx reverse proxy working
- [ ] WebSockets functioning (test real-time features)
- [ ] Backup system in place

---

## 🔄 **ONGOING MAINTENANCE**

### Daily
```bash
# Check PM2 status
pm2 status

# View logs for errors
pm2 logs profithack-ai --lines 100
```

### Weekly
```bash
# Update system packages
apt update && apt upgrade -y

# Restart app (to apply any updates)
pm2 restart profithack-ai

# Check disk space
df -h

# Check SSL certificate expiry
certbot certificates
```

### Monthly
```bash
# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Upload backup to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://profithack-backups/

# Review logs for security issues
journalctl -u nginx --since "1 month ago" | grep -i error
```

---

## 💰 **COST BREAKDOWN**

### Monthly Costs (Estimated)
| Service | Provider | Cost |
|---------|----------|------|
| **Server** | DigitalOcean Droplet 4GB | $24/mo |
| **Database** | Neon PostgreSQL | $19/mo (or free tier) |
| **Object Storage** | Cloudflare R2 | ~$5/mo (10GB storage) |
| **Email** | SendGrid | Free (12K emails/mo) |
| **Domain** | Namecheap | $12/year ($1/mo) |
| **SSL** | Let's Encrypt | Free |
| **CDN** | Cloudflare | Free tier |
| **Monitoring** | Sentry + UptimeRobot | Free tiers |
| **TOTAL** | | **~$50/month** |

### Scale-Up Costs (10K users)
- Server: $80/mo (16GB RAM, 4 vCPUs)
- Database: $69/mo (Neon Pro)
- Storage: $20/mo (100GB videos)
- Email: $20/mo (SendGrid Essentials)
- **TOTAL: ~$190/month**

---

## 🆘 **TROUBLESHOOTING**

### App won't start
```bash
# Check PM2 logs
pm2 logs profithack-ai

# Common issues:
# - Missing environment variables → Check .env file
# - Port already in use → Change PORT in .env
# - Database connection failed → Verify DATABASE_URL
```

### 502 Bad Gateway (Nginx error)
```bash
# Check if app is running
pm2 status

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### Database connection errors
```bash
# Test database connection
psql $DATABASE_URL

# Check firewall allows PostgreSQL port
ufw status
```

### SSL certificate issues
```bash
# Renew certificate
certbot renew --force-renewal

# Check certificate status
certbot certificates
```

---

## 📞 **SUPPORT RESOURCES**

### Documentation
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

### Communities
- **Stack Overflow**: For technical questions
- **DigitalOcean Community**: For hosting questions
- **r/selfhosted**: Reddit community for self-hosting

---

## 🎯 **MIGRATION TIMELINE**

### Day 1 (2-3 hours)
- Set up cloud server
- Install dependencies
- Deploy code

### Day 2 (2-3 hours)
- Configure database
- Set up object storage
- Configure environment variables

### Day 3 (1-2 hours)
- Set up Nginx + SSL
- Configure DNS
- Test everything

### Day 4 (1 hour)
- Set up monitoring
- Configure backups
- Security hardening

### Day 5 (1 hour)
- Final testing
- Performance tuning
- **GO LIVE! 🚀**

---

## ✅ **READY TO MIGRATE?**

**You now have everything you need to move PROFITHACK AI off Replit and onto your own infrastructure.**

**Questions?** Review this guide step-by-step. Each section is designed to be copy-paste ready.

**Next Steps:**
1. Choose your hosting provider (DigitalOcean recommended for beginners)
2. Export your code from Replit
3. Follow this guide section by section
4. Test thoroughly before switching DNS
5. **Launch!**

---

*Migration Guide v1.0 - Last updated: November 5, 2025*  
*Estimated completion: 1 week with this guide*

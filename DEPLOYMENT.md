# EduCertSuite - Deployment Guide

## Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 14+ or MongoDB
- Domain with wildcard subdomain support
- SSL certificate (Let's Encrypt recommended)
- Minimum 2GB RAM, 20GB storage

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/amansky404/EduCertEngine.git
cd EduCertEngine
npm install
```

### 2. Environment Configuration

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/educertsuite"

# Application
NEXT_PUBLIC_BASE_DOMAIN="localhost:3000"
NODE_ENV="development"

# Security
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"

# Storage
STORAGE_DRIVER="local"
NEXT_PUBLIC_UPLOAD_DIR="/uploads"

# Optional: Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Optional: Open Prisma Studio
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Production Deployment

### Option 1: Vercel (Recommended)

#### Setup

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure Project**
```bash
vercel init
```

3. **Set Environment Variables**
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_BASE_DOMAIN
```

4. **Configure Wildcard Domains**

In Vercel Dashboard:
- Go to Project Settings > Domains
- Add: `*.yourdomain.com`
- Configure DNS with wildcard A record

5. **Deploy**
```bash
vercel --prod
```

#### DNS Configuration

Add these records to your domain:

```
Type    Name    Value
A       @       76.76.21.21
A       *       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### Option 2: AWS EC2 + Nginx

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

#### 2. Application Setup

```bash
# Clone repository
cd /var/www
git clone https://github.com/amansky404/EduCertEngine.git
cd EduCertEngine

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "educertsuite" -- start
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

Create `/etc/nginx/sites-available/educertsuite`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com *.yourdomain.com;
    return 301 https://$host$request_uri;
}

# Main application
server {
    listen 443 ssl http2;
    server_name yourdomain.com *.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

    # Upload files
    location /uploads {
        alias /var/www/EduCertEngine/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/educertsuite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d *.yourdomain.com
```

### Option 3: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 2. Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_BASE_DOMAIN=${NEXT_PUBLIC_BASE_DOMAIN}
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=educert
      - POSTGRES_PASSWORD=securepassword
      - POSTGRES_DB=educertsuite
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### 3. Deploy

```bash
docker-compose up -d
```

## Post-Deployment Steps

### 1. Create Super Admin

Visit: `https://yourdomain.com/superadmin/register`

Create your first super admin account.

### 2. Create First University

1. Login to super admin panel
2. Navigate to dashboard
3. Click "Create New University"
4. Fill in university details
5. Assign subdomain (e.g., `harvard`)
6. Create admin account

### 3. Configure University

1. Login to university admin panel at `https://subdomain.yourdomain.com/admin/login`
2. Configure branding (Settings > Branding)
3. Set up SEO (SEO Panel)
4. Customize landing page (Landing Builder)

### 4. Create Templates

1. Navigate to Templates
2. Choose template type
3. Configure template settings
4. Save template

### 5. Import Students

1. Go to CSV Creator
2. Define fields
3. Download CSV template
4. Fill student data
5. Import CSV in Students section

## Monitoring & Maintenance

### Log Monitoring

```bash
# PM2 logs
pm2 logs educertsuite

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backup

```bash
# PostgreSQL backup
pg_dump educertsuite > backup_$(date +%Y%m%d).sql

# Automated daily backups
0 2 * * * pg_dump educertsuite > /backups/educertsuite_$(date +\%Y\%m\%d).sql
```

### Application Updates

```bash
cd /var/www/EduCertEngine
git pull
npm install
npm run build
pm2 restart educertsuite
```

## Performance Optimization

### 1. Enable Caching

Configure Redis for session storage and caching.

### 2. CDN Setup

Use Cloudflare or AWS CloudFront for static assets.

### 3. Database Optimization

- Enable connection pooling
- Add indexes for frequently queried fields
- Regular VACUUM and ANALYZE

### 4. Image Optimization

Install Sharp for automatic image optimization:
```bash
npm install sharp
```

## Security Checklist

- ✅ Enable HTTPS
- ✅ Configure firewall (UFW)
- ✅ Regular security updates
- ✅ Strong JWT secret (32+ characters)
- ✅ Rate limiting on APIs
- ✅ Database backups
- ✅ Environment variables secured
- ✅ CORS configuration
- ✅ Security headers configured

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify connection string
psql $DATABASE_URL
```

### Subdomain Not Working
```bash
# Verify DNS propagation
dig subdomain.yourdomain.com

# Check Nginx configuration
sudo nginx -t
```

### Application Not Starting
```bash
# Check Node.js version
node --version

# Verify dependencies
npm install

# Check logs
pm2 logs
```

## Support

For issues:
1. Check logs
2. Review documentation
3. Open GitHub issue
4. Contact support

## License

MIT License - See LICENSE file

# EduCertEngine - Setup & Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm (or yarn/pnpm)
- **Git** for version control
- A code editor (VS Code recommended)

For production:
- **PostgreSQL 13+** (or use SQLite for development/testing)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/amansky404/EduCertEngine.git
cd EduCertEngine
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- Prisma ORM
- TypeScript
- React and React DOM
- UI libraries (Tailwind CSS, Radix UI)
- Utility libraries (pdf-lib, qrcode, bcryptjs, etc.)

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
# For development: Use SQLite
DATABASE_URL="file:./prisma/dev.db"

# For production: Use PostgreSQL
# DATABASE_URL="postgresql://username:password@localhost:5432/educertengine"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-to-random-32-chars"

# Application Configuration
NEXT_PUBLIC_BASE_DOMAIN="localhost:3000"
NODE_ENV="development"

# Storage Configuration
STORAGE_DRIVER="local"
NEXT_PUBLIC_UPLOAD_DIR="/uploads"

# Optional: For production file storage
# AWS_ACCESS_KEY_ID="your-aws-key"
# AWS_SECRET_ACCESS_KEY="your-aws-secret"
# AWS_REGION="us-east-1"
# AWS_BUCKET_NAME="your-bucket-name"
```

### 4. Database Setup

Initialize the database and generate Prisma Client:

```bash
# Generate Prisma Client (creates type-safe database client)
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name initial_setup

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

The database will be created at `prisma/dev.db` (SQLite) or in your PostgreSQL instance.

### 5. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### 6. Create Your First Super Admin

1. Navigate to `http://localhost:3000/superadmin/register`
2. Fill in the registration form:
   - Name: Your name
   - Email: Your email
   - Password: Secure password (min 6 characters)
3. Click Register
4. Use these credentials to log in at `/superadmin/login`

## Production Deployment

### Environment Setup

For production, update your `.env` file:

```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:password@host:5432/educertengine"
JWT_SECRET="production-secret-min-32-chars-random"
NEXT_PUBLIC_BASE_DOMAIN="yourdomain.com"
```

### Build the Application

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Platform-Specific Deployments

#### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Connect to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required environment variables

5. **Configure Database**
   - Use Vercel Postgres, Supabase, or Railway for PostgreSQL
   - Update `DATABASE_URL` in environment variables

6. **Configure Wildcard Domains**
   - Add your custom domain in Vercel
   - Configure wildcard DNS: `*.yourdomain.com`
   - Vercel automatically handles SSL certificates

#### Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod
   ```

3. **Configure Environment Variables**
   - Set in Netlify Dashboard → Site Settings → Environment Variables

#### Self-Hosted (Ubuntu/Debian)

1. **Install Node.js 18+**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PostgreSQL**
   ```bash
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Create Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE educertengine;
   CREATE USER educert WITH ENCRYPTED PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE educertengine TO educert;
   \q
   ```

4. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone and Setup**
   ```bash
   cd /var/www
   git clone https://github.com/amansky404/EduCertEngine.git
   cd EduCertEngine
   npm install
   ```

6. **Configure Environment**
   ```bash
   nano .env
   # Add production environment variables
   ```

7. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

8. **Build and Start**
   ```bash
   npm run build
   pm2 start npm --name "educert" -- start
   pm2 save
   pm2 startup
   ```

9. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com *.yourdomain.com;

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
   }
   ```

10. **Setup SSL**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com -d *.yourdomain.com
    ```

## Subdomain Configuration

For the multi-tenant subdomain feature to work properly, you need to configure DNS and routing.

### Local Development

Add entries to your `/etc/hosts` file (or `C:\Windows\System32\drivers\etc\hosts` on Windows):

```
127.0.0.1 localhost
127.0.0.1 university1.localhost
127.0.0.1 university2.localhost
127.0.0.1 techuni.localhost
```

Access universities at:
- `http://localhost:3000` - Main site
- `http://university1.localhost:3000` - University 1
- `http://techuni.localhost:3000` - Tech University

### Production DNS Setup

Configure wildcard DNS records:

**For Cloudflare/DNS Provider:**
```
Type    Name    Content              TTL
A       @       your-server-ip       Auto
A       *       your-server-ip       Auto
```

This enables:
- `yourdomain.com` - Main site
- `techuni.yourdomain.com` - Tech University
- `medicalcollege.yourdomain.com` - Medical College
- Any subdomain automatically routes to your application

### Vercel/Netlify Configuration

1. Add your custom domain in the dashboard
2. Add wildcard domain: `*.yourdomain.com`
3. SSL certificates are automatically provisioned

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Push schema changes without migrations (for prototyping)
npx prisma db push

# Open Prisma Studio (Database GUI)
npx prisma studio

# Format schema file
npx prisma format
```

### Database Backup

#### SQLite (Development)
```bash
# Backup
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# Restore
cp prisma/backup-20240101.db prisma/dev.db
```

#### PostgreSQL (Production)
```bash
# Backup
pg_dump -U username -h host dbname > backup.sql

# Restore
psql -U username -h host dbname < backup.sql

# Automated daily backup script
#!/bin/bash
DATE=$(date +%Y-%m-%d)
pg_dump -U educert educertengine > /backups/educert-$DATE.sql
find /backups -name "educert-*.sql" -mtime +7 -delete
```

Add to crontab for daily backups:
```bash
0 2 * * * /path/to/backup-script.sh
```

## Application Structure

### Database Models

The application uses Prisma ORM with the following main models:

- **SuperAdmin**: System administrators with full access
- **University**: Multi-tenant university entities with branding and settings
- **UniversityAdmin**: University-level administrators
- **Template**: Document templates (HTML, PDF Mapper, Direct Upload)
- **CsvConfig**: CSV field configuration for bulk imports
- **Student**: Student records with flexible custom data
- **Document**: Generated documents with QR verification
- **FileUpload**: File storage tracking
- **AuditLog**: System audit trails

See `prisma/schema.prisma` for complete schema definition.

### Key Features

#### 1. Multi-Tenant Architecture
- Automatic subdomain routing via middleware
- Isolated data per university (enforced at database level)
- Custom branding and configuration per tenant
- Centralized super admin management

#### 2. Template System
Three template types supported:
- **HTML**: Drag-and-drop builder with Fabric.js
- **PDF_MAPPER**: Field mapping on PDF/JPEG backgrounds
- **DIRECT_UPLOAD**: Bulk upload of pre-generated PDFs

#### 3. CSV Management
- Dynamic CSV Creator per template
- Flexible field definitions
- Bulk student import with validation
- Automatic document generation

#### 4. QR Verification System
- University-level toggle (enable/disable for entire university)
- Template-level control (per template override)
- Secure hash-based verification
- Public verification endpoint

#### 5. Student Portal
- Search by roll number, registration number, mobile, or DOB
- Document viewing and download
- Print-optimized layout
- No login required for students

## User Roles & Permissions

### Super Admin
- Create and manage all universities
- Assign subdomains and slugs
- Configure system-wide settings
- Access all university data
- View system-wide audit logs

### University Admin
- Manage university settings and branding
- Create and manage templates
- Import and manage students
- Generate and publish documents
- Configure landing pages and SEO
- View university-specific audit logs

### Students (Public Access)
- Search for their documents
- View published documents
- Download documents
- Verify documents via QR code
- No account required

## Common Issues & Troubleshooting

### Database Connection Errors

**Issue**: `Can't reach database server`
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

**Issue**: `P1003: Database does not exist`
```bash
# Create the database
createdb educertengine

# Or via psql
psql -U postgres
CREATE DATABASE educertengine;
\q
```

### Subdomain Not Working

**Issue**: Subdomain returns 404 or not found

**Solution**:
1. Check `NEXT_PUBLIC_BASE_DOMAIN` in `.env`
2. Verify `/etc/hosts` entries for local development
3. Check DNS settings for production
4. Ensure wildcard DNS is configured: `*.yourdomain.com`
5. Clear browser cache

### Build Errors

**Issue**: `Module not found` or TypeScript errors
```bash
# Clear build cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

**Issue**: `Prisma Client not found`
```bash
# Generate Prisma Client
npx prisma generate

# Rebuild
npm run build
```

### Port Already in Use

**Issue**: `Port 3000 is already in use`
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### File Upload Issues

**Issue**: File uploads failing

**Solution**:
1. Check upload directory permissions:
   ```bash
   mkdir -p public/uploads
   chmod 755 public/uploads
   ```
2. Verify file size limits in Next.js config
3. Check available disk space: `df -h`

### Prisma Migration Issues

**Issue**: Migration conflicts or drift

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Resolve drift
npx prisma migrate resolve --applied <migration-name>

# For development: push schema without migrations
npx prisma db push
```

## Development Tips

### Hot Reload Not Working

```bash
# Try clearing Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Environment Variables Not Loading

```bash
# Ensure .env is in root directory
ls -la .env

# Restart dev server after .env changes
# Environment variables are loaded at build time
npm run dev
```

### Database Changes Not Reflecting

```bash
# Regenerate Prisma Client
npx prisma generate

# Restart dev server
npm run dev
```

## Getting Help

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Project Issues](https://github.com/amansky404/EduCertEngine/issues)

### Reporting Issues

When reporting issues, include:
1. Error message and stack trace
2. Steps to reproduce
3. Environment details (OS, Node version)
4. Relevant logs from console
5. Screenshots if applicable

## Support

For setup help and issues:
1. Check this documentation first
2. Search existing GitHub issues
3. Create a new issue with detailed information

## License

MIT License - See LICENSE file for details

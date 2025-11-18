# EduCertSuite - Setup & Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/amansky404/EduCertEngine.git
cd EduCertEngine
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/educertsuite"

# Application
NEXT_PUBLIC_BASE_DOMAIN="localhost:3000"
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Storage
STORAGE_DRIVER="local"
NEXT_PUBLIC_UPLOAD_DIR="/uploads"
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Start Production Server

```bash
npm start
```

## Subdomain Configuration

For subdomain routing to work properly:

### Local Development

Add entries to your `/etc/hosts` file:

```
127.0.0.1 university1.localhost
127.0.0.1 university2.localhost
```

### Production (Nginx)

Configure wildcard subdomains in Nginx:

```nginx
server {
    listen 80;
    server_name *.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Production (Vercel/Netlify)

Configure wildcard domains in your hosting platform settings.

## System Architecture

### Database Models

- **SuperAdmin**: System administrators
- **University**: Multi-tenant university entities
- **UniversityAdmin**: University-level administrators
- **Template**: Document templates (HTML, PDF Mapper, Direct Upload)
- **CsvConfig**: CSV configuration for bulk imports
- **Student**: Student records
- **Document**: Generated documents
- **FileUpload**: File storage tracking
- **AuditLog**: System audit trails

### Key Features

1. **Multi-Tenant Architecture**
   - Automatic subdomain routing
   - Isolated data per university
   - Custom branding support

2. **Template System**
   - HTML Template Builder (drag/drop with Fabric.js)
   - PDF/JPEG Field Mapper
   - Direct Document Upload Mode

3. **CSV Management**
   - Dynamic CSV Creator
   - Bulk student import
   - Auto document generation

4. **QR Verification**
   - University-level toggle
   - Template-level control
   - Secure hash-based verification

5. **Student Portal**
   - Search by roll/mobile/DOB
   - Document viewing & download
   - Print functionality

## API Endpoints

### Authentication

- `POST /api/auth/superadmin-register` - Register super admin
- `POST /api/auth/superadmin-login` - Super admin login
- `POST /api/auth/admin-login` - University admin login

### University Management

- `POST /api/university/create` - Create new university
- `GET /api/university/list` - List universities
- `PUT /api/university/update` - Update university settings

### Template Management

- `POST /api/template/create` - Create template
- `GET /api/template/list` - List templates
- `PUT /api/template/update` - Update template

### Student Management

- `POST /api/student/create` - Create student
- `GET /api/student/search` - Search student
- `POST /api/student/import` - Bulk import via CSV

### CSV Configuration

- `POST /api/csv/create` - Create CSV configuration
- `GET /api/csv/list` - List CSV configs

## User Roles & Permissions

### Super Admin
- Create and manage universities
- Assign subdomains
- Configure system-wide settings
- Access all data

### University Admin
- Manage university settings
- Configure branding
- Create templates
- Import students
- Generate documents
- Manage landing pages
- Configure SEO

### Students (Public)
- Search for documents
- View documents
- Download documents
- Verify documents via QR

## Default Credentials

After initial setup, create a super admin account at:
`http://localhost:3000/superadmin/register`

## Common Issues & Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### Subdomain Not Working
- Check NEXT_PUBLIC_BASE_DOMAIN in `.env`
- Configure `/etc/hosts` for local development
- Verify DNS settings for production

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Regenerate Prisma client: `npx prisma generate`

## Support

For issues and feature requests, please open an issue on GitHub:
https://github.com/amansky404/EduCertEngine/issues

## License

MIT License - See LICENSE file for details

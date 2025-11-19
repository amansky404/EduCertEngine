# EduCertEngine Architecture

## Overview

EduCertEngine is a modern multi-tenant certificate and document management platform built with **Next.js 14**, **Prisma ORM**, and **TypeScript**. This document describes the system architecture, design patterns, and technical implementation.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Admin Panel  │  │ Student      │  │   Public     │      │
│  │    (React)   │  │   Portal     │  │ Verification │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js 14 Server (Port 3000)                      │   │
│  │  - App Router                                        │   │
│  │  - Server Components                                 │   │
│  │  - API Routes                                        │   │
│  │  - Middleware (Subdomain Detection)                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes Layer                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │   /auth   │  │/university│  │ /template │  │/student │ │
│  │  Routes   │  │  Routes   │  │  Routes   │  │ Routes  │ │
│  └───────────┘  └───────────┘  └───────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Utility Libraries (/lib)                           │   │
│  │  - auth.ts (JWT, bcrypt)                            │   │
│  │  - prisma.ts (Database client)                      │   │
│  │  - pdf.ts (PDF generation)                          │   │
│  │  - qr.ts (QR code generation)                       │   │
│  │  - tenant.ts (Multi-tenancy utilities)              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Prisma ORM                                         │   │
│  │  - Type-safe database queries                       │   │
│  │  - Schema validation                                │   │
│  │  - Migration management                             │   │
│  │  - Connection pooling                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  PostgreSQL / SQLite                                         │
│  - SuperAdmin, University, UniversityAdmin                   │
│  - Template, CsvConfig                                       │
│  - Student, Document                                         │
│  - FileUpload, AuditLog                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    File Storage Layer                        │
│  Local Storage / AWS S3 / Cloudflare R2                     │
│  - Document PDFs, Template backgrounds                       │
│  - QR Codes, Branding assets, User uploads                  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Multi-Tenancy System

**Subdomain Routing**:
```
educert.com                    → Main site
techuni.educert.com           → Tech University
medicalcollege.educert.com    → Medical College
```

**Implementation**:
- Next.js middleware extracts subdomain from Host header
- Looks up university by subdomain in database
- Attaches university context to request
- All subsequent operations scoped to that university

**Key Files**:
- `middleware.ts` - Subdomain detection and routing
- `lib/tenant.ts` - Multi-tenancy utilities
- `prisma/schema.prisma` - University model with unique subdomain

### 2. Authentication & Authorization

**Authentication Flow**:
1. User submits credentials
2. Server validates against Prisma database
3. bcrypt verifies password
4. JWT token generated
5. Token returned to client
6. Client includes token in Authorization header
7. API routes verify token before processing

**Authorization Hierarchy**:
- **Super Admin**: Full system access, manage all universities
- **University Admin**: University-level access, manage templates/students/documents
- **Public (Students)**: No auth required, view published documents

**Key Files**:
- `lib/auth.ts` - JWT and bcrypt utilities
- `app/api/auth/*/route.ts` - Authentication endpoints

### 3. Template System

**Three Template Types**:

1. **HTML Template Builder**
   - Visual drag-and-drop editor using Fabric.js
   - Custom HTML/CSS support
   - Dynamic field mapping
   - Exports to PDF

2. **PDF/JPEG Field Mapper**
   - Upload existing certificate design
   - Visual field positioning
   - Overlay text on existing design
   - Uses pdf-lib for PDF manipulation

3. **Direct Upload Mode**
   - Bulk upload pre-generated PDFs as ZIP
   - CSV maps student data to filenames
   - No generation required

**Key Files**:
- `app/api/template/*/route.ts` - Template operations
- `lib/pdf.ts` - PDF generation utilities

### 4. Document Generation

**Workflow**:
1. CSV Upload
2. Parse CSV and validate fields
3. Create student records
4. Create document records
5. Generate PDFs based on template type
6. Generate QR codes (if enabled)
7. Store PDF URLs and QR hashes
8. Publish documents

**Key Files**:
- `app/api/student/import/route.ts` - Bulk import
- `lib/pdf.ts` - PDF generation
- `lib/qr.ts` - QR code generation

## Database Schema (Prisma)

### Key Models

```prisma
model SuperAdmin {
  id       String @id @default(cuid())
  email    String @unique
  password String // bcrypt hashed
  name     String
}

model University {
  id             String   @id @default(cuid())
  name           String
  subdomain      String   @unique
  slug           String   @unique
  primaryColor   String
  secondaryColor String
  qrEnabled      Boolean
  // ... branding, SEO fields
  
  admins    UniversityAdmin[]
  templates Template[]
  students  Student[]
  documents Document[]
}

model Template {
  id            String  @id @default(cuid())
  universityId  String
  name          String
  type          String  // HTML, PDF_MAPPER, DIRECT_UPLOAD
  htmlContent   String?
  backgroundUrl String?
  qrEnabled     Boolean
  
  documents Document[]
}

model Student {
  id           String @id @default(cuid())
  universityId String
  rollNo       String
  name         String
  // ... other fields
  
  documents Document[]
  @@unique([universityId, rollNo])
}

model Document {
  id          String  @id @default(cuid())
  studentId   String
  templateId  String
  pdfUrl      String?
  qrHash      String? @unique
  isPublished Boolean @default(false)
}
```

## Security Architecture

### Authentication Security
- bcrypt password hashing (10 salt rounds)
- JWT tokens with 30-day expiration
- Secure token storage
- Token validation on each request

### Authorization Security
- Role-based access control (RBAC)
- Database-level data isolation
- All queries filtered by universityId
- Prisma middleware enforces scoping

### Data Security
- SQL injection prevented by Prisma
- XSS prevention via React escaping
- Input validation with TypeScript
- Secure file upload validation

## Performance Optimization

### Database Optimization
- Indexed fields: subdomain, universityId, rollNo, qrHash
- Pagination for large datasets
- Selective field loading
- Connection pooling

### Caching Strategy
- Next.js static page caching
- API route caching with revalidate
- Image optimization and caching
- Future: Redis for sessions

### File Storage
- Development: Local file system
- Production: AWS S3 or Cloudflare R2
- PDF compression
- CDN delivery

## Deployment

### Development
```
Local Machine
├── Next.js Dev Server (Port 3000)
├── SQLite Database
└── Local File Storage
```

### Production (Vercel - Recommended)
```
Vercel Platform
├── Next.js (Serverless Functions)
├── PostgreSQL (Neon/Supabase)
└── S3/R2 (File Storage)
```

### Production (Self-Hosted)
```
Server
├── Nginx (Reverse Proxy)
├── PM2 + Next.js (Port 3000)
├── PostgreSQL
└── MinIO/S3 (File Storage)
```

## Technology Stack

### Core
- Next.js 14 (App Router)
- React 18 (Server Components)
- TypeScript
- Prisma ORM
- PostgreSQL/SQLite

### Libraries
- pdf-lib (PDF generation)
- qrcode (QR codes)
- bcryptjs (Password hashing)
- jsonwebtoken (JWT auth)
- Tailwind CSS (Styling)
- Radix UI (Components)
- Fabric.js (Canvas editor)

## Future Enhancements

### Architecture
- Microservices for PDF generation
- Message queue (Bull/BullMQ)
- Redis caching
- Elasticsearch for search
- WebSockets for real-time updates

### Features
- Email notifications (SendGrid/SES)
- Mobile app (React Native)
- 2FA authentication
- Advanced analytics
- Blockchain verification

## Conclusion

EduCertEngine uses modern web technologies with focus on:
- **Scalability**: Multi-tenant with data isolation
- **Security**: RBAC, JWT auth, bcrypt
- **Performance**: Next.js optimization, Prisma ORM
- **Maintainability**: TypeScript, clean architecture
- **Developer Experience**: Type safety, hot reload

For implementation details, see:
- `/app` - Next.js application
- `/lib` - Utility libraries
- `/prisma` - Database schema
- `/components` - React components

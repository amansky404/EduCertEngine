📘 EduCertSuite – Multi-University Certificate & Marksheet Management Platform

A powerful multi-university platform for generating, managing, verifying, and distributing Certificates, Marksheets, Admit Cards, and Academic Documents with custom subdomains, dynamic templates, and QR verification.

EduCertSuite enables schools, colleges, universities, and training institutions to generate documents at scale using:

HTML templates

PDF/JPEG mapped templates

Direct-upload mode

Bulk CSV import

Dynamic student data

Drag-and-drop UI

QR verification toggle

Multi-tenant subdomain routing

🚀 Key Features
🏫 Multi-University Support

Create unlimited universities

Automatic subdomain creation (uni.domain.xyz)

Custom branding (logo, colors, header, footer)

SEO configuration per university

🎨 Landing Page Builder

Drag & drop sections

Custom hero banners

Notice board

Search box customization

Gallery, testimonials, important links

Publish instantly per university

🧩 3 Powerful Template Modes
1. HTML Template Builder

Drag/drop text, images, signatures, QR

Layer control

Live preview

Dynamic variable mapping

2. PDF/JPEG Field Mapper

Upload background

Overlay dynamic fields

Set font, alignment, and positions

3. Direct Document Upload Mode

Upload ZIP of ready-made PDFs

Map files using CSV

Instant student linking

📄 Dynamic CSV Creator (Admin Tool)

Create custom CSV structures with “+ Add Field”

Field types: text, number, date, dropdown, boolean, image URL, etc.

AI-suggested fields

Download template instantly

🎯 Bulk CSV Import

Import unlimited students

Auto-generate documents

Validation engine

Error reporting

🔍 Student Portal

Accessible via subdomain:
uni.domain.xyz

Features:

Enter Roll No / Reg No / DOB / Mobile

View document

Download PDF

Print

Share link

QR verification

🔐 QR Verification System (Toggle ON/OFF)
University-level toggle:
Enable QR Verification: ON/OFF

Template-level toggle:
Enable QR for this Template: ON/OFF

Document behavior:

QR ON → Generates QR + verification link

QR OFF → Document generated without QR

Verification URL:
uni.domain.xyz/verify/<hash>

🔄 Document Engine

Generates:

PDF

JPEG

Watermarked PDF

Signed documents

Barcode / QR integrated pages

🗂 File Manager

Upload PDFs, images, ZIP files

Preview

Bulk delete

Auto folder structure per university

🔒 Security

JWT Auth

Audit logs

QR hash security

Anti-hotlinking

Rate limiting

Non-indexable verification pages

🧱 System Architecture
Super Admin
    ↓
Creates University
    ↓
Auto Subdomain Provisioning
    ↓
University Admin Portal
    ↓
Settings → Branding → SEO → Landing Page
    ↓
Template Builder (HTML/PDF/Direct)
    ↓
CSV Creator → CSV Upload
    ↓
Document Engine (PDF/JPEG)
    ↓
Student Portal → Search → View/Download
    ↓
QR Verification (if enabled)

🏗 Tech Stack
Frontend

Next.js 14

React

TailwindCSS

Zustand / Redux (optional)

Fabric.js / Konva.js (template builder)

Backend

Node.js

Express / Next.js API Routes

Prisma ORM

MongoDB / PostgreSQL

Document Generation

Puppeteer (HTML → PDF)

PDFKit

Sharp (image processing)

Authentication

JWT

OTP email login

Subdomain Routing

Nginx wildcards

Next.js Middleware

📦 Folder Structure
EduCertSuite/
│
├── app/
│   ├── (main)/
│   ├── (admin)/
│   │   ├── settings/
│   │   ├── templates/
│   │   ├── csv-creator/
│   │   ├── students/
│   │   ├── uploads/
│   │   └── seo/
│   ├── (university)/
│   │   ├── page.tsx
│   │   ├── result/[roll]
│   │   ├── verify/[hash]
│   └── api/
│
├── prisma/
│   ├── schema.prisma
│
├── components/
│   ├── template-builder/
│   ├── csv-creator/
│   ├── ui/
│
├── lib/
│   ├── subdomain.ts
│   ├── pdf.ts
│   ├── qr.ts
│   ├── auth.ts
│
└── README.md

⚙️ Installation & Setup
1. Clone Repo
git clone https://github.com/yourname/EduCertSuite.git
cd EduCertSuite

2. Install Dependencies
npm install

3. Setup Environment

Create .env:

DATABASE_URL=
NEXT_PUBLIC_BASE_DOMAIN=domain.xyz
JWT_SECRET=
STORAGE_DRIVER=local

4. Apply Prisma Schema
npx prisma migrate dev

5. Start Development Server
npm run dev

🔗 API Overview
University
POST /api/superadmin/university
GET  /api/university/info
POST /api/university/update

Templates
POST /api/template/create
POST /api/template/update
POST /api/template/upload

CSV Creator
POST /api/csv/create

Students
POST /api/students/import
GET  /api/students/:roll

Verification
GET /api/verify/:hash

🤝 Contributing

Fork the project

Create your feature branch

Submit Pull Request

Follow coding guidelines and lint rules

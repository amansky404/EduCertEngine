# EduCertEngine

A comprehensive Multi-University Certificate & Marksheet Management Platform built with **Next.js 14** and **Prisma**. Features dynamic subdomains, custom landing pages, multiple template types (HTML Builder, PDF/JPEG Mapper, Direct Upload), advanced CSV management, QR verification, SEO configuration, and student search portal.

## Features

### 🏫 Multi-Tenancy & Subdomain Management
- Dynamic subdomain routing for each university
- Isolated data and customization per institution
- Unlimited university support
- Custom branding per university

### 🎨 Customization & Branding
- **Custom Landing Pages**: Each university has its own branded homepage with custom content
- **Branding Panel**: Customizable colors, logos, headers, footers, stamps, signatures, and watermarks
- **SEO Panel**: Configure title, description, keywords, OG images, and JSON-LD per university
- **Flexible Configuration**: University-level settings for QR codes and other features

### 📄 Template Management (3 Types)
1. **HTML Template Builder**: Drag-and-drop visual editor with Fabric.js/Konva.js
2. **PDF/JPEG Field Mapper**: Upload background and map fields to specific positions
3. **Direct Upload Mode**: Bulk upload pre-generated PDFs with CSV mapping

### 📜 Certificate & Document Management
- **Multiple Document Support**: Certificates, marksheets, and custom documents
- **Bulk CSV Import**: Import hundreds/thousands of students at once
- **Advanced CSV Creator**: Dynamic CSV configuration per template
- **Auto Document Generation**: Automatically generate PDFs for all students
- **QR Code Module**: Toggleable QR codes for verification (university and template level)
- **Document Publishing**: Control document visibility and publication status

### 🔍 Student Portal & Verification
- **Enhanced Search Portal**: Modern, user-friendly document search interface at `/search`
- **Search Functionality**: Search by roll number, registration number, mobile, or date of birth
- **Document Generation Module**: Integrated document viewing and downloading capabilities
- **Student Dashboard**: View all available documents with status indicators
- **Secure Verification**: Verify documents using unique QR hash codes
- **Public Access**: Students can view and download their documents without login
- **Print Support**: Optimized for printing documents

### 🔐 Security & Access Control
- **Role-Based Access**: Super Admin and University Admin roles
- **JWT Authentication**: Secure API endpoints with token-based auth
- **University Isolation**: Complete data separation between universities
- **Audit Logging**: Track all administrative actions
- **Secure Passwords**: bcrypt hashing for all passwords

## Tech Stack

### Frontend & Backend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Prisma**: Modern ORM for database operations
- **SQLite/PostgreSQL**: Database (SQLite for dev, PostgreSQL for production)
- **Tailwind CSS**: Utility-first CSS framework

### Libraries & Tools
- **pdf-lib**: PDF generation and manipulation
- **qrcode**: QR code generation for document verification
- **fabric**: Canvas-based template editor
- **bcryptjs**: Secure password hashing
- **jsonwebtoken**: JWT authentication
- **Radix UI**: Accessible UI components

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/amansky404/EduCertEngine.git
   cd EduCertEngine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database (SQLite for development, PostgreSQL for production)
   DATABASE_URL="file:./prisma/dev.db"
   
   # JWT Authentication
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   
   # Application
   NEXT_PUBLIC_BASE_DOMAIN="localhost:3000"
   
   # Storage
   STORAGE_DRIVER="local"
   NEXT_PUBLIC_UPLOAD_DIR="/uploads"
   ```

4. **Initialize the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   
   # (Optional) Seed with sample data
   npx prisma db seed
   ```

5. **Run the application**
   ```bash
   # Development mode with hot-reload
   npm run dev
   
   # Production build and start
   npm run build
   npm start
   ```

The application will start on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Register Super Admin
```http
POST /api/auth/superadmin-register
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

#### Super Admin Login
```http
POST /api/auth/superadmin-login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

#### University Admin Login
```http
POST /api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@university.com",
  "password": "password123"
}
```

### University Endpoints

#### Create University (Super Admin only)
```http
POST /api/university/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Example University",
  "subdomain": "example-uni",
  "slug": "example-uni",
  "primaryColor": "#1a73e8",
  "secondaryColor": "#34a853",
  "qrEnabled": true,
  "seoTitle": "Example University",
  "seoDescription": "Official certificate portal"
}
```

#### Get All Universities
```http
GET /api/university/list
Authorization: Bearer <token>
```

### Template Endpoints

#### Create Template
```http
POST /api/template/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Degree Certificate",
  "type": "HTML",
  "description": "Bachelor's degree certificate template",
  "htmlContent": "<html>...</html>",
  "qrEnabled": true
}
```

#### Get All Templates
```http
GET /api/template/list
Authorization: Bearer <token>
```

#### Upload Template Background (for PDF_MAPPER type)
```http
POST /api/template/upload-background
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
templateId: "template_id"
```

#### Upload Direct Upload ZIP
```http
POST /api/template/direct-upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <zip_file>
templateId: "template_id"
```

### Student & Document Endpoints

#### Create Student
```http
POST /api/student/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "rollNo": "2024001",
  "regNo": "REG2024001",
  "name": "Jane Smith",
  "fatherName": "John Smith",
  "email": "jane@example.com",
  "mobile": "+1234567890",
  "dob": "2000-05-15"
}
```

#### Bulk Import Students from CSV
```http
POST /api/student/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <csv_file>
templateId: "template_id"
```

#### Search Students
```http
GET /api/student/search?rollNo=2024001
GET /api/student/search?mobile=1234567890
```

#### Verify Document
```http
GET /api/verify/:hash
```

Returns document details if hash is valid.

### CSV Configuration Endpoints

#### Create CSV Configuration
```http
POST /api/csv/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Student CSV Config",
  "templateId": "template_id",
  "fields": [
    {
      "name": "rollNo",
      "label": "Roll Number",
      "type": "text",
      "required": true
    },
    {
      "name": "name",
      "label": "Student Name",
      "type": "text",
      "required": true
    }
  ]
}
```

## CSV Import Format

For bulk student import, prepare a CSV file with the following structure:

```csv
rollNo,regNo,name,fatherName,dob,email,mobile
2024001,REG001,Jane Smith,John Smith,2000-05-15,jane@example.com,1234567890
2024002,REG002,John Doe,Robert Doe,2000-06-20,john@example.com,0987654321
```

The CSV fields should match your template requirements. Configure CSV structure using the CSV Creator in the admin panel.

## Directory Structure

```
EduCertEngine/
├── app/                      # Next.js App Router
│   ├── admin/               # University admin pages
│   │   ├── dashboard/       # Admin dashboard
│   │   ├── templates/       # Template management
│   │   ├── students/        # Student management
│   │   ├── branding/        # Branding settings
│   │   ├── landing-builder/ # Landing page editor
│   │   ├── csv-creator/     # CSV configuration
│   │   ├── seo/            # SEO settings
│   │   └── settings/        # General settings
│   ├── superadmin/          # Super admin pages
│   │   ├── dashboard/       # System dashboard
│   │   ├── register/        # Super admin registration
│   │   └── login/           # Super admin login
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── university/      # University management
│   │   ├── template/        # Template operations
│   │   ├── student/         # Student operations
│   │   ├── csv/            # CSV configuration
│   │   └── verify/          # Document verification
│   ├── search/              # Student document search portal
│   ├── verify/              # Public verification pages
│   └── result/              # Legacy student result pages (use /search instead)
├── components/              # React components
│   └── ui/                 # UI components
├── lib/                     # Utility libraries
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Authentication utilities
│   ├── pdf.ts              # PDF generation
│   ├── qr.ts               # QR code generation
│   ├── tenant.ts           # Multi-tenancy utilities
│   └── utils.ts            # General utilities
├── prisma/                  # Prisma ORM
│   ├── schema.prisma       # Database schema
│   └── dev.db              # SQLite database (dev)
├── public/                  # Static files
│   └── uploads/            # User uploads
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

## Usage Examples

### 1. Setting Up a University (Super Admin)

```javascript
// Create a new university via API
POST /api/university/create
{
  "name": "Tech University",
  "subdomain": "techuni",
  "slug": "tech-university",
  "primaryColor": "#0066cc",
  "secondaryColor": "#ff9900",
  "qrEnabled": true,
  "seoTitle": "Tech University - Certificates",
  "seoDescription": "Official certificate portal for Tech University"
}
```

### 2. Creating a Template (University Admin)

```javascript
// Create an HTML template
POST /api/template/create
{
  "name": "Graduation Certificate",
  "type": "HTML",
  "description": "Bachelor's degree certificate",
  "htmlContent": "<html>...</html>",
  "htmlConfig": "{...fabric.js config...}",
  "qrEnabled": true,
  "qrPosition": "{\"x\": 650, \"y\": 450}"
}
```

### 3. Bulk Student Import

```javascript
// Upload CSV file with students
POST /api/student/import
FormData: {
  file: students.csv,
  templateId: "template_123"
}

// Response includes import status
{
  "success": true,
  "imported": 150,
  "failed": 0
}
```

### 4. Student Document Verification

```javascript
// Verify document by QR hash
GET /api/verify/abc123def456

// Returns document details
{
  "valid": true,
  "student": {
    "name": "Jane Smith",
    "rollNo": "2024001"
  },
  "document": {
    "title": "Bachelor's Degree",
    "issuedDate": "2024-05-15"
  }
}
```

## Features in Detail

### Template Types

#### 1. HTML Template Builder
- **Visual drag-and-drop editor** using Fabric.js
- **Full object manipulation**: drag, resize, rotate all elements
- **Custom HTML/CSS support**
- **Dynamic field mapping** with variable replacement
- **Live preview capability**
- **Export to PDF** with pdf-lib
- **Elements supported**:
  - Text (editable with fonts, colors, sizes)
  - Rectangles and circles
  - Lines
  - Images (upload and position)
  - QR code placeholders
- **Advanced features**:
  - Undo/redo functionality
  - Layers panel
  - Object alignment tools
  - Zoom and grid controls
  - Dark mode support

#### 2. PDF/JPEG Field Mapper
- **Upload existing certificate design** (PDF or JPEG)
- **Map form fields to specific positions** with visual editor
- **Drag and drop field positioning** with grid snapping
- **Supports all field types**:
  - Text fields (with font customization)
  - Number fields
  - Date fields
  - Checkboxes
  - Dropdowns
  - Image placeholders
  - QR codes
- **Advanced features**:
  - Zoom controls for precise positioning
  - Grid snapping for alignment
  - Field validation rules
  - Conditional field display
- **PDF generation** using pdf-lib

#### 3. Direct Upload Mode
- Bulk upload pre-generated PDFs
- CSV-based filename mapping
- Ideal for pre-designed certificates
- Quick deployment

### QR Code Integration
- Unique hash for each document
- University-level toggle (enable/disable for all)
- Template-level control (per template)
- Secure verification endpoint
- Public access for verification

### Multi-Tenancy Architecture
- Each university operates on its own subdomain (e.g., `techuni.educert.com`)
- Complete data isolation between universities
- Custom branding per university
- Independent configuration per tenant
- Centralized super admin management

### Security Features
- JWT-based authentication
- Role-based access control (Super Admin, University Admin)
- Secure password hashing with bcrypt
- Database-level data isolation
- Audit logging for all actions
- Secure file upload validation

## Development

### Running in Development Mode
```bash
npm run dev
```

This starts the Next.js development server with hot-reload on `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm start
```

### Database Management
```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name migration_name

# Push schema changes without migrations
npx prisma db push

# Open Prisma Studio (Database GUI)
npx prisma studio
```

### Linting
```bash
npm run lint
```

## Deployment

### Environment Variables for Production
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-super-secure-production-secret-min-32-chars"
NEXT_PUBLIC_BASE_DOMAIN="yourdomain.com"
STORAGE_DRIVER="s3"  # or "local"
NODE_ENV="production"
```

### Recommended Production Setup
- **Platform**: Vercel, Netlify, or any Node.js host
- **Database**: PostgreSQL (recommended) via Supabase, Railway, or Neon
- **File Storage**: AWS S3, Cloudflare R2, or similar
- **Domain**: Configure wildcard DNS for subdomains (*.yourdomain.com)
- **SSL/TLS**: Automatic with Vercel/Netlify, or use Let's Encrypt

### Deploying to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Configure domain and wildcard subdomain support
```

### Database Migration in Production
```bash
# Run migrations
npx prisma migrate deploy
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## ✅ Implemented Features

### Core Platform (100% Complete)
- ✅ Multi-tenant architecture with subdomain routing
- ✅ Super Admin and University Admin roles
- ✅ JWT-based authentication system
- ✅ Prisma ORM with SQLite/PostgreSQL support
- ✅ Next.js 14 with App Router

### Template System (100% Complete)
- ✅ HTML Template Builder with Fabric.js
- ✅ PDF/JPEG Field Mapper
- ✅ Direct Upload Mode
- ✅ Template management UI
- ✅ QR code integration (toggle on/off)
- ✅ **NEW**: Full drag, drop, resize, rotate functionality in HTML builder
- ✅ **NEW**: Enhanced PDF generation with pdf-lib
- ✅ **NEW**: Comprehensive field mapping with validation

### Student & Document Management (100% Complete)
- ✅ Student registration and management
- ✅ Bulk CSV import
- ✅ Advanced CSV Creator with dynamic fields
- ✅ Document generation and publishing
- ✅ Search and verification portal
- ✅ QR-based document verification
- ✅ **NEW**: PDF generation for all template types

### Customization (100% Complete)
- ✅ Branding panel (colors, logos, images)
- ✅ Landing page builder
- ✅ SEO configuration panel
- ✅ Custom subdomain per university
- ✅ File upload management

### Admin Panels (100% Complete)
- ✅ Super Admin Dashboard
- ✅ University Admin Dashboard
- ✅ Template management interface
- ✅ Student management interface
- ✅ Settings and configuration panels

## Recent Updates (November 2025)

### Canvas Rendering and Builder Enhancements
**All builder issues have been resolved!** The template builders now work flawlessly:

✅ **Fixed**: Canvas rendering issues in HTML builder
- Canvas now properly initializes and displays
- No more blank canvas issues
- Smooth rendering and updates

✅ **Fixed**: Drag and drop functionality
- All elements can be dragged smoothly
- Accurate positioning with visual feedback
- Grid snapping for precise alignment

✅ **Fixed**: Resizing and rotation
- All objects can be resized using corner handles
- Rotation handles work correctly
- Proportional scaling maintained

✅ **Enhanced**: PDF generation
- Complete PDF generation using pdf-lib
- Support for all template types (HTML builder, PDF mapper, direct upload)
- QR code integration in generated PDFs
- Variable replacement in templates
- Proper coordinate transformation

✅ **Improved**: User experience
- Better visual feedback during operations
- Undo/redo functionality
- Layers panel for object management
- Dark mode support
- Keyboard shortcuts

For detailed technical information, see [CANVAS_FIXES.md](./CANVAS_FIXES.md)

## Roadmap

### Future Enhancements
- [ ] Mobile-responsive template editor
- [ ] Email notifications (SMTP integration)
- [ ] Advanced analytics dashboard
- [ ] Batch document operations
- [ ] Multi-language support (i18n)
- [ ] Dark mode UI
- [ ] Export to multiple formats (PNG, JPEG, SVG)
- [ ] API rate limiting
- [ ] Blockchain-based verification (optional)
- [ ] Mobile app for certificate viewing

## Acknowledgments

- Built with Next.js 14 and React
- Database powered by Prisma ORM
- PDF generation with pdf-lib
- QR codes powered by qrcode library
- UI components from Radix UI and Tailwind CSS

---

For more detailed documentation, see:
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture details
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Complete API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

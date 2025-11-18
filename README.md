# EduCertEngine

A comprehensive Multi-University Certificate & Marksheet Management Platform with dynamic subdomains, custom landing pages, HTML/PDF template builder, PDF/JPEG field mapper, direct-upload mode, advanced CSV Creator with dynamic fields, QR module on/off, SEO panel, student search portal, and secure verification engine.

## Features

### 🏫 Multi-Tenancy & Subdomain Management
- Dynamic subdomain routing for each university
- Isolated data and customization per institution
- Unlimited university support

### 🎨 Customization
- **Custom Landing Pages**: Each university has its own branded homepage
- **Branding**: Customizable colors, fonts, and logos
- **SEO Panel**: Configure title, description, keywords, and OG images per university
- **Flexible Layouts**: Drag-and-drop interface for page customization

### 📄 Template Management
- **HTML/PDF Template Builder**: Visual drag-and-drop editor
- **PDF/JPEG Field Mapper**: Map data fields to specific positions on templates
- **Unlimited Templates**: Create and manage multiple certificate/marksheet templates
- **Version Control**: Track template changes and versions
- **Field Types**: Support for text, numbers, dates, images, and QR codes

### 📜 Certificate Generation
- **Direct Upload Mode**: Manually create individual certificates
- **Bulk CSV Import**: Import hundreds/thousands of certificates at once
- **Advanced CSV Creator**: Dynamic field mapping based on templates
- **Auto PDF Generation**: Automatically generate PDFs for all certificates
- **QR Code Module**: Toggleable QR codes for verification (on/off per university)
- **Batch Processing**: Track and manage bulk operations

### 🔍 Student Portal & Verification
- **Search Functionality**: Search by name, roll number, or certificate number
- **Secure Verification Engine**: Verify certificates using unique verification codes
- **Public Verification**: Anyone can verify certificate authenticity
- **Download Tracking**: Monitor certificate downloads

### 🔐 Security & Access Control
- **Role-Based Access**: Super Admin, Admin, and Staff roles
- **JWT Authentication**: Secure API endpoints
- **University Isolation**: Users can only access their university's data
- **Certificate Revocation**: Ability to revoke and track revoked certificates
- **Rate Limiting**: Protection against abuse and DDoS attacks
  - General API: 100 requests per 15 minutes
  - Authentication: 5 attempts per 15 minutes (with skip on success)
  - File Uploads: 50 per hour
  - Certificate Generation: 100 per hour
  - Public Verification: 1000 per 15 minutes

## Tech Stack

### Backend
- **Node.js & Express**: RESTful API server
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication
- **pdf-lib**: PDF generation and manipulation
- **qrcode**: QR code generation
- **csvtojson**: CSV parsing for bulk imports

### Security
- **helmet**: Security headers
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting and DDoS protection

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

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
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/educertengine
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=30d
   BASE_DOMAIN=localhost:5000
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin",
  "universityId": "university_id_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### University Endpoints

#### Create University (Super Admin only)
```http
POST /api/universities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Example University",
  "subdomain": "example-uni",
  "branding": {
    "primaryColor": "#1a73e8",
    "secondaryColor": "#34a853"
  },
  "settings": {
    "enableQRCode": true,
    "allowBulkImport": true
  }
}
```

#### Get All Universities
```http
GET /api/universities
Authorization: Bearer <token>
```

#### Get University by Subdomain
```http
GET /api/universities/subdomain/:subdomain
```

### Template Endpoints

#### Create Template
```http
POST /api/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Degree Certificate",
  "type": "certificate",
  "fields": [
    {
      "name": "studentName",
      "label": "Student Name",
      "type": "text",
      "position": { "x": 100, "y": 200, "width": 400, "height": 30 },
      "style": { "fontSize": 24, "fontWeight": "bold" },
      "required": true
    }
  ],
  "dimensions": {
    "width": 792,
    "height": 612,
    "orientation": "landscape"
  }
}
```

#### Get All Templates
```http
GET /api/templates
Authorization: Bearer <token>
```

#### Upload Template Background
```http
POST /api/templates/:id/upload-background
Authorization: Bearer <token>
Content-Type: multipart/form-data

background: <file>
```

### Certificate Endpoints

#### Create Single Certificate
```http
POST /api/certificates
Authorization: Bearer <token>
Content-Type: application/json

{
  "templateId": "template_id",
  "studentInfo": {
    "name": "Jane Smith",
    "rollNumber": "2024001",
    "email": "jane@example.com"
  },
  "courseInfo": {
    "courseName": "Computer Science",
    "completionDate": "2024-05-15",
    "grade": "A"
  },
  "fieldData": {
    "studentName": "Jane Smith",
    "courseName": "Computer Science"
  }
}
```

#### Generate Certificate PDF
```http
POST /api/certificates/:id/generate
Authorization: Bearer <token>
```

#### Bulk Import from CSV
```http
POST /api/certificates/bulk-import
Authorization: Bearer <token>
Content-Type: multipart/form-data

templateId: template_id
csvFile: <file>
```

#### Search Certificates
```http
GET /api/certificates/search?query=Jane&universityId=uni_id
```

#### Verify Certificate
```http
GET /api/certificates/verify/:verificationCode
```

## CSV Import Format

For bulk certificate import, prepare a CSV file with the following structure:

```csv
studentName,rollNumber,email,courseName,completionDate,grade
Jane Smith,2024001,jane@example.com,Computer Science,2024-05-15,A
John Doe,2024002,john@example.com,Mathematics,2024-05-15,B+
```

The CSV fields should match the template fields defined in your certificate template.

## Directory Structure

```
EduCertEngine/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.js   # Database connection
│   ├── models/           # Mongoose models
│   │   ├── University.js
│   │   ├── User.js
│   │   ├── Template.js
│   │   └── Certificate.js
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── universityController.js
│   │   ├── templateController.js
│   │   └── certificateController.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── universities.js
│   │   ├── templates.js
│   │   └── certificates.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js
│   │   └── subdomain.js
│   └── utils/            # Utility functions
│       ├── qrGenerator.js
│       ├── pdfGenerator.js
│       └── csvParser.js
├── public/               # Static files
│   ├── uploads/          # User uploads
│   ├── certificates/     # Generated certificates
│   └── templates/        # Template files
├── server.js             # Application entry point
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Usage Examples

### 1. Setting Up a University

```javascript
// Create a new university
POST /api/universities
{
  "name": "Tech University",
  "subdomain": "tech-uni",
  "branding": {
    "primaryColor": "#0066cc",
    "secondaryColor": "#ff9900"
  },
  "landingPage": {
    "heroTitle": "Welcome to Tech University",
    "heroSubtitle": "Excellence in Education"
  },
  "seo": {
    "title": "Tech University - Certificates",
    "description": "Official certificate portal"
  },
  "settings": {
    "enableQRCode": true,
    "allowDirectUpload": true,
    "allowBulkImport": true
  }
}
```

### 2. Creating a Certificate Template

```javascript
// Create a template with fields
POST /api/templates
{
  "name": "Graduation Certificate",
  "type": "certificate",
  "fields": [
    {
      "name": "studentName",
      "label": "Student Name",
      "type": "text",
      "position": { "x": 100, "y": 150 },
      "style": { "fontSize": 28, "fontWeight": "bold" },
      "required": true
    },
    {
      "name": "degree",
      "label": "Degree",
      "type": "text",
      "position": { "x": 100, "y": 200 },
      "style": { "fontSize": 20 }
    },
    {
      "name": "qrCode",
      "type": "qrcode",
      "position": { "x": 650, "y": 450, "width": 100, "height": 100 }
    }
  ]
}
```

### 3. Bulk Certificate Generation

```javascript
// Upload CSV file
POST /api/certificates/bulk-import
FormData: {
  templateId: "template_123",
  csvFile: certificates.csv
}

// Response includes batch ID for tracking
{
  "success": true,
  "message": "Successfully imported 150 certificates",
  "batchId": "BATCH-1234567890"
}
```

## Features in Detail

### QR Code Integration
- Each certificate can include a QR code for quick verification
- QR codes link to verification page with certificate details
- Toggleable at university level and template level

### Multi-Tenancy
- Each university operates on its own subdomain (e.g., `tech-uni.educert.com`)
- Complete data isolation between universities
- Custom branding and landing pages per subdomain

### Security Features
- JWT-based authentication
- Role-based access control (Super Admin, Admin, Staff)
- Secure password hashing with bcrypt
- Certificate revocation system
- Verification code validation

## Development

### Running in Development Mode
```bash
npm run dev
```

This starts the server with nodemon for auto-reloading on code changes.

### Testing
```bash
npm test
```

## Deployment

### Environment Variables for Production
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
BASE_DOMAIN=your-domain.com
```

### Recommended Production Setup
- Use MongoDB Atlas or similar managed database
- Deploy on platforms like Heroku, AWS, or DigitalOcean
- Set up SSL/TLS certificates for HTTPS
- Configure proper subdomain routing in DNS
- Use environment variables for sensitive data
- Enable logging and monitoring

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

## ✅ Recently Implemented Features

### Backend APIs (100% Complete)
- ✅ File upload system with validation
- ✅ Document download with tracking
- ✅ Batch certificate generation
- ✅ Template builder utilities (HTML validation, Fabric.js conversion)
- ✅ Analytics system (university, system, template)
- ✅ Email notification infrastructure
- ✅ Document versioning system
- ✅ Advanced search with filters
- ✅ Bulk operations
- ✅ CSV export functionality

### New API Endpoints (25+)
See `API_ENDPOINTS.md` for complete documentation:
- File upload and management
- Advanced search and filtering
- Analytics and reporting
- Template building tools
- Batch operations
- Document versioning

## Roadmap

### Completed ✅
- ✅ Email notification system (infrastructure ready)
- ✅ Advanced analytics dashboard (API ready)
- ✅ Real-time certificate preview (API ready)
- ✅ Batch operations
- ✅ Advanced search and filtering
- ✅ Document versioning

### Future Enhancements
- [ ] Frontend React application with drag-and-drop template builder
- [ ] Email provider integration (SendGrid/SES/SMTP)
- [ ] Blockchain-based verification
- [ ] Mobile app for certificate viewing
- [ ] Multi-language support
- [ ] Export to multiple formats (PNG, JPEG, SVG)
- [ ] Background job processing with Bull/BullMQ
- [ ] Redis caching layer

## Acknowledgments

- Built with Node.js and Express
- Uses pdf-lib for PDF generation
- QR codes powered by qrcode library
- Database powered by MongoDB

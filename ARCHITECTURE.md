# EduCertEngine Architecture

## Overview

EduCertEngine is a multi-tenancy certificate and marksheet management platform built with a microservices-ready architecture. This document describes the system architecture, design decisions, and implementation details.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile App  │  │  Public Site │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Express.js Server (Port 5000)                       │   │
│  │  - Subdomain Middleware                              │   │
│  │  - Authentication/Authorization                      │   │
│  │  - Rate Limiting                                     │   │
│  │  - Request Validation                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │   Auth    │  │University │  │ Template  │  │  Cert   │ │
│  │Controller │  │Controller │  │Controller │  │Controller│ │
│  └───────────┘  └───────────┘  └───────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Access Layer                       │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │   User    │  │University │  │ Template  │  │  Cert   │ │
│  │   Model   │  │   Model   │  │   Model   │  │  Model  │ │
│  └───────────┘  └───────────┘  └───────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                         │
│                    MongoDB (NoSQL)                           │
│  - Universities Collection                                   │
│  - Users Collection                                          │
│  - Templates Collection                                      │
│  - Certificates Collection                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      File Storage Layer                      │
│  Local Storage / AWS S3 / Cloud Storage                     │
│  - Certificate PDFs                                          │
│  - Template Backgrounds                                      │
│  - QR Codes                                                  │
│  - User Uploads                                              │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Multi-Tenancy System

**Subdomain Routing:**
```
tech-uni.educert.com → Tech University
medical-college.educert.com → Medical College
```

**Implementation:**
- Middleware extracts subdomain from request host
- Looks up university by subdomain
- Attaches university context to request
- All subsequent operations are scoped to that university

**Key Files:**
- `src/middleware/subdomain.js`
- `src/models/University.js`

### 2. Authentication & Authorization

**Authentication Flow:**
```
1. User submits credentials
2. Server validates against database
3. JWT token generated and returned
4. Client includes token in subsequent requests
5. Middleware validates token on each request
```

**Authorization Hierarchy:**
- **Super Admin**: Full system access, can manage all universities
- **Admin**: University-level access, can manage templates and certificates
- **Staff**: Limited access, can create certificates

**Key Files:**
- `src/middleware/auth.js`
- `src/controllers/authController.js`
- `src/models/User.js`

### 3. Template Management

**Template Structure:**
```javascript
{
  name: "Graduation Certificate",
  type: "certificate",
  fields: [
    {
      name: "studentName",
      type: "text",
      position: { x: 100, y: 200 },
      style: { fontSize: 24, fontWeight: "bold" }
    }
  ],
  dimensions: { width: 792, height: 612 }
}
```

**Field Types:**
- Text: Student names, course names, etc.
- Number: Roll numbers, marks
- Date: Completion dates, issue dates
- QR Code: Verification codes
- Image: Photos, signatures

**Key Files:**
- `src/models/Template.js`
- `src/controllers/templateController.js`

### 4. Certificate Generation

**Generation Pipeline:**
```
CSV Upload → Parse → Validate → Create Records → Generate PDFs → Create QR Codes
```

**Steps:**
1. Parse CSV file
2. Validate against template fields
3. Create certificate records in database
4. Generate unique certificate numbers
5. Generate verification codes
6. Create QR codes
7. Generate PDF files
8. Store file paths in database

**Key Files:**
- `src/utils/csvParser.js`
- `src/utils/pdfGenerator.js`
- `src/utils/qrGenerator.js`
- `src/controllers/certificateController.js`

### 5. Verification System

**Verification Flow:**
```
User scans QR → Redirected to verification page → 
Enter code → Server validates → Display certificate details
```

**Security Features:**
- Unique verification codes (12 characters)
- Public verification endpoint (no auth required)
- Certificate status check (issued, revoked)
- University validation

## Data Models

### University Model

```javascript
{
  name: String,
  subdomain: String (unique, indexed),
  logo: String,
  branding: {
    primaryColor: String,
    secondaryColor: String,
    fontFamily: String
  },
  landingPage: { ... },
  seo: { ... },
  settings: {
    enableQRCode: Boolean,
    allowDirectUpload: Boolean,
    allowBulkImport: Boolean
  },
  admins: [ObjectId],
  isActive: Boolean
}
```

### User Model

```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum['superadmin', 'admin', 'staff'],
  university: ObjectId,
  isActive: Boolean
}
```

### Template Model

```javascript
{
  university: ObjectId,
  name: String,
  type: Enum['certificate', 'marksheet', ...],
  fields: [FieldSchema],
  dimensions: DimensionSchema,
  qrCode: QRCodeSchema,
  version: Number,
  isActive: Boolean
}
```

### Certificate Model

```javascript
{
  university: ObjectId,
  template: ObjectId,
  certificateNumber: String (unique, indexed),
  studentInfo: { ... },
  courseInfo: { ... },
  fieldData: Map,
  pdfFile: String,
  qrCode: String,
  verificationCode: String (unique, indexed),
  status: Enum['draft', 'generated', 'issued', 'revoked'],
  batchId: String
}
```

## Design Patterns

### 1. MVC Architecture

```
Model → Data structure and database operations
View → Client applications (future)
Controller → Business logic and request handling
```

### 2. Middleware Pattern

```javascript
Request → Middleware Chain → Route Handler → Response
          ↓
    - CORS
    - Helmet (Security)
    - Body Parser
    - File Upload
    - Subdomain Detection
    - Authentication
    - Authorization
```

### 3. Repository Pattern (Mongoose Models)

Encapsulates data access logic in models.

### 4. Factory Pattern (Certificate Generation)

Generates different types of certificates based on templates.

## Security Architecture

### 1. Authentication Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with expiration
- Secure token storage
- Password requirements (minimum 6 characters)

### 2. Authorization Security

- Role-based access control (RBAC)
- University-scoped data access
- Protected routes with middleware
- Token validation on each request

### 3. Data Security

- MongoDB authentication enabled
- Environment variables for secrets
- Input validation
- SQL injection prevention (NoSQL, parameterized queries)
- XSS prevention (helmet middleware)

### 4. File Security

- File type validation
- File size limits
- Secure file paths
- Access control for sensitive files

### 5. API Security

- CORS configuration
- Helmet security headers
- Rate limiting (planned)
- Request validation

## Performance Considerations

### 1. Database Optimization

**Indexes:**
- University subdomain (unique)
- Certificate number (unique)
- Verification code (unique)
- Full-text search on student info

**Query Optimization:**
- Populate only needed fields
- Pagination for large result sets
- Lean queries for read-only operations

### 2. Caching Strategy (Future)

- Redis for session storage
- Cache frequently accessed data
- Cache generated PDFs
- CDN for static assets

### 3. File Storage

- Efficient file naming
- Directory organization
- Compression for PDFs
- Cloud storage for production

### 4. Scalability

**Horizontal Scaling:**
- Stateless API design
- Load balancer support
- Clustered database
- Distributed file storage

**Vertical Scaling:**
- Optimized queries
- Efficient algorithms
- Memory management
- CPU-intensive tasks offloading

## API Design

### RESTful Principles

```
GET /api/certificates        - List certificates
POST /api/certificates       - Create certificate
GET /api/certificates/:id    - Get certificate
PUT /api/certificates/:id    - Update certificate
DELETE /api/certificates/:id - Delete certificate
```

### Response Format

```javascript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  message: "Error message"
}
```

### HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Deployment Architecture

### Development Environment

```
Local Machine
├── Node.js Server (Port 5000)
├── MongoDB (Port 27017)
└── File Storage (./public)
```

### Production Environment

```
                    ┌──────────────┐
                    │ Load Balancer│
                    └──────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ Server 1│        │ Server 2│        │ Server 3│
   └─────────┘        └─────────┘        └─────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                    ┌──────────────┐
                    │   MongoDB    │
                    │ Replica Set  │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  AWS S3 /    │
                    │ File Storage │
                    └──────────────┘
```

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM

### Libraries
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **pdf-lib**: PDF generation
- **qrcode**: QR code generation
- **csvtojson**: CSV parsing
- **helmet**: Security headers
- **cors**: CORS handling

### DevOps
- **PM2**: Process management
- **Nginx**: Reverse proxy
- **Let's Encrypt**: SSL certificates
- **Docker**: Containerization (optional)

## Future Enhancements

### 1. Frontend Application
- React admin panel
- Drag-and-drop template designer
- Real-time preview
- Analytics dashboard

### 2. Advanced Features
- Email notifications
- Blockchain verification
- Multi-language support
- Mobile apps
- Advanced analytics

### 3. Integration
- LMS integration
- Payment gateway
- SMS notifications
- Cloud storage providers

### 4. Performance
- Redis caching
- CDN integration
- Database sharding
- Microservices architecture

## Monitoring & Logging

### Application Monitoring
- PM2 monitoring
- Error tracking (Sentry)
- Performance monitoring (New Relic)

### Logging Strategy
- Winston for application logs
- Morgan for HTTP logs
- Log rotation
- Centralized logging

### Metrics
- API response times
- Database query performance
- Certificate generation time
- System resource usage

## Testing Strategy (Future)

### Unit Tests
- Model validation
- Utility functions
- Middleware logic

### Integration Tests
- API endpoints
- Database operations
- File operations

### End-to-End Tests
- Complete user flows
- Certificate generation pipeline
- Verification process

## Conclusion

EduCertEngine is designed with scalability, security, and maintainability in mind. The architecture supports multi-tenancy, provides robust certificate management, and can be extended for future requirements.

For implementation details, see the code in the `src/` directory.

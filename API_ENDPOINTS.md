# EduCertEngine - Complete API Reference

## New API Endpoints Implemented

### File Upload API

#### Upload Single File
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
folder: "uploads" (optional)
universityId: "university_id" (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "abc123.pdf",
    "originalName": "certificate.pdf",
    "mimetype": "application/pdf",
    "size": 123456,
    "url": "/uploads/general/abc123.pdf",
    "path": "/full/path/to/file"
  }
}
```

#### Upload Multiple Files
```http
POST /api/upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [<file1>, <file2>, ...]
folder: "uploads" (optional)
universityId: "university_id" (optional)
```

#### Delete File
```http
DELETE /api/upload/:filename
Authorization: Bearer <token>

Query Parameters:
- folder: "uploads" (optional)
- universityId: "university_id" (optional)
```

### Certificate Download & Batch Generation

#### Download Certificate
```http
GET /api/certificates/:id/download
```

Downloads the certificate PDF. Tracks download count automatically.

#### Batch Generate Certificates
```http
POST /api/certificates/batch-generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "certificateIds": ["cert_id_1", "cert_id_2", ...],
  "batchId": "BATCH-12345" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 8 out of 10 certificates",
  "data": {
    "success": ["cert_id_1", "cert_id_2", ...],
    "failed": [
      {
        "id": "cert_id_3",
        "reason": "Template not found"
      }
    ],
    "total": 10
  }
}
```

### Template Builder APIs

#### Validate HTML Template
```http
POST /api/templates/validate-html
Authorization: Bearer <token>
Content-Type: application/json

{
  "htmlContent": "<html>...</html>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "variables": ["studentName", "courseName", "date"]
  }
}
```

#### Preview Template
```http
POST /api/templates/:id/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "sampleData": {
    "studentName": "John Doe",
    "courseName": "Computer Science",
    "grade": "A"
  }
}
```

#### Convert Fabric.js to Template
```http
POST /api/templates/fabric-to-template
Authorization: Bearer <token>
Content-Type: application/json

{
  "fabricConfig": {
    "objects": [
      {
        "type": "text",
        "name": "studentName",
        "left": 100,
        "top": 200,
        "fontSize": 24,
        "text": "Student Name"
      }
    ]
  },
  "templateId": "template_id" (optional)
}
```

#### Generate Field Mapping
```http
POST /api/templates/generate-mapping
Authorization: Bearer <token>
Content-Type: application/json

{
  "fields": [
    {
      "name": "studentName",
      "label": "Student Name",
      "type": "text",
      "x": 100,
      "y": 200,
      "width": 300,
      "height": 40,
      "fontSize": 18
    }
  ]
}
```

#### Clone Template
```http
POST /api/templates/:id/clone
Authorization: Bearer <token>
```

Creates a copy of the template with "(Copy)" appended to the name.

### Analytics APIs

#### Get University Analytics
```http
GET /api/analytics/university
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCertificates": 1500,
      "certificatesByStatus": {
        "draft": 20,
        "issued": 1450,
        "revoked": 30
      },
      "templatesSummary": {
        "total": 10,
        "active": 8,
        "inactive": 2
      },
      "downloadStats": {
        "total": 3000,
        "average": 2
      }
    },
    "trends": {
      "certificatesByMonth": [...]
    },
    "recent": {
      "certificates": [...],
      "mostDownloaded": [...]
    }
  }
}
```

#### Get System Analytics (Super Admin)
```http
GET /api/analytics/system
Authorization: Bearer <super_admin_token>
```

Returns system-wide statistics across all universities.

#### Get Template Analytics
```http
GET /api/analytics/template/:id
Authorization: Bearer <token>
```

Returns usage statistics for a specific template.

#### Get Download Trends
```http
GET /api/analytics/downloads?days=30
Authorization: Bearer <token>
```

Returns download trends for the specified number of days.

### University Management (Already Existed)

#### Update University
```http
PUT /api/universities/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated University Name",
  "primaryColor": "#ff5733",
  "qrEnabled": false
}
```

## Rate Limits

All API endpoints are protected with rate limiting:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **File Uploads**: 50 per hour
- **Certificate Generation**: 100 per hour
- **Public Verification**: 1000 per 15 minutes

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Supported File Types

### Upload API
- Images: JPEG, PNG, GIF
- Documents: PDF
- Archives: ZIP
- Templates: HTML
- Data: CSV

### Maximum File Size
- Default: 10 MB
- Configurable via `MAX_FILE_SIZE` environment variable

## Template Variable Format

Templates use double curly braces for variables:

```html
<div>
  <h1>{{studentName}}</h1>
  <p>Course: {{courseName}}</p>
  <p>Grade: {{grade}}</p>
</div>
```

## Field Types

Supported field types for templates:

1. **text** - Text content
2. **number** - Numeric values
3. **date** - Date values
4. **image** - Image files
5. **qrcode** - QR code generation

## Background Processing

The following operations support batch processing:

- Certificate generation
- PDF creation
- QR code generation
- Email notifications (when configured)

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- SQL injection protection (Mongoose)
- XSS protection
- CSRF protection
- Rate limiting
- File type validation
- File size validation

## Next.js API Routes

The following routes are implemented in the Next.js app directory:

- `/api/auth/superadmin-register`
- `/api/auth/superadmin-login`
- `/api/auth/admin-login`
- `/api/university/create`
- `/api/university/list`
- `/api/template/create`
- `/api/template/list`
- `/api/student/create`
- `/api/student/list`
- `/api/student/search`
- `/api/student/import`
- `/api/csv/create`
- `/api/verify/[hash]`

## Express.js API Routes

Additional routes provided by the Express backend (server.js):

- All certificate operations
- File uploads
- Analytics
- Batch operations
- Download functionality

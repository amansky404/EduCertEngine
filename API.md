# API Documentation

## Base URL
```
http://localhost:5000/api
```

For subdomain-based access:
```
http://{university-subdomain}.localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Register User
**POST** `/auth/register`

Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin",
  "universityId": "university_object_id"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "token": "jwt_token_here"
  }
}
```

### Login
**POST** `/auth/login`

Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "token": "jwt_token_here"
  }
}
```

### Get Current User
**GET** `/auth/me`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "university": {
      "_id": "uni_id",
      "name": "Example University"
    }
  }
}
```

## Universities

### Create University (Super Admin Only)
**POST** `/universities`

Headers:
```
Authorization: Bearer <token>
```

Request Body:
```json
{
  "name": "Tech University",
  "subdomain": "tech-uni",
  "logo": "https://example.com/logo.png",
  "branding": {
    "primaryColor": "#1a73e8",
    "secondaryColor": "#34a853",
    "fontFamily": "Arial, sans-serif"
  },
  "landingPage": {
    "heroTitle": "Welcome to Tech University",
    "heroSubtitle": "Excellence in Education",
    "aboutText": "About our institution..."
  },
  "seo": {
    "title": "Tech University Certificates",
    "description": "Official certificate portal",
    "keywords": ["certificates", "education", "tech"]
  },
  "settings": {
    "enableQRCode": true,
    "allowDirectUpload": true,
    "allowBulkImport": true,
    "enableStudentPortal": true
  },
  "contactInfo": {
    "email": "info@techuni.edu",
    "phone": "+1234567890",
    "address": "123 University Ave"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "uni_id",
    "name": "Tech University",
    "subdomain": "tech-uni",
    // ... other fields
  }
}
```

### Get All Universities
**GET** `/universities`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### Get Single University
**GET** `/universities/:id`

### Update University
**PUT** `/universities/:id`

### Delete University
**DELETE** `/universities/:id`

### Get University by Subdomain
**GET** `/universities/subdomain/:subdomain`

Public endpoint, no authentication required.

## Templates

### Create Template
**POST** `/templates`

Headers:
```
Authorization: Bearer <token>
```

Request Body:
```json
{
  "name": "Graduation Certificate",
  "type": "certificate",
  "description": "Standard graduation certificate template",
  "fields": [
    {
      "name": "studentName",
      "label": "Student Name",
      "type": "text",
      "position": {
        "x": 100,
        "y": 200,
        "width": 400,
        "height": 50
      },
      "style": {
        "fontSize": 24,
        "fontFamily": "Arial",
        "fontWeight": "bold",
        "color": "#000000",
        "align": "center"
      },
      "required": true
    },
    {
      "name": "courseName",
      "label": "Course Name",
      "type": "text",
      "position": {
        "x": 100,
        "y": 300,
        "width": 400,
        "height": 40
      },
      "style": {
        "fontSize": 18,
        "color": "#333333"
      }
    },
    {
      "name": "completionDate",
      "label": "Completion Date",
      "type": "date",
      "position": {
        "x": 100,
        "y": 400
      }
    },
    {
      "name": "qrCode",
      "type": "qrcode",
      "position": {
        "x": 650,
        "y": 450,
        "width": 100,
        "height": 100
      }
    }
  ],
  "dimensions": {
    "width": 792,
    "height": 612,
    "orientation": "landscape"
  },
  "qrCode": {
    "enabled": true,
    "position": {
      "x": 650,
      "y": 450,
      "size": 100
    },
    "dataFields": ["certificateNumber", "studentName", "verificationCode"]
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "template_id",
    "name": "Graduation Certificate",
    // ... other fields
  }
}
```

### Get All Templates
**GET** `/templates`

Query Parameters:
- `type`: Filter by type (certificate, marksheet, etc.)
- `isActive`: Filter by active status (true/false)

### Get Single Template
**GET** `/templates/:id`

### Update Template
**PUT** `/templates/:id`

### Delete Template
**DELETE** `/templates/:id`

### Upload Template Background
**POST** `/templates/:id/upload-background`

Headers:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Form Data:
```
background: <file> (PDF or image file)
```

## Certificates

### Create Single Certificate
**POST** `/certificates`

Headers:
```
Authorization: Bearer <token>
```

Request Body:
```json
{
  "templateId": "template_id",
  "studentInfo": {
    "name": "Jane Smith",
    "rollNumber": "2024001",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "2000-01-15"
  },
  "courseInfo": {
    "courseName": "Computer Science",
    "courseDuration": "4 years",
    "completionDate": "2024-05-15",
    "issueDate": "2024-06-01",
    "grade": "A",
    "cgpa": "8.5",
    "percentage": "85%"
  },
  "fieldData": {
    "studentName": "Jane Smith",
    "courseName": "Computer Science",
    "grade": "A",
    "completionDate": "May 15, 2024"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "cert_id",
    "certificateNumber": "CERT-2024-000001",
    "verificationCode": "ABC123DEF456",
    "status": "draft",
    // ... other fields
  }
}
```

### Generate Certificate PDF
**POST** `/certificates/:id/generate`

Headers:
```
Authorization: Bearer <token>
```

This endpoint generates the PDF file and QR code for the certificate.

Response:
```json
{
  "success": true,
  "data": {
    "_id": "cert_id",
    "pdfFile": "/certificates/pdf/CERT-2024-000001.pdf",
    "qrCode": "/certificates/qr/cert_id.png",
    "status": "generated",
    // ... other fields
  }
}
```

### Bulk Import from CSV
**POST** `/certificates/bulk-import`

Headers:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Form Data:
```
templateId: template_id
csvFile: <file> (CSV file)
```

CSV Format Example:
```csv
studentName,rollNumber,email,courseName,completionDate,grade
Jane Smith,2024001,jane@example.com,Computer Science,2024-05-15,A
John Doe,2024002,john@example.com,Mathematics,2024-05-15,B+
```

Response:
```json
{
  "success": true,
  "message": "Successfully imported 2 certificates",
  "batchId": "BATCH-1234567890",
  "data": [...]
}
```

### Get All Certificates
**GET** `/certificates`

Headers:
```
Authorization: Bearer <token>
```

Query Parameters:
- `status`: Filter by status (draft, generated, issued, revoked)
- `batchId`: Filter by batch ID
- `limit`: Limit number of results (default: 50)

### Get Single Certificate
**GET** `/certificates/:id`

### Search Certificates (Public)
**GET** `/certificates/search`

Query Parameters:
- `query`: Search term (name, roll number, or certificate number)
- `universityId`: University ID to search within

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "certificateNumber": "CERT-2024-000001",
      "studentInfo": {
        "name": "Jane Smith",
        "rollNumber": "2024001"
      },
      "courseInfo": {
        "courseName": "Computer Science"
      }
    }
  ]
}
```

### Verify Certificate (Public)
**GET** `/certificates/verify/:verificationCode`

No authentication required. Public endpoint.

Example:
```
GET /certificates/verify/ABC123DEF456
```

Response:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "certificate": {
      "certificateNumber": "CERT-2024-000001",
      "studentInfo": {
        "name": "Jane Smith",
        "rollNumber": "2024001"
      },
      "courseInfo": {
        "courseName": "Computer Science",
        "completionDate": "2024-05-15",
        "grade": "A"
      },
      "university": {
        "name": "Tech University",
        "logo": "https://..."
      },
      "issueDate": "2024-06-01"
    }
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing rate limiting for:
- Authentication endpoints: 5 requests per minute
- Public endpoints: 100 requests per minute
- Protected endpoints: 1000 requests per minute

## Webhooks (Future Feature)

Planned webhook events:
- `certificate.created`
- `certificate.generated`
- `certificate.issued`
- `certificate.revoked`
- `certificate.verified`

## API Versioning

Current API version: v1

All endpoints are prefixed with `/api/`. Future versions will use `/api/v2/`, etc.

## Support

For API support or questions, please open an issue on GitHub or contact the maintainers.

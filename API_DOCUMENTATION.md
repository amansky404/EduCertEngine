# EduCertSuite - API Documentation

## Base URL

- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register Super Admin

```http
POST /api/auth/superadmin-register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "name": "John Doe",
    "role": "super_admin"
  }
}
```

#### Super Admin Login

```http
POST /api/auth/superadmin-login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

#### University Admin Login

```http
POST /api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@university.edu",
  "password": "securepassword"
}
```

### University Management

#### Create University

```http
POST /api/university/create
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "name": "Example University",
  "subdomain": "exampleuni",
  "slug": "example-university",
  "adminEmail": "admin@exampleuni.edu",
  "adminPassword": "securepassword",
  "adminName": "University Admin",
  "primaryColor": "#3b82f6",
  "secondaryColor": "#1e40af",
  "qrEnabled": true
}
```

**Response:**
```json
{
  "university": {
    "id": "university_id",
    "name": "Example University",
    "subdomain": "exampleuni",
    "slug": "example-university",
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af",
    "qrEnabled": true,
    "isActive": true,
    "admins": [
      {
        "id": "admin_id",
        "email": "admin@exampleuni.edu",
        "name": "University Admin",
        "role": "admin"
      }
    ]
  }
}
```

#### List Universities

```http
GET /api/university/list
Authorization: Bearer <token>
```

**Response:**
```json
{
  "universities": [
    {
      "id": "university_id",
      "name": "Example University",
      "subdomain": "exampleuni",
      "slug": "example-university",
      "isActive": true,
      "_count": {
        "admins": 1,
        "students": 150,
        "templates": 5,
        "documents": 450
      }
    }
  ]
}
```

### Template Management

#### Create Template

```http
POST /api/template/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Degree Certificate 2024",
  "type": "HTML",
  "description": "Bachelor degree certificate template",
  "qrEnabled": true
}
```

**Template Types:**
- `HTML` - HTML Template Builder
- `PDF_MAPPER` - PDF/JPEG Field Mapper
- `DIRECT_UPLOAD` - Direct Document Upload

**Response:**
```json
{
  "template": {
    "id": "template_id",
    "universityId": "university_id",
    "name": "Degree Certificate 2024",
    "type": "HTML",
    "description": "Bachelor degree certificate template",
    "qrEnabled": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### List Templates

```http
GET /api/template/list
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "templates": [
    {
      "id": "template_id",
      "name": "Degree Certificate 2024",
      "type": "HTML",
      "description": "Bachelor degree certificate template",
      "qrEnabled": true,
      "isActive": true,
      "_count": {
        "documents": 150
      }
    }
  ]
}
```

### Student Management

#### Search Student

```http
GET /api/student/search?type=roll&value=12345&subdomain=exampleuni
```

**Query Parameters:**
- `type`: Search type (`roll`, `mobile`, `dob`)
- `value`: Search value
- `subdomain`: University subdomain

**Response:**
```json
{
  "student": {
    "name": "John Doe",
    "rollNo": "12345",
    "regNo": "REG/2024/001",
    "email": "john@example.com"
  },
  "documents": [
    {
      "id": "document_id",
      "title": "Degree Certificate",
      "pdfUrl": "/uploads/documents/cert.pdf",
      "qrHash": "verification_hash",
      "isPublished": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "template": {
        "name": "Degree Certificate 2024",
        "type": "HTML"
      }
    }
  ]
}
```

### CSV Configuration

#### Create CSV Configuration

```http
POST /api/csv/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Student Import Template",
  "fields": [
    {
      "name": "roll_no",
      "type": "text",
      "required": true
    },
    {
      "name": "student_name",
      "type": "text",
      "required": true
    },
    {
      "name": "email",
      "type": "email",
      "required": false
    },
    {
      "name": "mobile",
      "type": "phone",
      "required": false
    },
    {
      "name": "dob",
      "type": "date",
      "required": false
    }
  ]
}
```

**Field Types:**
- `text` - Text field
- `number` - Numeric field
- `date` - Date field
- `email` - Email address
- `phone` - Phone number
- `dropdown` - Select dropdown
- `boolean` - Yes/No checkbox
- `url` - File URL

**Response:**
```json
{
  "success": true,
  "message": "CSV configuration saved",
  "config": {
    "name": "Student Import Template",
    "fields": [...]
  }
}
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Pagination

List endpoints support pagination via query parameters:

```
?page=1&perPage=20
```

**Response includes pagination metadata:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

# Quick Start Guide

Get EduCertEngine up and running in 5 minutes!

## Prerequisites

- Node.js v14+ installed
- MongoDB installed and running
- Basic knowledge of REST APIs

## Step 1: Clone and Install

```bash
git clone https://github.com/amansky404/EduCertEngine.git
cd EduCertEngine
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (default settings work for local development).

## Step 3: Start MongoDB

```bash
# macOS/Linux
mongod

# Or if installed via brew
brew services start mongodb-community

# Windows
net start MongoDB
```

## Step 4: Seed Sample Data

```bash
npm run seed
```

This creates:
- A sample university (Tech University)
- Three users (super admin, admin, staff)
- Two certificate templates

**Sample Credentials:**
- **Super Admin**: admin@educert.com / admin123
- **University Admin**: admin@techuni.edu / admin123
- **Staff**: staff@techuni.edu / staff123

## Step 5: Start the Server

```bash
npm run dev
```

Server starts at `http://localhost:5000`

## Step 6: Test the API

### 1. Login to Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@techuni.edu",
    "password": "admin123"
  }'
```

Copy the `token` from the response.

### 2. Get Templates

```bash
curl http://localhost:5000/api/templates \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Create a Certificate

```bash
curl -X POST http://localhost:5000/api/certificates \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "TEMPLATE_ID_FROM_STEP_2",
    "studentInfo": {
      "name": "John Doe",
      "rollNumber": "2024001",
      "email": "john@example.com"
    },
    "courseInfo": {
      "courseName": "Computer Science",
      "completionDate": "2024-05-15",
      "grade": "A"
    },
    "fieldData": {
      "studentName": "John Doe",
      "rollNumber": "2024001",
      "courseName": "Computer Science",
      "completionDate": "May 15, 2024",
      "grade": "A"
    }
  }'
```

### 4. Generate Certificate PDF

```bash
curl -X POST http://localhost:5000/api/certificates/CERTIFICATE_ID/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Verify Certificate (No Auth Required)

```bash
curl http://localhost:5000/api/certificates/verify/VERIFICATION_CODE
```

## Quick Test with Postman

1. **Import the following endpoints into Postman:**

   **Environment Variables:**
   - `base_url`: http://localhost:5000
   - `token`: (set after login)

2. **Authentication Collection:**

   **Login:**
   ```
   POST {{base_url}}/api/auth/login
   Body (JSON):
   {
     "email": "admin@techuni.edu",
     "password": "admin123"
   }
   ```

3. **Certificate Collection:**

   **Get Templates:**
   ```
   GET {{base_url}}/api/templates
   Headers:
   Authorization: Bearer {{token}}
   ```

   **Create Certificate:**
   ```
   POST {{base_url}}/api/certificates
   Headers:
   Authorization: Bearer {{token}}
   Body: (see Step 6.3 above)
   ```

## Testing Subdomain Routing

To test subdomain routing locally, you need to modify your hosts file:

**macOS/Linux:** `/etc/hosts`
**Windows:** `C:\Windows\System32\drivers\etc\hosts`

Add these lines:
```
127.0.0.1 tech-uni.localhost
127.0.0.1 localhost
```

Then access:
- Main site: `http://localhost:5000`
- Tech University: `http://tech-uni.localhost:5000`

## Bulk Import Test

1. **Create a CSV file** (`test-certificates.csv`):

```csv
studentName,rollNumber,email,courseName,completionDate,grade
Jane Smith,2024001,jane@example.com,Computer Science,2024-05-15,A
John Doe,2024002,john@example.com,Mathematics,2024-05-15,B+
Alice Johnson,2024003,alice@example.com,Physics,2024-05-15,A-
```

2. **Import using curl:**

```bash
curl -X POST http://localhost:5000/api/certificates/bulk-import \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "templateId=TEMPLATE_ID" \
  -F "csvFile=@test-certificates.csv"
```

## View Generated Files

After generating certificates:
- PDFs: `./public/certificates/pdf/`
- QR Codes: `./public/certificates/qr/`

Access via browser:
```
http://localhost:5000/public/certificates/pdf/CERT-2024-000001.pdf
```

## Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in .env or kill process on port 5000

### Invalid Token
```
{"success":false,"message":"Not authorized to access this route"}
```
**Solution:** Make sure you're using a valid token from login response

## Next Steps

1. **Explore the API**: Check `API.md` for complete endpoint documentation
2. **Customize Templates**: Create your own certificate designs
3. **Add More Universities**: Create additional universities with unique subdomains
4. **Build Frontend**: Use the API to build a custom admin panel
5. **Deploy**: Follow `DEPLOYMENT.md` for production deployment

## Useful Commands

```bash
# Development with auto-reload
npm run dev

# Production mode
npm start

# Reset database and reseed
npm run seed

# View MongoDB data
mongo educertengine

# Check server health
curl http://localhost:5000/api/health
```

## Testing Checklist

- [ ] Server starts without errors
- [ ] Login successful and returns token
- [ ] Can create certificate
- [ ] Can generate PDF
- [ ] PDF file is created
- [ ] QR code is generated
- [ ] Certificate verification works
- [ ] Bulk import works with CSV
- [ ] Search certificates works

## Support

If you encounter issues:
1. Check the error message in terminal
2. Verify MongoDB is running: `mongo --eval "db.adminCommand('ping')"`
3. Check `.env` configuration
4. Review `API.md` for endpoint details
5. Open an issue on GitHub with error logs

## API Testing Tools

### Recommended Tools:
- **Postman**: Full-featured API testing
- **Insomnia**: Lightweight alternative
- **curl**: Command-line testing
- **HTTPie**: User-friendly curl alternative

### HTTPie Example:

```bash
# Install HTTPie
pip install httpie

# Login
http POST localhost:5000/api/auth/login email=admin@techuni.edu password=admin123

# Get templates with token
http localhost:5000/api/templates "Authorization: Bearer YOUR_TOKEN"
```

## Learning Resources

- **Node.js**: https://nodejs.org/en/docs/
- **Express**: https://expressjs.com/
- **MongoDB**: https://docs.mongodb.com/
- **Mongoose**: https://mongoosejs.com/docs/
- **JWT**: https://jwt.io/introduction

## What's Included

✅ Multi-university support with subdomains
✅ User authentication & authorization
✅ Template management system
✅ Certificate generation with PDF export
✅ QR code generation for verification
✅ Bulk CSV import
✅ Student search & verification portal
✅ RESTful API
✅ Comprehensive documentation

---

**Ready to build something amazing? Start coding! 🚀**

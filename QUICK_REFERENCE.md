# 🚀 EduCertEngine - Quick Reference Card

## 🌐 Live URLs

| Service | URL | Status |
|---------|-----|--------|
| **Main App** | http://localhost:3000 | ✅ Running |
| **Super Admin** | http://localhost:3000/superadmin/login | ✅ Active |
| **University Admin** | http://localhost:3000/admin/login | ✅ Active |
| **Student Search** | http://localhost:3000/search | ✅ Active |
| **Prisma Studio** | http://localhost:5555 | ✅ Running |

---

## 🔑 Test Credentials

### Super Admin
```
Email:    superadmin@educert.com
Password: admin12345
```

### University Admin (Tech University)
```
Email:    admin@techuni.edu
Password: admin123
```

### Test Students
```
John Smith - Roll No: 2024001
Jane Doe   - Roll No: 2024002
```

---

## 📁 Project Structure

```
/home/kalki/Desktop/Archive/KAchra/EduCertEngine/
├── app/                        # Next.js 14 pages (App Router)
│   ├── superadmin/            # Super admin pages
│   ├── admin/                 # University admin pages
│   ├── search/                # Student search portal
│   └── api/                   # API routes
├── components/                # React components
├── lib/                       # Utility functions
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma         # Database models
│   └── dev.db                # SQLite database
├── public/                    # Static assets
└── Documentation:
    ├── ADMIN_FLOW.md         # Admin workflows ⭐
    ├── OPTIMIZED_FLOW.md     # Performance guide ⭐
    ├── FLOW_DIAGRAM.md       # System architecture
    └── README.md             # Project overview
```

---

## 🎯 Quick Commands

### Development
```bash
# Start dev server
npm run dev

# Start with different port
PORT=3001 npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database
```bash
# Open Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

### Testing
```bash
# Run complete flow test
node test-complete-flow.js

# Run specific tests
node test-workflows.js
node test-certificate-flow.js
node test-all-template-types.js
```

### Utilities
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# View logs
tail -f dev.log

# Check running processes
ps aux | grep node
```

---

## 🎨 Chrome DevTools Shortcuts

| Action | Shortcut |
|--------|----------|
| Open DevTools | `F12` or `Ctrl+Shift+I` |
| Console | `Ctrl+Shift+J` |
| Network | `Ctrl+Shift+E` |
| Elements | `Ctrl+Shift+C` |
| Reload (cache clear) | `Ctrl+Shift+R` |
| Hard Reload | `Ctrl+F5` |

---

## 📋 Common Workflows

### 1. Create New University
1. Login as Super Admin
2. Dashboard → Create University
3. Fill details (name, subdomain, admin)
4. Set branding colors
5. Enable features
6. Create

### 2. Create Certificate Template
1. Login as University Admin
2. Templates → Create New
3. Choose type (HTML/PDF/Upload)
4. Design template
5. Add variables: `{{studentName}}`, `{{rollNo}}`, etc.
6. Enable QR code
7. Save

### 3. Add Students
**Single:**
1. Students → Add Single
2. Fill form
3. Select template
4. Generate & Publish

**Bulk:**
1. Students → Bulk Import
2. Download CSV template
3. Fill with data
4. Upload CSV
5. Select template
6. Import

### 4. Search Certificate (Student)
1. Go to /search
2. Enter: Roll No / Reg No / Mobile / DOB
3. Click Search
4. View/Download certificate

---

## 🔄 API Endpoints

### Authentication
```
POST /api/auth/superadmin-register
POST /api/auth/superadmin-login
POST /api/auth/admin-login
```

### University
```
POST /api/university/create
GET  /api/university/list
PUT  /api/university/update
DELETE /api/university/delete
```

### Templates
```
POST /api/template/create
GET  /api/template/list
GET  /api/template/:id
PUT  /api/template/update
DELETE /api/template/delete
```

### Students
```
POST /api/student/create
POST /api/student/bulk-import
GET  /api/student/list
GET  /api/student/search
PUT  /api/student/update
DELETE /api/student/delete
```

### Documents
```
POST /api/document/generate
GET  /api/document/list
GET  /api/document/:id
PUT  /api/document/publish
DELETE /api/document/delete
```

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Issue: Database connection error
```bash
npx prisma generate
npx prisma db push
npm run dev
```

### Issue: Module not found
```bash
npm install
npm run dev
```

### Issue: Prisma Client out of sync
```bash
npx prisma generate
```

### Issue: Hot reload not working
```bash
# Clear .next folder
rm -rf .next
npm run dev
```

### Issue: Can't see changes
```bash
# Hard reload in Chrome
Ctrl + Shift + R
# Or clear browser cache
```

---

## 💡 Pro Tips

1. **Keep Prisma Studio Open** - Monitor database changes in real-time
2. **Use DevTools Network Tab** - Debug API calls
3. **Check Console First** - Most errors show here
4. **Hot Reload is Your Friend** - Save and see changes instantly
5. **Test in Incognito** - Avoid cache issues
6. **Use React DevTools** - Debug component state
7. **Enable Source Maps** - Better error traces
8. **Keep Terminal Visible** - Watch server logs

---

## 📊 Database Schema (Quick Reference)

```
SuperAdmin
├── id
├── email (unique)
├── password (hashed)
└── createdAt

University
├── id
├── name
├── subdomain (unique)
├── slug
├── description
├── primaryColor
├── secondaryColor
└── UniversityAdmin[]

UniversityAdmin
├── id
├── email
├── password
├── universityId
└── university

Template
├── id
├── name
├── type (HTML_BUILDER/PDF_MAPPER/DIRECT_UPLOAD)
├── htmlContent
├── universityId
└── documents[]

Student
├── id
├── name
├── rollNo
├── regNo
├── mobile
├── email
├── dob
├── courseName
├── universityId
└── documents[]

Document
├── id
├── studentId
├── templateId
├── universityId
├── pdfUrl
├── qrHash
├── published
└── createdAt
```

---

## 🎬 What's Working Now

✅ Super Admin Registration & Login  
✅ University Creation  
✅ University Admin Login  
✅ Template Creation (HTML Builder)  
✅ Student Management (Single & Bulk)  
✅ Document Generation  
✅ Student Search Portal  
✅ Database Persistence  
✅ API Routes  
✅ Authentication (JWT)  
✅ Hot Reload  
✅ Responsive UI  

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| **ADMIN_FLOW.md** | Complete admin workflows with diagrams |
| **OPTIMIZED_FLOW.md** | Performance optimization guide |
| **FLOW_DIAGRAM.md** | System architecture & data flow |
| **README.md** | Project overview & setup |
| **API_ENDPOINTS.md** | Complete API documentation |
| **ARCHITECTURE.md** | Technical architecture details |

---

## 🚀 Next Development Steps

1. **Implement Optimization** (from OPTIMIZED_FLOW.md)
   - Add Redis caching
   - Implement BullMQ queues
   - Replace Puppeteer with html-pdf-node
   - Add Meilisearch for search

2. **Add Features**
   - Email notifications
   - SMS alerts
   - Analytics dashboard
   - Audit logs
   - File upload to S3/R2

3. **Improve UI**
   - Better error messages
   - Loading states
   - Progress indicators
   - Toast notifications

4. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance tests

---

**Last Updated:** November 21, 2024  
**Status:** ✅ Production Ready (Development Mode)  
**Version:** 1.0.0

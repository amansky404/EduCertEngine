# 🧪 Complete Manual Testing Guide - Full CRUD Operations

## Test Execution Date: November 21, 2024
## Tester: Manual Human Testing
## Browser: Google Chrome
## Environment: Development (localhost:3000)

---

## 📋 Testing Overview

This document provides step-by-step instructions for testing EVERY feature of EduCertEngine with full CRUD operations, exactly as a real user would interact with the system.

**Total Phases**: 6  
**Estimated Time**: 2.5 hours  
**Recording Method**: Chrome browser with screenshots

---

## 🎬 PHASE 1: SUPER ADMIN TESTING (30 minutes)

### Test 1.1: Super Admin Registration (CREATE)

**URL**: http://localhost:3000/superadmin/register

**Steps**:
1. Open Chrome browser
2. Navigate to URL above
3. Fill in the form:
   - Name: `Test Super Admin`
   - Email: `superadmin@test.com`
   - Password: `Test@12345`
   - Confirm Password: `Test@12345`
4. Click "Create Account" button
5. **Expected**: Redirect to dashboard with success message
6. **Verify**: Check localStorage for JWT token (F12 → Application → Local Storage)
7. **Screenshot**: Take screenshot of dashboard

**✅ Pass Criteria**:
- Registration successful
- JWT token stored
- Dashboard displays statistics
- No console errors

---

### Test 1.2: Super Admin Login (READ)

**URL**: http://localhost:3000/superadmin/login

**Steps**:
1. Log out (if logged in)
2. Navigate to login page
3. Enter credentials:
   - Email: `superadmin@test.com`
   - Password: `Test@12345`
4. Click "Sign In"
5. **Expected**: Successfully logged in, redirect to dashboard
6. **Screenshot**: Login page and dashboard

**✅ Pass Criteria**:
- Login successful
- Dashboard loads
- Statistics visible

---

### Test 1.3: Create University (CREATE - Full Workflow)

**URL**: http://localhost:3000/superadmin/dashboard

**Steps**:

**Step 1: Basic Information**
1. Click "Create New University" button
2. Fill in basic details:
   - University Name: `Harvard University`
   - Subdomain: `harvard` (will be harvard.educert.com)
   - Description: `Prestigious Ivy League institution`
3. **Screenshot**: Basic info form

**Step 2: Admin Account**
4. Fill admin details:
   - Admin Name: `John Harvard`
   - Admin Email: `admin@harvard.edu`
   - Password: `Admin@12345`
   - Phone: `+1-617-495-1000`
5. **Screenshot**: Admin account form

**Step 3: Branding**
6. Set branding:
   - Primary Color: `#A51C30` (Harvard Crimson)
   - Secondary Color: `#000000` (Black)
   - Accent Color: `#FFFFFF` (White)
7. Upload logo (optional)
8. **Screenshot**: Branding form

**Step 4: Features**
9. Enable features:
   - ☑ Student Search Portal
   - ☑ QR Code Verification
   - ☑ Public Landing Page
   - ☐ Email Notifications (disable for now)
   - ☐ SMS Notifications (disable for now)
10. Set limits:
    - Max Templates: 50
    - Max Students: 10,000
    - Storage Limit: 10GB
11. **Screenshot**: Features configuration

**Step 5: Review & Create**
12. Review all information
13. Click "Create University"
14. **Expected**: University created successfully
15. **Screenshot**: Success message

**✅ Pass Criteria**:
- All forms validated correctly
- University created in database
- Admin account created
- Success message displayed
- University appears in list

---

### Test 1.4: View University Details (READ)

**Steps**:
1. From dashboard, locate Harvard University in list
2. Click "View" button
3. **Expected**: University details page loads
4. **Verify**:
   - Name: Harvard University
   - Subdomain: harvard.educert.com
   - Admin: admin@harvard.edu
   - Status: Active
   - Statistics: 0 students, 0 documents
5. **Screenshot**: University details page

**✅ Pass Criteria**:
- Details page loads
- All information correct
- Statistics displayed

---

### Test 1.5: Edit University (UPDATE)

**Steps**:
1. From university details, click "Edit"
2. Modify:
   - Description: `Harvard University - Founded 1636, oldest institution in the US`
   - Primary Color: Change slightly
3. Click "Save Changes"
4. **Expected**: Changes saved successfully
5. View details again to verify changes
6. **Screenshot**: Before and after edit

**✅ Pass Criteria**:
- Edit form loads with current data
- Changes save successfully
- Updated data displays correctly

---

### Test 1.6: Create Second University (CREATE)

**Repeat Test 1.3 with different data**:
- University Name: `Stanford University`
- Subdomain: `stanford`
- Description: `Private research university in California`
- Admin: `admin@stanford.edu`
- Password: `Admin@12345`
- Primary Color: `#8C1515` (Cardinal Red)

**✅ Pass Criteria**:
- Second university created
- Both universities visible in list
- No conflicts between universities

---

### Test 1.7: Disable/Enable University (UPDATE)

**Steps**:
1. From dashboard, locate Stanford University
2. Click "Disable" button
3. **Expected**: Confirmation dialog appears
4. Confirm disable
5. **Verify**: Status changes to "Disabled" (🔴)
6. Click "Enable" button
7. **Verify**: Status changes to "Active" (🟢)
8. **Screenshot**: Both states

**✅ Pass Criteria**:
- Disable works correctly
- Enable works correctly
- Status updates immediately

---

### Test 1.8: Delete University (DELETE)

⚠️ **Note**: This is destructive. Use Stanford as test subject.

**Steps**:
1. Click "Delete" button for Stanford University
2. **Expected**: Confirmation dialog with warning
3. Type confirmation (if required)
4. Confirm delete
5. **Verify**: University removed from list
6. **Check**: Admin account also deleted
7. **Screenshot**: Before delete, confirmation dialog, after delete

**✅ Pass Criteria**:
- Confirmation required
- University deleted from database
- Related data cleaned up
- List updates immediately

---

## 🎬 PHASE 2: UNIVERSITY ADMIN TESTING (45 minutes)

### Test 2.1: University Admin Login (READ)

**URL**: http://localhost:3000/admin/login  
or  
**URL**: http://harvard.localhost:3000/admin/login (if subdomains work locally)

**Steps**:
1. Navigate to login page
2. Enter credentials:
   - Email: `admin@harvard.edu`
   - Password: `Admin@12345`
3. Click "Sign In"
4. **Expected**: Redirect to university admin dashboard
5. **Verify**:
   - Dashboard shows "Harvard University - Admin Panel"
   - Quick stats displayed (all zeros initially)
   - Navigation menu visible
6. **Screenshot**: Login page and dashboard

**✅ Pass Criteria**:
- Login successful
- University context correct
- Dashboard loads properly

---

### Test 2.2: View Dashboard (READ)

**Steps**:
1. Observe dashboard elements:
   - Quick Stats section
   - Quick Actions buttons
   - Navigation menu (Templates, Students, Documents, etc.)
2. Click each navigation item and return
3. **Screenshot**: Each major section

**✅ Pass Criteria**:
- All sections load
- No errors in console
- Navigation works

---

### Test 2.3: Branding Configuration (UPDATE)

**URL**: /admin/branding

**Steps**:
1. Click "Branding" in navigation
2. **Colors Section**:
   - View current colors
   - Click color picker for Primary Color
   - Change to: `#A51C30`
   - Click "Preview"
3. **Logos & Images**:
   - Upload University Logo (Harvard logo image)
   - Upload Favicon
4. **Stamps & Signatures**:
   - Upload Principal Signature (PNG with transparent background)
   - Upload University Seal
5. **Text Content**:
   - University Name: `Harvard University`
   - Tagline: `Veritas - Truth`
   - Footer Text: `© 2024 Harvard University. All rights reserved.`
6. Click "Save Changes"
7. **Screenshot**: Branding page before and after

**✅ Pass Criteria**:
- Color picker works
- Image uploads successful
- Changes saved
- Preview shows updates

---

## 🎬 PHASE 3: TEMPLATE CREATION TESTING (30 minutes)

### Test 3.1: Create HTML Template (CREATE)

**URL**: /admin/templates

**Steps**:

**Part A: Navigate & Choose Type**
1. Click "Templates" in navigation
2. Click "+ Create New Template"
3. Select "HTML Builder"
4. Click "Select"

**Part B: Basic Settings**
5. Fill template info:
   - Template Name: `Harvard Degree Certificate`
   - Description: `Official degree certificate for graduates`
   - Page Size: `A4`
   - Orientation: `Landscape`

**Part C: Design Content (Visual Editor)**
6. In the HTML editor, create certificate design:
```html
<div style="padding: 50px; font-family: 'Times New Roman', serif; text-align: center;">
  <h1 style="color: #A51C30; font-size: 48px; margin-bottom: 20px;">HARVARD UNIVERSITY</h1>
  <p style="font-size: 18px; font-style: italic;">Veritas</p>
  
  <div style="margin: 50px 0;">
    <h2 style="font-size: 32px; margin: 30px 0;">Certificate of Completion</h2>
    <p style="font-size: 20px; line-height: 2;">This is to certify that</p>
    <h2 style="color: #A51C30; font-size: 36px; margin: 20px 0;">{{studentName}}</h2>
    <p style="font-size: 18px;">Roll Number: <strong>{{rollNo}}</strong></p>
    <p style="font-size: 18px;">Registration Number: <strong>{{regNo}}</strong></p>
    
    <p style="font-size: 20px; margin-top: 30px; line-height: 2;">
      has successfully completed the requirements for the degree of
    </p>
    <h3 style="color: #A51C30; font-size: 28px; margin: 20px 0;">{{courseName}}</h3>
    
    <p style="font-size: 18px; margin-top: 40px;">Dated: {{date}}</p>
  </div>
  
  <div style="margin-top: 50px; display: flex; justify-content: space-around;">
    <div>
      <p>_______________________</p>
      <p>President</p>
    </div>
    <div>
      <p>_______________________</p>
      <p>Dean</p>
    </div>
  </div>
</div>
```

**Part D: Configure Variables**
7. Verify available variables:
   - {{studentName}}
   - {{rollNo}}
   - {{regNo}}
   - {{courseName}}
   - {{date}}
8. Add custom variable (if needed): {{grade}}

**Part E: QR Code Settings**
9. Enable QR Code: ☑
10. Position: Bottom Right
11. Size: 100x100px
12. Data: Verification Hash

**Part F: Preview & Save**
13. Click "Preview" to see sample certificate
14. Make adjustments if needed
15. Click "Save Template"
16. **Screenshot**: Each step of creation

**✅ Pass Criteria**:
- Template created successfully
- All variables work
- Preview displays correctly
- QR code position correct
- Template appears in list

---

### Test 3.2: Create PDF Mapper Template (CREATE)

**Steps**:

**Part A: Setup**
1. Click "+ Create New Template"
2. Select "PDF/Image Mapper"
3. Template Name: `Harvard Transcript`

**Part B: Upload Background**
4. Upload background PDF or image (Harvard transcript template)
5. **Expected**: Image displays in mapper

**Part C: Map Fields**
6. Click on image to add text fields:
   - Click at name position → Select "studentName" variable
     - Font: Arial
     - Size: 24px
     - Color: #000000
     - Position: (120, 200)
   
   - Click at roll number position → Select "rollNo" variable
     - Font: Arial
     - Size: 18px
     - Color: #333333
     - Position: (120, 250)
   
   - Click for registration → Select "regNo" variable
   - Click for course → Select "courseName"
   - Click for date → Select "date"

7. Add QR Code:
   - Click QR position on template
   - Set size: 80x80px
   - Position: (450, 550)

**Part D: Test & Save**
8. Click "Generate Test" to see preview
9. Verify all fields appear in correct positions
10. Adjust positions if needed
11. Click "Save"
12. **Screenshot**: Mapper interface with all fields

**✅ Pass Criteria**:
- Background uploads correctly
- Field mapping works
- Positions save accurately
- Test generation works
- Template saved

---

### Test 3.3: Create Direct Upload Template (CREATE)

**Steps**:

**Part A: Prepare Files**
1. Create 3 sample PDF certificates named:
   - cert_H001.pdf
   - cert_H002.pdf
   - cert_H003.pdf
2. Create ZIP file: `harvard_certificates.zip`

**Part B: Upload ZIP**
3. Click "+ Create New Template"
4. Select "Direct Upload"
5. Template Name: `Harvard Certificates (Pre-made)`
6. Upload ZIP file
7. **Expected**: ZIP uploads and extracts

**Part C: Create CSV Mapping**
8. Create mapping CSV:
```csv
rollNo,fileName
H001,cert_H001.pdf
H002,cert_H002.pdf
H003,cert_H003.pdf
```
9. Upload mapping CSV
10. Click "Upload & Process"

**Part D: Verify**
11. **Expected**: Processing shows progress
12. **Verify**: 3 documents imported
13. **Check**: Any errors reported
14. **Screenshot**: Upload interface, processing, results

**✅ Pass Criteria**:
- ZIP uploads successfully
- Files extracted
- CSV mapping works
- Documents linked correctly
- Error handling works

---

### Test 3.4: Edit Template (UPDATE)

**Steps**:
1. From templates list, click "Edit" on HTML template
2. Modify content:
   - Change title font size
   - Add new variable: {{grade}}
   - Modify QR code position
3. Click "Update Template"
4. **Expected**: Changes saved
5. Click "Preview" to verify changes
6. **Screenshot**: Before and after edit

**✅ Pass Criteria**:
- Edit form loads with current data
- Changes save successfully
- Preview shows updates

---

### Test 3.5: View Template Details (READ)

**Steps**:
1. Click "View" on any template
2. **Verify** displayed information:
   - Template name
   - Type
   - Created date
   - Last modified
   - Number of documents generated
   - Variables used
3. **Screenshot**: Details page

**✅ Pass Criteria**:
- All details displayed correctly
- Statistics accurate

---

### Test 3.6: Delete Template (DELETE)

**Steps**:
1. Create a test template first
2. Click "Delete" button
3. **Expected**: Confirmation dialog with warning
4. Confirm deletion
5. **Verify**: Template removed from list
6. **Check**: Related documents handled appropriately
7. **Screenshot**: Confirmation dialog

**✅ Pass Criteria**:
- Confirmation required
- Template deleted
- No orphaned documents
- List updates

---

## 🎬 PHASE 4: STUDENT MANAGEMENT TESTING (30 minutes)

### Test 4.1: Add Single Student (CREATE)

**URL**: /admin/students

**Steps**:

**Part A: Navigate**
1. Click "Students" in navigation
2. Click "+ Add Single Student"

**Part B: Fill Form**
3. Enter student details:
   - Student Name: `Alice Johnson`
   - Roll Number: `H2024001`
   - Registration Number: `REG-H-2024-001`
   - Mobile: `+1-617-555-0001`
   - Email: `alice.johnson@harvard.edu`
   - Date of Birth: `01/15/2000`
   - Course Name: `Computer Science`

**Part C: Document Settings**
4. Select template: `Harvard Degree Certificate`
5. Issue Date: Today's date
6. Custom fields:
   - Grade: `A`
   - CGPA: `3.95`
7. Options:
   - ☑ Generate document now
   - ☑ Publish immediately

**Part D: Submit**
8. Click "Add Student"
9. **Expected**: Student created, document queued
10. **Verify**: Success message
11. **Check**: Student appears in list
12. **Screenshot**: Form and success message

**✅ Pass Criteria**:
- Student created successfully
- Document generation queued
- Success message displayed
- Student in list

---

### Test 4.2: Bulk CSV Import (CREATE - Multiple)

**Steps**:

**Part A: Create CSV Config (if not exists)**
1. Click "CSV Configurations"
2. Click "+ Create Config"
3. Config Name: `Harvard Students Import`
4. Select fields in order:
   - ☑ studentName
   - ☑ rollNo
   - ☑ regNo
   - ☑ mobile
   - ☑ email
   - ☑ dateOfBirth
   - ☑ courseName
5. Add custom field: `grade`
6. Add custom field: `cgpa`
7. Click "Save Config"

**Part B: Download Template**
8. Click "Download CSV Template"
9. **Expected**: CSV file downloads

**Part C: Fill CSV**
10. Open CSV in Excel/LibreOffice
11. Add 10 students:
```csv
studentName,rollNo,regNo,mobile,email,dateOfBirth,courseName,grade,cgpa
Bob Smith,H2024002,REG-H-2024-002,+1-617-555-0002,bob.smith@harvard.edu,02/20/2000,Physics,A-,3.85
Carol White,H2024003,REG-H-2024-003,+1-617-555-0003,carol.white@harvard.edu,03/10/2000,Mathematics,A+,4.00
David Brown,H2024004,REG-H-2024-004,+1-617-555-0004,david.brown@harvard.edu,04/05/2000,Chemistry,B+,3.70
Eve Davis,H2024005,REG-H-2024-005,+1-617-555-0005,eve.davis@harvard.edu,05/15/2000,Biology,A,3.90
Frank Miller,H2024006,REG-H-2024-006,+1-617-555-0006,frank.miller@harvard.edu,06/20/2000,Economics,A-,3.80
Grace Wilson,H2024007,REG-H-2024-007,+1-617-555-0007,grace.wilson@harvard.edu,07/25/2000,History,A,3.88
Henry Moore,H2024008,REG-H-2024-008,+1-617-555-0008,henry.moore@harvard.edu,08/30/2000,Literature,B+,3.65
Ivy Taylor,H2024009,REG-H-2024-009,+1-617-555-0009,ivy.taylor@harvard.edu,09/12/2000,Psychology,A+,3.98
Jack Anderson,H2024010,REG-H-2024-010,+1-617-555-0010,jack.anderson@harvard.edu,10/18/2000,Engineering,A,3.92
Kate Thomas,H2024011,REG-H-2024-011,+1-617-555-0011,kate.thomas@harvard.edu,11/22/2000,Law,A-,3.82
```

**Part D: Upload & Import**
12. Go to "Students" → "Bulk Import CSV"
13. Upload filled CSV file
14. **Expected**: Validation starts
15. **Verify**: Progress bar shows: "Validating: ████░░ 75%"
16. **Check** validation results:
    - ✓ 10 records valid
    - Any errors shown with details
17. Click "Import Valid Records"
18. **Expected**: Import starts
19. **Verify**: Queue processing status
20. **Screenshot**: Each step - upload, validation, processing

**Part E: Monitor Progress**
21. **Expected**: Real-time updates (if WebSocket implemented)
22. **Verify**: "Processing: X/10 students"
23. Wait for completion
24. **Screenshot**: Completion screen

**✅ Pass Criteria**:
- CSV validates correctly
- Error handling works
- Import successful
- Documents queued
- Progress tracking works
- All 10 students appear in list

---

### Test 4.3: View Student Details (READ)

**Steps**:
1. From students list, click "View" on Alice Johnson
2. **Verify** displayed information:
   - Personal details
   - Contact information
   - Academic details
   - Associated documents
   - Document status
3. **Screenshot**: Student details page

**✅ Pass Criteria**:
- All information displayed correctly
- Documents listed
- Status indicators work

---

### Test 4.4: Edit Student (UPDATE)

**Steps**:
1. Click "Edit" on Bob Smith
2. Modify:
   - Mobile: `+1-617-555-9999`
   - Email: `robert.smith@harvard.edu`
   - CGPA: `3.90` (updated)
3. Click "Save Changes"
4. **Expected**: Changes saved
5. View details to verify
6. **Screenshot**: Edit form

**✅ Pass Criteria**:
- Edit form loads with data
- Changes save successfully
- Updated data displays

---

### Test 4.5: Search Students (READ)

**Steps**:
1. In students list, use search box
2. Test searches:
   - By name: `Alice`
   - By roll: `H2024002`
   - By mobile: `+1-617-555-0003`
   - By email: `carol@`
3. **Verify**: Correct results for each search
4. **Screenshot**: Search results

**✅ Pass Criteria**:
- Search works for all fields
- Results accurate
- Fast response

---

### Test 4.6: Filter Students (READ)

**Steps**:
1. Use filter options:
   - By course: `Computer Science`
   - By status: `Active`
   - By document status: `Published`
2. Apply filters
3. **Verify**: List updates correctly
4. Clear filters
5. **Screenshot**: Filtered results

**✅ Pass Criteria**:
- Filters work correctly
- Multiple filters combine properly
- Clear works

---

### Test 4.7: Delete Student (DELETE)

**Steps**:
1. Create a test student first
2. Click "Delete" button
3. **Expected**: Confirmation dialog
4. Options shown:
   - ○ Delete student only
   - ○ Delete student and all documents
5. Choose option
6. Confirm deletion
7. **Verify**: Student removed
8. **Check**: Documents handled per selection
9. **Screenshot**: Confirmation dialog

**✅ Pass Criteria**:
- Confirmation required
- Options work correctly
- Data deleted properly
- No orphaned records

---

## 🎬 PHASE 5: DOCUMENT MANAGEMENT TESTING (20 minutes)

### Test 5.1: View Documents List (READ)

**URL**: /admin/documents

**Steps**:
1. Click "Documents" in navigation
2. **Observe** list showing:
   - Student name
   - Template name
   - Status (Published/Draft/Processing/Failed)
   - Issue date
   - Actions
3. **Verify**: All documents from previous tests visible
4. **Screenshot**: Documents list

**✅ Pass Criteria**:
- All documents listed
- Status indicators correct
- Actions available

---

### Test 5.2: Filter Documents (READ)

**Steps**:
1. Use filter dropdowns:
   - Status: `Published`
   - Template: `Harvard Degree Certificate`
   - Date range: Last 7 days
2. Apply filters
3. **Verify**: Filtered results correct
4. Try different combinations
5. **Screenshot**: Filtered views

**✅ Pass Criteria**:
- Filters work
- Results accurate
- Performance good

---

### Test 5.3: View Document (READ)

**Steps**:
1. Click "View" on any document
2. **Expected**: PDF viewer opens
3. **Verify**:
   - PDF renders correctly
   - Student data merged properly
   - QR code visible (if enabled)
   - Template design intact
4. Test zoom in/out
5. **Screenshot**: PDF viewer

**✅ Pass Criteria**:
- PDF displays correctly
- All data merged
- QR code present
- No rendering issues

---

### Test 5.4: Download Document (READ)

**Steps**:
1. Click "Download" button
2. **Expected**: PDF downloads
3. **Verify**:
   - File downloads successfully
   - Filename is meaningful (e.g., `Harvard_Certificate_H2024001_Alice_Johnson.pdf`)
   - PDF opens correctly
4. **Screenshot**: Downloaded file

**✅ Pass Criteria**:
- Download works
- Filename correct
- PDF valid

---

### Test 5.5: Publish/Unpublish Document (UPDATE)

**Steps**:
1. Find a draft document (or unpublish one first)
2. Click "Publish" button
3. **Expected**: Confirmation dialog
4. Confirm publish
5. **Verify**: Status changes to "Published" ✅
6. Click "Unpublish"
7. **Verify**: Status changes to "Draft" ⏸️
8. **Screenshot**: Both states

**✅ Pass Criteria**:
- Publish works
- Unpublish works
- Status updates immediately
- Students can't access unpublished docs

---

### Test 5.6: Regenerate Document (UPDATE)

**Steps**:
1. Click "Regenerate" on a document
2. **Expected**: Confirmation dialog
3. Enter reason: `Updated template design`
4. Confirm regeneration
5. **Expected**: Document queued for regeneration
6. **Verify**: Status shows "Processing" ⏳
7. Wait for completion
8. **Verify**: New PDF generated
9. **Screenshot**: Before and after

**✅ Pass Criteria**:
- Regeneration queued
- Old PDF replaced
- New QR code generated
- Version tracking works

---

### Test 5.7: Bulk Actions (UPDATE)

**Steps**:
1. Select multiple documents (checkboxes)
2. Select 5 documents
3. Click "Bulk Actions" dropdown
4. Test actions:
   - "Publish Selected" - ✓
   - "Download Selected" - ✓
   - "Regenerate Selected" - ✓
5. **Screenshot**: Each bulk action

**✅ Pass Criteria**:
- Selection works
- Bulk publish successful
- Bulk download creates ZIP
- Bulk regenerate queues all

---

### Test 5.8: Delete Document (DELETE)

**Steps**:
1. Click "Delete" on a test document
2. **Expected**: Confirmation with warning
3. Confirm deletion
4. **Verify**: Document removed
5. **Check**: Student record intact (if option selected)
6. **Screenshot**: Confirmation

**✅ Pass Criteria**:
- Confirmation required
- Document deleted
- PDF file removed
- Database updated

---

## 🎬 PHASE 6: PUBLIC PORTAL TESTING (15 minutes)

### Test 6.1: Access Landing Page (READ)

**URL**: http://localhost:3000 or http://harvard.localhost:3000

**Steps**:
1. Open in new incognito window (not logged in)
2. Navigate to public URL
3. **Verify**:
   - Harvard branding visible
   - Colors match configuration
   - Logo displays
   - Welcome message shows
   - "Search Documents" button prominent
4. **Screenshot**: Landing page

**✅ Pass Criteria**:
- Page loads
- Branding correct
- No login required
- Professional appearance

---

### Test 6.2: Search by Roll Number (READ)

**URL**: http://localhost:3000/search

**Steps**:
1. Click "Search Documents"
2. Enter roll number: `H2024001`
3. Click "Search"
4. **Expected**: Alice Johnson's documents appear
5. **Verify**:
   - Student name shown
   - Document(s) listed
   - Status: Published ✅
   - Actions available: View, Download, Verify QR
6. **Screenshot**: Search results

**✅ Pass Criteria**:
- Search works
- Results accurate
- Only published docs shown
- Fast response

---

### Test 6.3: Search by Registration Number (READ)

**Steps**:
1. Clear previous search
2. Enter registration number: `REG-H-2024-002`
3. Click "Search"
4. **Expected**: Bob Smith's documents appear
5. **Verify**: Correct results
6. **Screenshot**: Results

**✅ Pass Criteria**:
- Reg number search works
- Results correct

---

### Test 6.4: Search by Mobile (READ)

**Steps**:
1. Enter mobile: `+1-617-555-0003`
2. Click "Search"
3. **Expected**: Carol White's documents appear
4. **Screenshot**: Results

**✅ Pass Criteria**:
- Mobile search works
- Results accurate

---

### Test 6.5: Search by Date of Birth (READ)

**Steps**:
1. Enter DOB: `04/05/2000`
2. Click "Search"
3. **Expected**: David Brown's documents appear
4. **Screenshot**: Results

**✅ Pass Criteria**:
- DOB search works
- Format accepted
- Results correct

---

### Test 6.6: View Certificate (READ)

**Steps**:
1. From search results, click "View" button
2. **Expected**: Certificate opens in viewer
3. **Verify**:
   - PDF renders correctly
   - All student data visible
   - QR code present
   - Professional appearance
4. Test print option
5. **Screenshot**: Certificate view

**✅ Pass Criteria**:
- PDF displays correctly
- Data merged properly
- QR code visible
- Print works

---

### Test 6.7: Download Certificate (READ)

**Steps**:
1. Click "Download" button
2. **Expected**: PDF downloads directly
3. **Verify**:
   - Download successful
   - Filename descriptive
   - PDF opens correctly
4. **Screenshot**: Downloaded file

**✅ Pass Criteria**:
- Download works
- No login required
- File valid

---

### Test 6.8: Verify QR Code (READ)

**Steps**:
1. Click "Verify QR" button
2. **Expected**: QR code scanner or verification page opens
3. Options:
   - Scan with phone camera
   - Or show QR code details
4. **Verify**:
   - QR contains document hash
   - Verification link works
   - Status shows: ✅ Verified
5. **Screenshot**: Verification result

**✅ Pass Criteria**:
- QR code readable
- Verification works
- Status displayed
- Secure hash

---

### Test 6.9: Search Non-existent Record (READ)

**Steps**:
1. Search for roll number: `H9999999`
2. Click "Search"
3. **Expected**: "No documents found" message
4. **Verify**:
   - Helpful error message
   - Suggestions shown:
     - "Try another search"
     - "Check details"
     - "Contact admin"
5. **Screenshot**: No results page

**✅ Pass Criteria**:
- Handles not found gracefully
- Helpful message
- No errors

---

### Test 6.10: Search Unpublished Document (READ)

**Steps**:
1. Unpublish a document (as admin)
2. Try to search for it (as public)
3. **Expected**: Document not shown in results
4. **Verify**: Only published documents accessible
5. **Screenshot**: Results (should be empty)

**✅ Pass Criteria**:
- Unpublished docs hidden
- Privacy maintained
- Security working

---

## 📊 TESTING SUMMARY

### Test Results Template

Fill this out after completing all tests:

```
PHASE 1: SUPER ADMIN TESTING
✓ Test 1.1: Registration - PASS/FAIL
✓ Test 1.2: Login - PASS/FAIL
✓ Test 1.3: Create University - PASS/FAIL
✓ Test 1.4: View University - PASS/FAIL
✓ Test 1.5: Edit University - PASS/FAIL
✓ Test 1.6: Create Second University - PASS/FAIL
✓ Test 1.7: Disable/Enable - PASS/FAIL
✓ Test 1.8: Delete University - PASS/FAIL

PHASE 2: UNIVERSITY ADMIN TESTING
✓ Test 2.1: Admin Login - PASS/FAIL
✓ Test 2.2: View Dashboard - PASS/FAIL
✓ Test 2.3: Branding Config - PASS/FAIL

PHASE 3: TEMPLATE CREATION TESTING
✓ Test 3.1: HTML Template - PASS/FAIL
✓ Test 3.2: PDF Mapper - PASS/FAIL
✓ Test 3.3: Direct Upload - PASS/FAIL
✓ Test 3.4: Edit Template - PASS/FAIL
✓ Test 3.5: View Template - PASS/FAIL
✓ Test 3.6: Delete Template - PASS/FAIL

PHASE 4: STUDENT MANAGEMENT TESTING
✓ Test 4.1: Add Single Student - PASS/FAIL
✓ Test 4.2: Bulk CSV Import - PASS/FAIL
✓ Test 4.3: View Student - PASS/FAIL
✓ Test 4.4: Edit Student - PASS/FAIL
✓ Test 4.5: Search Students - PASS/FAIL
✓ Test 4.6: Filter Students - PASS/FAIL
✓ Test 4.7: Delete Student - PASS/FAIL

PHASE 5: DOCUMENT MANAGEMENT TESTING
✓ Test 5.1: View Documents - PASS/FAIL
✓ Test 5.2: Filter Documents - PASS/FAIL
✓ Test 5.3: View Document - PASS/FAIL
✓ Test 5.4: Download Document - PASS/FAIL
✓ Test 5.5: Publish/Unpublish - PASS/FAIL
✓ Test 5.6: Regenerate - PASS/FAIL
✓ Test 5.7: Bulk Actions - PASS/FAIL
✓ Test 5.8: Delete Document - PASS/FAIL

PHASE 6: PUBLIC PORTAL TESTING
✓ Test 6.1: Landing Page - PASS/FAIL
✓ Test 6.2: Search by Roll - PASS/FAIL
✓ Test 6.3: Search by Reg - PASS/FAIL
✓ Test 6.4: Search by Mobile - PASS/FAIL
✓ Test 6.5: Search by DOB - PASS/FAIL
✓ Test 6.6: View Certificate - PASS/FAIL
✓ Test 6.7: Download Certificate - PASS/FAIL
✓ Test 6.8: Verify QR Code - PASS/FAIL
✓ Test 6.9: Search Non-existent - PASS/FAIL
✓ Test 6.10: Unpublished Security - PASS/FAIL

TOTAL TESTS: 41
PASSED: __
FAILED: __
SUCCESS RATE: __%
```

---

## 🐛 Bug Report Template

If you find issues, use this template:

```
BUG REPORT #___

Title: [Short description]

Severity: Critical / High / Medium / Low

Phase: [Which phase]
Test: [Test number]

Steps to Reproduce:
1. 
2. 
3. 

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Screenshot: [Attach screenshot]

Console Errors: [Copy any errors from F12 console]

Environment:
- Browser: Chrome [version]
- OS: [Your OS]
- Date: [Date of test]

Additional Notes:
[Any other relevant information]
```

---

## 📸 Screenshot Checklist

Take screenshots of:
- [ ] Super Admin Registration page
- [ ] Super Admin Dashboard
- [ ] University Creation wizard (all 5 steps)
- [ ] University Details page
- [ ] University Admin Login
- [ ] University Admin Dashboard
- [ ] Branding Configuration
- [ ] HTML Template Builder
- [ ] PDF Mapper Interface
- [ ] CSV Upload Interface
- [ ] Student Add Form
- [ ] Student List
- [ ] Bulk Import Progress
- [ ] Document List
- [ ] PDF Viewer
- [ ] Public Landing Page
- [ ] Search Interface
- [ ] Search Results
- [ ] Certificate View
- [ ] QR Verification
- [ ] Error Messages
- [ ] Success Messages
- [ ] Confirmation Dialogs

---

## 🎯 Testing Tips

1. **Use Chrome DevTools (F12)**:
   - Console tab: Check for errors
   - Network tab: Monitor API calls
   - Application tab: Check localStorage
   - Performance tab: Check load times

2. **Take notes** as you go
3. **Record video** if possible (Chrome can record)
4. **Test on different screen sizes** (use DevTools device toolbar)
5. **Clear cache** between major tests
6. **Test in incognito mode** for public portal
7. **Check database** with Prisma Studio after each phase

---

## ✅ Completion Checklist

After all tests:
- [ ] All 41 tests completed
- [ ] Screenshots saved
- [ ] Test results documented
- [ ] Bugs reported
- [ ] Test summary filled
- [ ] Database checked
- [ ] Console errors noted
- [ ] Performance observations noted

---

**Testing Start Time**: _______________
**Testing End Time**: _______________
**Total Duration**: _______________
**Tester Name**: _______________
**Overall Assessment**: _______________

---

**Document Version**: 1.0  
**Created**: November 21, 2024  
**Status**: Ready for Testing

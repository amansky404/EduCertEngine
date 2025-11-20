# Certificate Generation Guide - Complete Step-by-Step

This comprehensive guide walks you through the entire process of generating certificates in EduCertEngine, from template creation to publishing documents for students.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Overview of Certificate Generation](#overview)
3. [Method 1: HTML Template Builder](#method-1-html-template-builder)
4. [Method 2: PDF/JPEG Field Mapper](#method-2-pdfjpeg-field-mapper)
5. [Method 3: Direct Upload Mode](#method-3-direct-upload-mode)
6. [Adding Students](#adding-students)
7. [Bulk Import via CSV](#bulk-import-via-csv)
8. [Publishing Documents](#publishing-documents)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before generating certificates, ensure you have:

✅ **University Admin account** (created by Super Admin)
✅ **Logged into the admin panel** at `http://[subdomain].yourdomain.com/admin`
✅ **University is properly configured** with branding (optional but recommended)

---

## 🎯 Overview of Certificate Generation

Certificate generation in EduCertEngine follows this workflow:

```
1. Create Template → 2. Add Students → 3. Generate Documents → 4. Publish
```

### Three Template Types

| Type | Best For | Difficulty | Flexibility |
|------|----------|------------|-------------|
| **HTML Builder** | Custom designs from scratch | Easy | Very High |
| **PDF Mapper** | Existing PDF designs | Medium | Medium |
| **Direct Upload** | Pre-generated PDFs | Easy | Low |

Let's explore each method in detail.

---

## Method 1: HTML Template Builder

The HTML Template Builder uses a modern rich text editor (TipTap) for creating certificates.

### Step-by-Step: Creating HTML Template

#### Step 1: Navigate to Templates

1. **Log in** to your university admin panel
2. **Click "Templates"** in the sidebar
3. **Click "Create New Template"** button

#### Step 2: Template Basic Information

Fill in the form:

```
Template Name: Bachelor's Degree Certificate
Template Type: [Select] HTML
Description: Bachelor's degree certificate for graduates
```

Click **"Next"** or **"Create Template"**

#### Step 3: Design Your Certificate

You'll see the **Rich Text Editor** with three panels:

**Left Panel: Toolbar**
- Text formatting (Bold, Italic, Underline)
- Headings (H1, H2, H3)
- Text alignment (Left, Center, Right, Justify)
- Lists (Bullet, Numbered)
- Colors
- Images
- Undo/Redo

**Center Panel: Editor**
- Type and format your content here
- WYSIWYG editing

**Right Panel: Variables**
- Student data placeholders
- Click to insert into document

#### Step 4: Create Certificate Content

Example certificate structure:

```
[Centered, H1] CERTIFICATE OF COMPLETION
[Centered] This is to certify that

[Centered, H2, Bold] {{studentName}}

has successfully completed the course

[Centered, Bold] {{courseName}}

on {{date}}

with grade {{grade}}

Roll Number: {{rollNo}}
Registration: {{regNo}}

[Add University Stamp/Seal Image]
[Add Signature Image]
```

#### Step 5: Insert Dynamic Variables

Click variables from the right panel to insert:

- `{{studentName}}` - Student's full name
- `{{rollNo}}` - Roll number
- `{{regNo}}` - Registration number
- `{{fatherName}}` - Father's name
- `{{email}}` - Email address
- `{{mobile}}` - Mobile number
- `{{dob}}` - Date of birth
- `{{customField1}}` - Custom data fields
- `{{customField2}}` - More custom fields

**To insert**:
1. Position cursor where you want the variable
2. Click the variable in the right panel
3. It will be inserted as `{{variableName}}`

#### Step 6: Format Your Certificate

Use the toolbar to:

1. **Add Heading**:
   - Select text
   - Click H1/H2/H3

2. **Center Text**:
   - Select text
   - Click center alignment button

3. **Change Colors**:
   - Select text
   - Click color picker
   - Choose color

4. **Add Images**:
   - Click image button
   - Enter image URL (from your uploads)
   - Set size

5. **Add University Logo**:
   ```
   Upload logo to university branding first
   Then insert image URL in editor
   ```

#### Step 7: Preview Your Template

1. Click **"Preview"** button
2. See how certificate looks with sample data
3. Make adjustments if needed

#### Step 8: Configure QR Code (Optional)

```
☑ Enable QR Code on this template
QR Position: Bottom Right
```

The QR code will be automatically added during generation.

#### Step 9: Save Template

1. Review your design
2. Click **"Save Template"**
3. Template is now ready to use!

### Full Example: HTML Certificate

```html
<div style="text-align: center; padding: 50px;">
  <h1 style="color: #1a73e8; font-size: 48px;">
    CERTIFICATE OF ACHIEVEMENT
  </h1>
  
  <p style="margin-top: 30px; font-size: 18px;">
    This is to certify that
  </p>
  
  <h2 style="color: #333; font-size: 36px; margin: 20px 0;">
    {{studentName}}
  </h2>
  
  <p style="font-size: 18px;">
    bearing Roll Number <strong>{{rollNo}}</strong>
  </p>
  
  <p style="font-size: 18px; margin-top: 20px;">
    has successfully completed the
  </p>
  
  <h3 style="color: #34a853; font-size: 28px;">
    {{courseName}}
  </h3>
  
  <p style="margin-top: 30px;">
    on {{completionDate}} with grade <strong>{{grade}}</strong>
  </p>
  
  <div style="margin-top: 50px;">
    <img src="{{universityLogo}}" alt="Logo" width="100">
  </div>
  
  <p style="margin-top: 30px; font-size: 14px;">
    Issue Date: {{issueDate}}
  </p>
</div>
```

---

## Method 2: PDF/JPEG Field Mapper

Use existing certificate designs (PDF or JPEG) and map fields to specific positions.

### Step-by-Step: Creating PDF Mapper Template

#### Step 1: Prepare Your Background

You need a certificate background:
- PDF file (e.g., `certificate-background.pdf`)
- JPEG/PNG image (e.g., `certificate-bg.jpg`)

**Tips**:
- Size: A4 (210mm x 297mm or 595px x 842px @ 72 DPI)
- Leave space for text fields
- Pre-design the static elements (borders, logos, stamps)

#### Step 2: Create New Template

1. Go to **Templates** → **Create New Template**
2. Fill in:
   ```
   Template Name: Engineering Degree Certificate
   Template Type: [Select] PDF_MAPPER
   Description: Engineering degree with pre-designed background
   ```

#### Step 3: Upload Background

1. Click **"Upload Background"**
2. Select your PDF or JPEG file
3. Wait for upload to complete
4. Background appears in the editor

#### Step 4: Map Fields to Positions

You'll see the background with a field mapping interface.

**Add a Text Field**:
1. Click **"Add Text Field"**
2. Drag and position on the background
3. Configure:
   ```
   Field Name: studentName
   Field Label: Student Name
   Font: Arial
   Size: 24
   Color: #000000
   Alignment: Center
   ```
4. Click **"Save Field"**

**Repeat for all fields**:

```
Field 1:
- Name: studentName
- Position: Center, Y=300
- Font: Arial, 28pt, Bold

Field 2:
- Name: rollNo
- Position: Left=100, Y=400
- Font: Arial, 18pt

Field 3:
- Name: courseName
- Position: Center, Y=500
- Font: Arial, 24pt, Bold

Field 4:
- Name: completionDate
- Position: Right=400, Y=700
- Font: Arial, 16pt

Field 5:
- Name: grade
- Position: Left=200, Y=750
- Font: Arial, 20pt
```

#### Step 5: Position QR Code (Optional)

```
☑ Enable QR Code
Position: X=450, Y=700
Size: 80x80
```

#### Step 6: Test Field Positions

1. Click **"Preview with Sample Data"**
2. Check if all fields align properly
3. Adjust positions as needed
4. Use grid snapping for precise alignment

#### Step 7: Save Template

Click **"Save Template"**

### Tips for PDF Mapper

✅ **Use grid snapping** for precise alignment
✅ **Test with long names** to check spacing
✅ **Choose readable fonts** (Arial, Times New Roman, Helvetica)
✅ **Set appropriate font sizes** (minimum 14pt for readability)
✅ **Leave margins** around text fields

---

## Method 3: Direct Upload Mode

Upload pre-generated PDF certificates and link them to students via CSV.

### Step-by-Step: Direct Upload

#### Step 1: Prepare Your PDFs

You need:
- Pre-generated PDF certificates
- All PDFs named systematically (e.g., `2024001.pdf`, `2024002.pdf`)
- A CSV file mapping filenames to student data

**Example structure**:
```
certificates/
├── 2024001.pdf (John Doe's certificate)
├── 2024002.pdf (Jane Smith's certificate)
├── 2024003.pdf (Alice Johnson's certificate)
└── students.csv (mapping file)
```

#### Step 2: Create CSV Mapping File

Create `students.csv`:

```csv
filename,rollNo,regNo,studentName,email,mobile
2024001.pdf,2024001,REG001,John Doe,john@example.com,1234567890
2024002.pdf,2024002,REG002,Jane Smith,jane@example.com,0987654321
2024003.pdf,2024003,REG003,Alice Johnson,alice@example.com,5555555555
```

#### Step 3: Create Template

1. Go to **Templates** → **Create New Template**
2. Fill in:
   ```
   Template Name: Pre-Generated Certificates
   Template Type: [Select] DIRECT_UPLOAD
   Description: Bulk uploaded certificates
   ```

#### Step 4: Create ZIP Archive

Create a ZIP file containing:
- All PDF files
- The CSV mapping file

```bash
# On macOS/Linux
zip -r certificates.zip *.pdf students.csv

# On Windows
# Use 7-Zip or WinRAR to create certificates.zip
```

#### Step 5: Upload ZIP

1. Click **"Upload ZIP Archive"**
2. Select `certificates.zip`
3. Wait for upload (may take time for large files)
4. System processes and links files

#### Step 6: Verify Import

1. System shows import summary:
   ```
   ✓ Imported: 3 certificates
   ✗ Failed: 0 certificates
   ```
2. Check for any errors
3. Fix and re-upload if needed

#### Step 7: Save Template

Click **"Save Template"**

All certificates are now linked and accessible!

---

## Adding Students

Once you have a template, add students to generate their certificates.

### Single Student Entry

#### Step 1: Navigate to Students

1. Click **"Students"** in sidebar
2. Click **"Add New Student"**

#### Step 2: Fill Student Information

```
Roll Number: 2024001
Registration Number: REG2024001
Student Name: John Doe
Father's Name: Robert Doe
Date of Birth: 2000-05-15
Email: john.doe@example.com
Mobile: +1-234-567-8900
```

#### Step 3: Add Custom Fields

If your template uses custom fields:

```
Custom Field 1 (courseName): Computer Science
Custom Field 2 (grade): A
Custom Field 3 (completionDate): May 15, 2024
Custom Field 4 (duration): 4 Years
```

#### Step 4: Select Template

```
Template: [Select] Bachelor's Degree Certificate
```

#### Step 5: Generate Document

Click **"Save & Generate Document"**

System will:
1. Create student record
2. Generate PDF certificate
3. Create QR code (if enabled)
4. Save to database

**Time**: 2-5 seconds

#### Step 6: View Generated Document

1. Click **"View Document"** to preview
2. Check for accuracy
3. Download if needed
4. Ready to publish!

---

## Bulk Import via CSV

For importing many students at once.

### Step-by-Step: CSV Import

#### Step 1: Create CSV Configuration

First, define your CSV structure:

1. Go to **"CSV Creator"**
2. Click **"Create New Configuration"**
3. Fill in:
   ```
   Configuration Name: Student Import Config
   Template: Bachelor's Degree Certificate
   ```

#### Step 2: Define CSV Fields

Add fields one by one:

**Standard Fields**:
```
Field 1:
- Name: rollNo
- Label: Roll Number
- Type: text
- Required: Yes

Field 2:
- Name: regNo
- Label: Registration Number
- Type: text
- Required: Yes

Field 3:
- Name: studentName
- Label: Student Name
- Type: text
- Required: Yes

Field 4:
- Name: email
- Label: Email
- Type: email
- Required: No

Field 5:
- Name: mobile
- Label: Mobile
- Type: text
- Required: No
```

**Custom Fields** (for your template):
```
Field 6:
- Name: courseName
- Label: Course Name
- Type: text
- Required: Yes

Field 7:
- Name: grade
- Label: Grade
- Type: text
- Required: Yes

Field 8:
- Name: completionDate
- Label: Completion Date
- Type: date
- Required: Yes
```

#### Step 3: Save Configuration

Click **"Save CSV Configuration"**

#### Step 4: Download CSV Template

1. Click **"Download Template"**
2. A blank CSV with your defined columns downloads
3. Open in Excel/Google Sheets

#### Step 5: Fill Student Data

Example `students.csv`:

```csv
rollNo,regNo,studentName,fatherName,email,mobile,dob,courseName,grade,completionDate
2024001,REG001,John Doe,Robert Doe,john@ex.com,1234567890,2000-05-15,Computer Science,A,2024-05-15
2024002,REG002,Jane Smith,John Smith,jane@ex.com,0987654321,2000-06-20,Mathematics,B+,2024-05-15
2024003,REG003,Alice Johnson,Bob Johnson,alice@ex.com,5555555555,1999-03-10,Physics,A-,2024-05-15
2024004,REG004,Bob Williams,Tom Williams,bob@ex.com,4444444444,2000-08-25,Chemistry,A,2024-05-15
```

**Tips**:
- ✅ Don't add extra columns
- ✅ Match field names exactly
- ✅ Use consistent date format (YYYY-MM-DD)
- ✅ Remove empty rows
- ✅ Check for typos

#### Step 6: Upload CSV

1. Go to **"Students"** → **"Import from CSV"**
2. Select template: **"Bachelor's Degree Certificate"**
3. Click **"Choose File"**
4. Select your `students.csv`
5. Click **"Upload & Import"**

#### Step 7: Bulk Generation

System automatically:
1. Validates all rows
2. Imports student records
3. Generates ALL certificates
4. Creates QR codes
5. Saves all PDFs

**Time**: 1-2 seconds per certificate
- 100 students: ~2-3 minutes
- 500 students: ~10-15 minutes
- 1000 students: ~20-30 minutes

#### Step 8: Review Import Results

```
Import Summary:
✓ Successfully imported: 4 students
✓ Documents generated: 4
✗ Failed: 0

Details:
✓ John Doe - 2024001 - Success
✓ Jane Smith - 2024002 - Success
✓ Alice Johnson - 2024003 - Success
✓ Bob Williams - 2024004 - Success
```

#### Step 9: Handle Errors (if any)

If some rows fail:
```
✗ Row 5: Missing required field 'rollNo'
✗ Row 8: Invalid email format
```

1. Fix the errors in CSV
2. Re-upload only failed rows
3. System will process again

---

## Publishing Documents

Generated documents are initially **unpublished** (not visible to students).

### Publishing Documents

#### Step 1: Review Generated Documents

1. Go to **"Documents"**
2. View list of all generated certificates
3. Check each one for accuracy

#### Step 2: Publish Individual Document

**For one document**:
1. Find the document in the list
2. Click **"Publish"** button
3. Document is now visible to student

#### Step 3: Bulk Publish

**For many documents**:
1. Select documents (checkboxes)
2. Click **"Bulk Actions"** → **"Publish Selected"**
3. Confirm
4. All selected documents are published

#### Step 4: Publish All

**For all documents of a template**:
1. Go to template page
2. Click **"Publish All Documents"**
3. Confirm
4. All documents for this template are published

### Unpublishing Documents

To hide a document:
1. Find the document
2. Click **"Unpublish"**
3. Students can no longer access it

Use cases:
- Need to regenerate with corrections
- Document issued by mistake
- Temporary suspension

---

## Verification Setup

Enable verification for issued certificates.

### QR Code Verification

#### Enable at University Level

1. Go to **"Settings"** → **"Features"**
2. ☑ Enable QR Code Verification
3. Save

This enables QR codes for all templates.

#### Enable at Template Level

1. Go to **"Templates"** → Edit template
2. ☑ Enable QR Code for this template
3. Configure QR position (if using PDF Mapper)
4. Save

#### How Verification Works

1. Certificate has QR code with unique hash
2. Anyone scans the QR code
3. Redirects to: `/verify/{hash}`
4. Shows verification page with:
   - Student name
   - Document details
   - Authenticity confirmation
   - Issue date

---

## Complete Example: End-to-End

Let's create 100 degree certificates from scratch.

### Step 1: Create Template (10 minutes)

1. **Login** to admin panel
2. **Create HTML template** "Bachelor Degree"
3. **Design certificate** with rich text editor:
   ```
   [Center] CERTIFICATE OF GRADUATION
   [Center] This certifies that
   [Center, Large] {{studentName}}
   [Center] Roll No: {{rollNo}}
   has completed {{courseName}}
   with grade {{grade}}
   Date: {{completionDate}}
   ```
4. **Enable QR code**
5. **Save template**

### Step 2: Create CSV Configuration (5 minutes)

1. **Go to CSV Creator**
2. **Create configuration** for "Bachelor Degree" template
3. **Define fields**:
   - rollNo (required)
   - regNo (required)
   - studentName (required)
   - courseName (required)
   - grade (required)
   - completionDate (required)
4. **Save configuration**
5. **Download CSV template**

### Step 3: Prepare Student Data (15 minutes)

1. **Open downloaded CSV** in Excel
2. **Fill in 100 students**:
   ```csv
   rollNo,regNo,studentName,courseName,grade,completionDate
   2024001,REG001,John Doe,Computer Science,A,2024-05-15
   2024002,REG002,Jane Smith,Mathematics,B+,2024-05-15
   ...
   2024100,REG100,Zack Wilson,Physics,A-,2024-05-15
   ```
3. **Save CSV file**

### Step 4: Import & Generate (5 minutes)

1. **Go to Students** → **Import CSV**
2. **Select template**: Bachelor Degree
3. **Upload CSV file**
4. **Wait for processing**: ~2-3 minutes for 100 students
5. **Review results**: All 100 generated successfully

### Step 5: Review & Publish (5 minutes)

1. **Go to Documents**
2. **Spot-check** a few certificates
3. **Select all documents**
4. **Bulk publish**
5. **Done!**

**Total time: 40 minutes for 100 certificates**

Students can now search and download their certificates!

---

## Troubleshooting

### PDF Not Generating

**Issue**: Document stays in "processing" state

**Solutions**:
- Check server logs for errors
- Ensure Puppeteer is installed: `npm install puppeteer`
- Check disk space
- Verify template has no syntax errors

### Variables Not Replacing

**Issue**: PDF shows `{{studentName}}` instead of actual name

**Solutions**:
- Check variable names match exactly
- Ensure student data has the field
- Re-generate the document
- Check template syntax

### QR Code Not Appearing

**Issue**: Generated PDF doesn't have QR code

**Solutions**:
- Enable QR at university level
- Enable QR at template level
- Check QR position is within page bounds
- Regenerate document

### CSV Import Failing

**Issue**: CSV upload shows errors

**Solutions**:
- Check CSV format (UTF-8 encoding)
- Ensure no extra columns
- Remove empty rows
- Match field names exactly
- Check for special characters
- Validate date formats

### Images Not Loading in PDF

**Issue**: Images don't appear in generated certificate

**Solutions**:
- Use absolute URLs for images
- Ensure images are accessible
- Check image format (PNG, JPEG)
- Verify image URLs are correct
- Try re-uploading images

---

## Best Practices

### Template Design

✅ **Keep it simple** - Don't overcomplicate design
✅ **Use standard fonts** - Arial, Times New Roman, Helvetica
✅ **Test with long names** - Ensure text doesn't overflow
✅ **Use consistent sizing** - A4 (595x842 @ 72 DPI)
✅ **Add university branding** - Logo, colors, stamps
✅ **Preview before publishing** - Always check output

### Data Management

✅ **Validate data first** - Check for errors before import
✅ **Use consistent formats** - Dates, names, numbers
✅ **Backup your CSV** - Keep original data safe
✅ **Test with small batch** - Try 5-10 students first
✅ **Review generated docs** - Spot-check for accuracy

### Performance

✅ **Generate in batches** - Don't do thousands at once
✅ **Schedule bulk operations** - Run during off-peak hours
✅ **Monitor disk space** - PDFs take up storage
✅ **Clean up old files** - Archive or delete unused documents

---

## Quick Reference

### Certificate Generation Checklist

- [ ] Template created and tested
- [ ] CSV configuration defined (if using bulk import)
- [ ] Student data prepared and validated
- [ ] Test generation with 1-2 students first
- [ ] Review generated certificates
- [ ] QR codes working (if enabled)
- [ ] Bulk generate remaining students
- [ ] Review import results
- [ ] Publish documents
- [ ] Notify students (optional)
- [ ] Test student access

### Time Estimates

| Task | Time |
|------|------|
| Create HTML template | 10-15 minutes |
| Create PDF Mapper template | 15-20 minutes |
| CSV configuration | 5-10 minutes |
| Generate 1 certificate | 2-5 seconds |
| Generate 100 certificates | 2-5 minutes |
| Generate 1000 certificates | 20-30 minutes |

---

## Summary

You now know how to:

✅ Create templates using all three methods
✅ Add students individually or in bulk
✅ Generate certificates automatically
✅ Configure QR code verification
✅ Publish documents for students
✅ Troubleshoot common issues

**Next Steps:**
- Try creating your first template
- Import a small batch of students
- Generate and publish certificates
- Share portal URL with students

---

**Need More Help?**

- [STUDENT_GUIDE.md](./STUDENT_GUIDE.md) - How students access certificates
- [FLOW_DIAGRAM.md](./FLOW_DIAGRAM.md) - Complete system workflow
- [HOW_TO_RUN.md](./HOW_TO_RUN.md) - Running the application
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API reference

**Document Version:** 1.0  
**Last Updated:** November 2024

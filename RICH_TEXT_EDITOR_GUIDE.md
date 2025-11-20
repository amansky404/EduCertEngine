# Rich Text Editor Guide

## Overview
The HTML Template Builder has been upgraded from a Fabric.js canvas-based editor to a modern TipTap rich text editor. This provides a more intuitive, word-processor-like experience for creating certificate and document templates.

## Features

### Text Formatting
- **Bold**, *Italic*, <u>Underline</u>, ~~Strikethrough~~
- Multiple heading levels (H1, H2, H3)
- Text color customization
- Font size and styling

### Text Alignment
- Left align
- Center align
- Right align
- Justify

### Lists
- Bullet lists
- Numbered (ordered) lists
- Nested list support

### Content Types
- Paragraphs and headings
- Images (via URL)
- Rich text blocks
- Dynamic variables

### Editor Controls
- Undo/Redo functionality
- Live preview mode
- Auto-save support
- Variable insertion panel

## Dynamic Variables

The editor supports dynamic variables that are automatically replaced with actual student data when generating documents.

### Available Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{studentName}}` | Student's full name | John Doe |
| `{{rollNo}}` | Roll number | 2024001 |
| `{{regNo}}` | Registration number | REG2024001 |
| `{{fatherName}}` | Father's name | Robert Doe |
| `{{motherName}}` | Mother's name | Mary Doe |
| `{{dob}}` | Date of birth | 01/15/2000 |
| `{{email}}` | Email address | john@example.com |
| `{{mobile}}` | Mobile number | +1234567890 |

### Using Variables

1. Click on any variable button in the right sidebar
2. The variable placeholder (e.g., `{{studentName}}`) will be inserted at cursor position
3. When generating documents, these placeholders are automatically replaced with real data

### Example Template

```
Certificate of Achievement

This is to certify that {{studentName}} with Roll No. {{rollNo}} 
has successfully completed the course with distinction.

Date of Birth: {{dob}}
Email: {{email}}

Congratulations!
```

When generated for a student, this becomes:

```
Certificate of Achievement

This is to certify that John Doe with Roll No. 2024001 
has successfully completed the course with distinction.

Date of Birth: 01/15/2000
Email: john@example.com

Congratulations!
```

## Creating a Template

### Step 1: Create Template
1. Navigate to **Admin Dashboard** → **Templates**
2. Click **"Create New Template"**
3. Select **"HTML Builder"** as the template type
4. Enter template name and description
5. Click **"Create Template"**

### Step 2: Design Content
1. Use the formatting toolbar on the left to style your text
2. Type or paste your content into the editor
3. Add dynamic variables using the right sidebar
4. Format headings, paragraphs, and lists as needed

### Step 3: Add Styling
1. Select text to change its color
2. Use alignment buttons for layout
3. Add bold, italic, or underline for emphasis
4. Insert images for logos or signatures

### Step 4: Preview
1. Click the **"Preview"** button to see the final output
2. Switch back to **"Edit"** mode to make changes
3. Verify all variables are correctly placed

### Step 5: Save
1. Click **"Save"** button to store the template
2. Template is now ready for document generation

## Generating Documents

### Single Student Generation

1. Navigate to **Students** section
2. Select a student
3. Choose **"Generate Document"**
4. Select the template
5. PDF is automatically created with student data

### Bulk Generation (CSV Upload)

1. Navigate to **Students** → **Import CSV**
2. Upload CSV file with student data
3. Select the template for generation
4. System generates PDFs for all students
5. Documents are available in student portal

## PDF Generation

### How It Works

1. **Template Content**: HTML content from rich text editor
2. **Variable Replacement**: All `{{variable}}` placeholders are replaced with actual student data
3. **PDF Conversion**: HTML is converted to PDF using Puppeteer
4. **QR Code**: Optional QR code for verification is added
5. **Storage**: PDF is saved to `public/uploads/documents/`
6. **Database**: Document record with PDF URL is stored

### Output Quality

- Format: A4 size PDF
- Resolution: Print quality
- Fonts: Web-safe fonts (Arial, Times, etc.)
- Images: Embedded in PDF
- QR Codes: 100x100px, positioned as configured

## Best Practices

### Template Design

1. **Keep It Simple**: Use clear, readable fonts and layouts
2. **Test Variables**: Verify all dynamic variables work correctly
3. **Preview Often**: Check how template looks before finalizing
4. **Use Headings**: Organize content with H1, H2, H3
5. **Alignment**: Center important text like titles and signatures

### Performance

1. **Image Size**: Use optimized images (< 500KB)
2. **Template Length**: Keep templates under 5 pages
3. **Variables**: Limit to necessary data fields
4. **Bulk Generation**: Process in batches of 100 students

### Accessibility

1. **Font Size**: Use readable sizes (14px minimum)
2. **Contrast**: Ensure text is clearly visible
3. **Structure**: Use proper heading hierarchy
4. **Alt Text**: Describe images for screen readers

## Troubleshooting

### Template Not Saving

**Problem**: Changes aren't being saved

**Solution**:
- Check internet connection
- Verify you're logged in as admin
- Try clearing browser cache
- Check browser console for errors

### Variables Not Replacing

**Problem**: Variables show as `{{variable}}` in PDF

**Solution**:
- Ensure variable syntax is correct: `{{variableName}}`
- Check that student data includes that field
- Verify no extra spaces in variable name
- Re-save template after fixing

### PDF Generation Failed

**Problem**: Document created but PDF not generated

**Solution**:
- Check server logs for detailed error
- Verify Puppeteer is installed: `npm list puppeteer`
- Ensure output directory exists and is writable
- Check for large images or complex layouts

### Preview Shows Differently

**Problem**: Preview looks different from final PDF

**Solution**:
- Browser rendering vs PDF rendering differences
- Test with actual document generation
- Adjust CSS styling if needed
- Use web-safe fonts

### Images Not Showing

**Problem**: Images don't appear in PDF

**Solution**:
- Use absolute URLs for images
- Ensure images are accessible
- Check image format (PNG, JPEG supported)
- Verify image size isn't too large

## Technical Details

### Technology Stack

- **Editor**: TipTap (based on ProseMirror)
- **PDF Generation**: Puppeteer (Chrome headless)
- **Styling**: Tailwind CSS
- **Framework**: Next.js 14 / React

### File Locations

- Editor Component: `/app/admin/templates/html-builder/[id]/page.tsx`
- PDF Library: `/lib/pdf.ts`
- API Endpoints:
  - Single: `/app/api/document/generate/route.ts`
  - Bulk: `/app/api/document/generate-bulk/route.ts`

### Database Schema

Templates store:
- `htmlContent`: Rich text HTML
- `qrEnabled`: Boolean for QR code
- `qrPosition`: JSON for QR placement

Documents store:
- `pdfUrl`: Path to generated PDF
- `qrHash`: Verification hash
- `metadata`: Student data snapshot

## Migration from Fabric.js

### Existing Templates

Old Fabric.js templates are still supported:
- Stored in `htmlConfig` field
- PDF generation uses `generatePDFFromCanvas()`
- No migration required for existing templates

### Creating New Templates

All new HTML templates use:
- TipTap rich text editor
- Stored in `htmlContent` field
- PDF generation uses `generatePDFFromHTML()`

### Backward Compatibility

The system automatically detects template type:
- If `htmlContent` exists → Use TipTap/HTML
- If `htmlConfig` exists → Use Fabric.js/Canvas
- If `type === 'PDF_MAPPER'` → Use field mapper
- If `type === 'DIRECT_UPLOAD'` → Use uploaded files

## API Reference

### Generate Single Document

```http
POST /api/document/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "student-id",
  "templateId": "template-id"
}
```

Response:
```json
{
  "success": true,
  "document": {
    "id": "document-id",
    "title": "Certificate",
    "pdfUrl": "/uploads/documents/doc.pdf",
    "qrHash": "abc123...",
    "createdAt": "2024-11-20T..."
  }
}
```

### Generate Bulk Documents

```http
POST /api/document/generate-bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "templateId": "template-id",
  "studentIds": ["id1", "id2", "id3"] // optional
}
```

Response:
```json
{
  "success": true,
  "total": 150,
  "generated": 148,
  "skipped": 2,
  "failed": 0,
  "documents": [...]
}
```

## Security Considerations

### Input Sanitization

- HTML content is sanitized by TipTap
- Variables are escaped during replacement
- SQL injection prevented by Prisma ORM
- XSS protection via React

### Access Control

- Only admins can create templates
- JWT authentication required
- University-level data isolation
- Role-based permissions

### File Security

- PDFs stored in public directory
- Access controlled via database records
- QR hash verification for authenticity
- No sensitive data in URLs

## Future Enhancements

Planned features for future releases:

- [ ] Custom fonts upload
- [ ] Template marketplace
- [ ] Drag-and-drop images
- [ ] Collaborative editing
- [ ] Version history
- [ ] Template cloning
- [ ] Advanced layouts (multi-column)
- [ ] Signature pad integration
- [ ] Mobile responsive editor
- [ ] Export to multiple formats

## Support

For issues or questions:

1. Check this guide first
2. Review troubleshooting section
3. Check server logs for errors
4. Open GitHub issue with details
5. Contact system administrator

## Changelog

### Version 2.0.0 (November 2024)

- ✨ Replaced Fabric.js with TipTap editor
- ✨ Implemented HTML to PDF generation
- ✨ Added dynamic variable system
- ✨ Enhanced bulk document generation
- ✨ Improved user interface
- ✨ Added live preview mode
- 🐛 Fixed canvas rendering issues
- 🐛 Fixed PDF generation bugs
- 📝 Updated documentation

### Version 1.0.0 (Initial Release)

- 🎉 Fabric.js canvas editor
- 🎉 Basic PDF generation
- 🎉 Template management
- 🎉 Student management
- 🎉 QR code verification

---

**Last Updated**: November 20, 2024
**Documentation Version**: 2.0.0

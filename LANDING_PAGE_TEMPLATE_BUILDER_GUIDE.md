# Dynamic Landing Page Builder & Template System

## 🎯 Overview

This document describes the enhanced landing page builder and dynamic template builder with advanced validation, mapping, and compatibility features.

---

## 🌐 Landing Page Builder

### Features

#### 1. **Visual Page Builder**
- Drag-and-drop interface
- Real-time preview (Desktop/Tablet/Mobile)
- Component-based architecture
- Live editing with instant feedback

#### 2. **Customizable Sections**

**Header Section:**
- Logo upload/URL
- University name
- Tagline
- Colors (background, text)

**Hero Section:**
- Title and subtitle
- Background image/color
- Call-to-action button
- Custom styling

**Features Section:**
- Icon grid display
- Feature cards
- Customizable icons
- Description text

**Verification Form:**
- Configurable fields
- Field validation
- Custom styling
- Multiple input types (text, date, email, etc.)

**Statistics Section:**
- Counter displays
- Achievement metrics
- Visual impact numbers

**Instructions Section:**
- Step-by-step guide
- Numbered process
- Visual flow

**Footer Section:**
- Contact information
- Social media links
- Copyright text
- Multi-column layout

#### 3. **Advanced Settings**
- Custom CSS injection
- Custom JavaScript
- QR Scanner integration
- CAPTCHA support
- Google Analytics
- SEO meta tags

### Usage

```jsx
import LandingPageBuilder from '@/components/LandingPageBuilder';

function AdminPanel() {
  return <LandingPageBuilder />;
}
```

### Configuration Structure

```javascript
{
  header: {
    logoUrl: 'string',
    universityName: 'string',
    tagline: 'string',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  },
  hero: {
    title: 'string',
    subtitle: 'string',
    backgroundImageUrl: 'string',
    backgroundColor: '#f8f9fa',
    buttonColor: '#007bff',
    buttonText: 'string'
  },
  verification: {
    title: 'string',
    fields: [
      {
        id: 'rollNo',
        label: 'Roll Number',
        type: 'text',
        required: true,
        enabled: true
      }
    ]
  },
  advanced: {
    customCSS: 'string',
    enableQRScanner: boolean,
    enableCaptcha: boolean,
    metaTitle: 'string',
    metaDescription: 'string'
  }
}
```

### API Endpoints

**Save Landing Page:**
```
POST /api/landing-page/save
Authorization: Bearer {token}
Body: { config: {...} }
```

**Publish Landing Page:**
```
POST /api/landing-page/publish
Authorization: Bearer {token}
Body: { config: {...} }
```

**Get Landing Page:**
```
GET /api/landing-page/get
Authorization: Bearer {token}
```

---

## 🎨 Dynamic Template Builder

### Features

#### 1. **Dual Template Modes**

**HTML Mode:**
- Direct HTML/CSS editing
- Variable placeholders
- Preview with sample data
- Syntax highlighting

**Canvas Mode:**
- Visual drag-and-drop editor
- PDF/JPEG background mapping
- Precise element positioning
- Transform controls (move, resize, rotate)

#### 2. **Variable System**

**Variable Configuration:**
```javascript
{
  id: 'studentName',
  label: 'Student Name',
  type: 'text',        // text, number, date, email
  required: true,
  validation: 'required|min:3|max:50'
}
```

**Supported Types:**
- Text
- Number
- Date
- Email
- Custom (with regex validation)

**Validation Rules:**
- `required` - Field must not be empty
- `min:n` - Minimum length
- `max:n` - Maximum length
- `email` - Valid email format
- `numeric` - Numbers only
- `alphanumeric` - Letters and numbers
- `alpha` - Letters only
- `date` - Valid date format
- Custom regex patterns

#### 3. **Field Mapping System**

**Purpose:** Map template variables to data source fields

**Configuration:**
```javascript
{
  source: 'student',  // student, module, custom
  fieldMappings: {
    studentName: 'name',
    rollNo: 'rollNo',
    regNo: 'regNo',
    issueDate: 'createdAt'
  },
  transformations: {
    studentName: 'uppercase',
    issueDate: 'formatDate:DD/MM/YYYY',
    grade: 'capitalize'
  }
}
```

**Supported Transformations:**
- `uppercase` - Convert to UPPERCASE
- `lowercase` - Convert to lowercase
- `capitalize` - Capitalize First Letter
- `formatDate:FORMAT` - Date formatting
  - `DD/MM/YYYY`
  - `MM/DD/YYYY`
  - `YYYY-MM-DD`
  - `DD MMM YYYY`
- `truncate:n` - Truncate to n characters
- `pad:n` - Pad with zeros
- `replace:old:new` - Replace text

#### 4. **Validation Engine**

**Custom Validation Rules:**
```javascript
{
  rollNo: {
    pattern: '^[A-Z0-9]{6,12}$',
    message: 'Roll number must be 6-12 alphanumeric characters'
  },
  regNo: {
    pattern: '^REG[0-9]{8,10}$',
    message: 'Registration number must start with REG followed by 8-10 digits'
  },
  email: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    message: 'Invalid email format'
  },
  percentage: {
    pattern: '^(100|[1-9]?[0-9])(\\.\\d{1,2})?$',
    message: 'Percentage must be between 0 and 100'
  }
}
```

**Real-time Validation:**
- Validates as user types
- Visual feedback (green/red borders)
- Error message display
- Prevents invalid submissions

#### 5. **Canvas Editor**

**Features:**
- Background image upload
- Add text elements
- Add shapes (rectangles, circles)
- Precise positioning (X, Y coordinates)
- Element properties:
  - Font size
  - Font family
  - Color
  - Stroke width
  - Fill color
- Variable linking
- Multi-select
- Undo/redo
- Grid snapping
- Alignment tools

**Element Types:**
- Text
- Rectangle
- Circle
- Line
- Image
- QR Code placeholder

### Usage

```jsx
import DynamicTemplateBuilder from '@/components/DynamicTemplateBuilder';

function TemplateCreator() {
  return <DynamicTemplateBuilder />;
}
```

### Template Export Format

```javascript
{
  name: 'Template Name',
  description: 'Template description',
  type: 'html' | 'canvas',
  variables: [
    {
      id: 'studentName',
      label: 'Student Name',
      type: 'text',
      required: true,
      validation: 'required|min:3'
    }
  ],
  validationRules: {
    rollNo: {
      pattern: '^[A-Z0-9]{6,12}$',
      message: 'Error message'
    }
  },
  mappingConfig: {
    source: 'student',
    fieldMappings: {...},
    transformations: {...}
  },
  
  // HTML Template
  htmlContent: '<html>...</html>',
  cssContent: 'css styles',
  
  // Canvas Template
  canvasSize: { width: 800, height: 1130 },
  backgroundImage: 'base64 or URL',
  elements: [
    {
      id: 'element-id',
      type: 'text',
      x: 100,
      y: 100,
      text: '{{studentName}}',
      fontSize: 24,
      variable: 'studentName'
    }
  ]
}
```

---

## 🔄 Workflow Integration

### Complete Certificate Generation Flow

```
1. CREATE TEMPLATE
   ├─ Choose type (HTML/Canvas)
   ├─ Design layout
   ├─ Add variables
   ├─ Configure validation
   ├─ Set up field mapping
   └─ Save template

2. CONFIGURE LANDING PAGE
   ├─ Customize branding
   ├─ Set up verification form
   ├─ Enable features
   └─ Publish page

3. IMPORT STUDENT DATA
   ├─ Upload CSV/Excel
   ├─ Map fields to template variables
   ├─ Validate data
   └─ Import

4. GENERATE CERTIFICATES
   ├─ Select students
   ├─ Choose template
   ├─ Apply transformations
   ├─ Validate data
   └─ Generate

5. STUDENT VERIFICATION
   ├─ Visit landing page
   ├─ Enter credentials
   ├─ Validate input
   ├─ View certificate
   └─ Download
```

---

## 🔧 Technical Implementation

### Landing Page Builder

**Components:**
- Editor Panel (left)
- Configuration Panel (middle)
- Live Preview (right)

**State Management:**
```javascript
const [config, setConfig] = useState({
  header: {...},
  hero: {...},
  features: {...},
  verification: {...},
  footer: {...},
  advanced: {...}
});
```

**Preview Modes:**
- Desktop (full width)
- Tablet (768px)
- Mobile (375px)

**Actions:**
- Save Draft
- Publish Live
- Export Configuration

### Dynamic Template Builder

**Tabs:**
1. Design - Visual editor
2. Variables - Variable configuration
3. Mapping - Field mapping setup
4. Validation - Validation rules
5. Preview - Live preview with sample data
6. Export - Export template JSON

**Canvas Editor (Konva.js):**
```javascript
<Stage width={800} height={1130}>
  <Layer>
    <Image src={background} />
    <Text x={100} y={100} text="{{variable}}" />
    <Rect x={50} y={50} width={100} height={100} />
  </Layer>
</Stage>
```

**Variable Replacement:**
```javascript
// In HTML
const processedHTML = htmlContent.replace(
  /\{\{(\w+)\}\}/g,
  (match, key) => data[key] || match
);

// In Canvas
const displayText = element.variable 
  ? data[element.variable] || element.text
  : element.text;
```

---

## 📊 Validation System

### Validation Pipeline

```
1. CLIENT-SIDE VALIDATION
   ├─ Check required fields
   ├─ Validate format (regex)
   ├─ Check length constraints
   └─ Real-time feedback

2. SERVER-SIDE VALIDATION
   ├─ Re-validate all fields
   ├─ Check database constraints
   ├─ Verify uniqueness
   └─ Return errors

3. DATA TRANSFORMATION
   ├─ Apply transformations
   ├─ Format dates
   ├─ Normalize text
   └─ Sanitize input
```

### Validation Rules Examples

```javascript
// Roll Number: Alphanumeric, 6-12 characters
pattern: '^[A-Z0-9]{6,12}$'

// Registration: REG prefix + 8-10 digits
pattern: '^REG[0-9]{8,10}$'

// Email: Standard email format
pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'

// Percentage: 0-100 with up to 2 decimals
pattern: '^(100|[1-9]?[0-9])(\\.\\d{1,2})?$'

// Phone: 10 digits
pattern: '^[0-9]{10}$'

// Date: YYYY-MM-DD format
pattern: '^\\d{4}-\\d{2}-\\d{2}$'
```

---

## 🔗 Field Mapping

### Mapping Strategies

**1. Direct Mapping:**
```javascript
studentName → student.name
rollNo → student.rollNo
```

**2. Nested Mapping:**
```javascript
programName → student.enrollment.program.name
departmentName → student.enrollment.program.department.name
```

**3. Computed Mapping:**
```javascript
fullName → CONCAT(student.firstName, ' ', student.lastName)
age → CALCULATE_AGE(student.dob)
```

**4. Conditional Mapping:**
```javascript
status → student.isGraduated ? 'Graduated' : 'Enrolled'
grade → student.percentage >= 75 ? 'Distinction' : 'First Class'
```

### Transformation Functions

```javascript
// Uppercase
transform(value, 'uppercase') → VALUE

// Format Date
transform('2024-11-20', 'formatDate:DD/MM/YYYY') → 20/11/2024

// Capitalize
transform('john doe', 'capitalize') → John Doe

// Truncate
transform('Very Long Text', 'truncate:10') → Very Long...

// Pad
transform('123', 'pad:6') → 000123

// Replace
transform('John_Doe', 'replace:_: ') → John Doe
```

---

## 🎯 Best Practices

### Landing Page Design

1. **Keep It Simple**
   - Clear call-to-action
   - Minimal form fields
   - Easy navigation

2. **Mobile First**
   - Test on mobile devices
   - Touch-friendly buttons
   - Readable font sizes

3. **Performance**
   - Optimize images
   - Minimize custom CSS
   - Lazy load sections

4. **Accessibility**
   - Proper labels
   - Keyboard navigation
   - Screen reader support

### Template Design

1. **Variable Naming**
   - Use camelCase
   - Descriptive names
   - Consistent prefixes

2. **Validation**
   - Validate on both client and server
   - Clear error messages
   - Test with edge cases

3. **Mapping**
   - Document field mappings
   - Test transformations
   - Handle null values

4. **Layout**
   - Use A4 size (800x1130px) for PDFs
   - Test print output
   - Consider margins

---

## 🚀 Advanced Features

### QR Code Integration

**Landing Page:**
- Enable QR scanner
- Scan certificate QR code
- Auto-fill verification form
- Instant verification

**Template:**
- Add QR code placeholder
- Link to verification URL
- Include certificate ID
- Dynamic generation

### CAPTCHA Support

**Options:**
- Google reCAPTCHA v2
- Google reCAPTCHA v3
- hCaptcha
- Custom CAPTCHA

**Configuration:**
```javascript
{
  enableCaptcha: true,
  captchaType: 'recaptcha-v3',
  siteKey: 'your-site-key'
}
```

### Analytics Integration

**Tracking:**
- Page views
- Verification attempts
- Download counts
- Success/failure rates

**Configuration:**
```javascript
{
  enableAnalytics: true,
  googleAnalyticsId: 'GA-XXXXXXXX',
  trackEvents: ['verify', 'download', 'share']
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { ... }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }
```

### Preview Modes

**Desktop (1920px):**
- Full layout
- Multi-column
- Large images

**Tablet (768px):**
- Adjusted columns
- Scaled images
- Touch-optimized

**Mobile (375px):**
- Single column
- Stacked elements
- Large buttons

---

## 🔒 Security Considerations

### Input Validation
- Sanitize all inputs
- Escape HTML/JavaScript
- Validate file uploads
- Check file types and sizes

### CSRF Protection
- Use tokens
- Verify referer
- Same-site cookies

### Rate Limiting
- Limit verification attempts
- Prevent brute force
- Track IP addresses

### Data Privacy
- Encrypt sensitive data
- Secure API endpoints
- Access control
- Audit logs

---

## 🐛 Troubleshooting

### Common Issues

**Landing Page Not Saving:**
- Check authentication token
- Verify API endpoint
- Check console errors
- Validate configuration JSON

**Template Not Rendering:**
- Check variable syntax
- Verify field mappings
- Test with sample data
- Check console for errors

**Validation Failing:**
- Test regex patterns
- Check data types
- Verify transformation functions
- Review error messages

**Canvas Elements Not Appearing:**
- Check z-index/layer order
- Verify coordinates
- Check element visibility
- Reload background image

---

## 📚 API Reference

### Landing Page APIs

```javascript
// Save draft
POST /api/landing-page/save
Body: { config: {...} }
Response: { success: true, id: '...' }

// Publish live
POST /api/landing-page/publish
Body: { config: {...} }
Response: { success: true, url: '...' }

// Get configuration
GET /api/landing-page/get
Response: { config: {...} }

// Preview
GET /api/landing-page/preview
Response: { html: '...' }
```

### Template APIs

```javascript
// Create template
POST /api/template/create
Body: { template: {...} }
Response: { template: {...}, id: '...' }

// Update template
PUT /api/template/:id
Body: { template: {...} }
Response: { template: {...} }

// Get template
GET /api/template/:id
Response: { template: {...} }

// Validate data
POST /api/template/:id/validate
Body: { data: {...} }
Response: { valid: true, errors: [] }
```

---

**Version:** 2.0  
**Last Updated:** November 20, 2025  
**Status:** ✅ Production Ready

---

🎨 **Dynamic Landing Page Builder & Template System - Complete!** 🚀

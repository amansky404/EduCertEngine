# Builder Enhancements Documentation

This document describes the extensive enhancements made to the Page Builder and Template Builders to make them extremely dynamic and feature-rich.

## Overview

The EduCertEngine now features three significantly enhanced builders:
1. **Landing Page Builder** - Dynamic section-based page creation
2. **HTML Template Builder** - Advanced canvas-based template design
3. **PDF Mapper** - Precise field mapping with validation

---

## 1. Landing Page Builder (`/admin/landing-builder`)

### Features

#### Dynamic Section Management
- **Add Sections**: Choose from 10 different section types
- **Remove Sections**: Delete any section with confirmation
- **Reorder Sections**: Move sections up or down to change page layout
- **Enable/Disable**: Toggle section visibility without deletion

#### Supported Section Types

1. **Hero Banner**
   - Customizable title and subtitle
   - Background color picker
   - Text color picker
   - Image upload support

2. **Notice Board**
   - Dynamic notice management
   - Add/edit/remove individual notices
   - Date tracking for each notice
   - Yellow-themed design

3. **Important Links**
   - Dynamic link management
   - Configure title and URL for each link
   - Grid layout support
   - Add/remove links on the fly

4. **Text Content**
   - Rich text with HTML support
   - Configurable alignment (left, center, right, justify)
   - Full content editing

5. **Contact Information**
   - Email, phone, address fields
   - Structured contact display

6. **Statistics Counter**
   - Display key metrics
   - Configurable stat items

7. **Image Gallery**
   - Multiple image support
   - Grid layout

8. **Testimonials**
   - Customer/student testimonials
   - Structured testimonial items

9. **Features Grid**
   - Highlight key features
   - Icon and text support

10. **Custom HTML**
    - Full HTML/CSS customization
    - Advanced users can inject custom code

### User Interface

#### Left Panel: Section Management
- Section type selector dropdown
- "Add Section" button
- List of all sections with:
  - Section name
  - Enable/disable checkbox
  - Up/down reorder buttons
  - Delete button

#### Center Panel: Section Editor
- Section name input
- Type-specific configuration fields
- Real-time updates
- Intuitive form controls

#### Right Panel: Live Preview
- Real-time preview of landing page
- Responsive design preview
- Always shows search section at bottom
- Scrollable viewport

### Technical Implementation

**State Management:**
```typescript
interface Section {
  id: string
  name: string
  type: string
  enabled: boolean
  order: number
  config: any
}
```

**Key Functions:**
- `addSection()` - Creates new section with default config
- `deleteSection(id)` - Removes section
- `updateSection(id, updates)` - Updates section properties
- `moveSection(id, direction)` - Reorders sections
- `renderSectionPreview(section)` - Generates preview HTML
- `renderSectionEditor(section)` - Generates editor form

---

## 2. HTML Template Builder (`/admin/templates/html-builder/[id]`)

### Features

#### Element Types
- **Text** - IText with inline editing
- **Rectangle** - Colored rectangles with borders
- **Circle** - Perfect circles with fill and stroke
- **Line** - Straight lines with configurable stroke
- **Image** - Upload and place images
- **QR Code Placeholder** - Placeholder for dynamic QR codes

#### Variable System

**Standard Variables:**
- studentName
- rollNo
- courseName
- grade
- date

**Custom Variables:**
- Create unlimited custom variables
- Add via input field
- Remove unwanted variables
- Variables displayed as `{{variableName}}`

#### Advanced Features

**History Management:**
- **Undo** - Revert last change (↶ button)
- **Redo** - Restore undone change (↷ button)
- State saved after each action
- Navigate through edit history

**Alignment Tools:**

Horizontal:
- Align Left (←)
- Align Center (↔)
- Align Right (→)

Vertical:
- Align Top (↑)
- Align Middle (↕)
- Align Bottom (↓)

**Layer Management:**
- Bring to Front - Move object to top layer
- Send to Back - Move object to bottom layer
- Duplicate - Clone selected object with offset

**Canvas Controls:**
- Background color picker
- Zoom In/Out (50% - 200%)
- Reset Zoom to 100%
- Clear Canvas with confirmation

### User Interface

#### Left Sidebar
1. **Elements Panel**
   - Add Text, Rectangle, Circle, Line, Image, QR Code

2. **Variables Panel**
   - Standard variables (quick add)
   - Custom variables list
   - Add custom variable input
   - Remove custom variables

3. **Alignment Panel**
   - 3x3 grid for horizontal/vertical alignment

4. **Layer Panel**
   - Bring to Front
   - Send to Back
   - Duplicate

5. **Canvas Panel**
   - Background color
   - Zoom controls
   - Clear canvas

#### Center Canvas
- 800x600 canvas
- Drag and drop objects
- Click to select
- Double-click text to edit
- Visual selection indicators

#### Right Sidebar: Properties
- **Text Properties:**
  - Text content
  - Font size
  - Font family (5 options)
  - Text color with picker

- **General:**
  - Delete selected button

### Technical Implementation

**Fabric.js Integration:**
```typescript
const canvas = new fabric.Canvas(canvasRef.current, {
  width: 800,
  height: 600,
  backgroundColor: "#ffffff",
})
```

**History System:**
```typescript
const [history, setHistory] = useState<any[]>([])
const [historyIndex, setHistoryIndex] = useState(-1)

const saveState = () => {
  const state = canvas.toJSON()
  const newHistory = history.slice(0, historyIndex + 1)
  newHistory.push(state)
  setHistory(newHistory)
  setHistoryIndex(newHistory.length - 1)
}
```

---

## 3. PDF Mapper (`/admin/templates/pdf-mapper/[id]`)

### Features

#### Field Types (7 Total)

1. **Text Field**
   - Multi-line text input
   - Font customization
   - Color picker

2. **Number Field**
   - Numeric input only
   - Validation support

3. **Date Field**
   - Date formatting
   - Validation rules

4. **Checkbox**
   - Boolean selection
   - Square visualization

5. **Dropdown**
   - Multiple option selection
   - Configurable options list

6. **Image Field**
   - Dynamic image placement
   - Size and position control

7. **QR Code**
   - QR code placeholder
   - Position and size control

#### Field Validation

**Validation Rules:**
- **Required** - Field must have value
- **Min Length** - Minimum character count (text)
- **Max Length** - Maximum character count (text)
- **Pattern** - Regex validation (future)

**Configuration:**
```typescript
validation: {
  required: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
}
```

#### Conditional Display

**Show/Hide Logic:**
- **Show If** - Display field when variable is set
- **Hide If** - Hide field when variable is set

**Use Cases:**
- Show grade field only if student passed
- Hide certificate number for draft documents
- Conditional signatures based on department

**Configuration:**
```typescript
conditional: {
  showIf?: string  // variable name
  hideIf?: string  // variable name
}
```

#### Grid Snap System

**Features:**
- Toggle grid on/off
- Configurable grid size (5-50px)
- Visual grid overlay
- Automatic snapping during drag

**Benefits:**
- Precise alignment
- Consistent spacing
- Professional layouts

#### Zoom Controls

**Zoom Levels:**
- Minimum: 50%
- Maximum: 200%
- Step: 10%
- Reset: 100%

**Use Cases:**
- Zoom in for precise positioning
- Zoom out for overall layout view
- Fine-tune field placement

#### Field Operations

**Duplicate Field:**
- Clone any field
- Automatic offset (20px x, 20px y)
- Preserves all properties
- Quick field replication

### User Interface

#### Left Sidebar

1. **Background Panel**
   - Upload PDF or image
   - Upload progress indicator

2. **Add Fields Panel**
   - 7 field type buttons
   - One-click field creation

3. **Canvas Controls Panel**
   - Zoom slider (visual feedback)
   - Grid toggle checkbox
   - Grid size slider (when enabled)

4. **Fields List Panel**
   - All fields listed
   - Click to select
   - Duplicate button (⎘)
   - Delete button (×)
   - Shows field type and position

#### Center Canvas
- Background image/PDF display
- Draggable field overlays
- Visual field boundaries
- Grid overlay (when enabled)
- Zoom transform applied
- Color-coded selection (blue = selected, green = unselected)

#### Right Sidebar: Properties

**Basic Properties:**
- Field Name (internal identifier)
- Label (display name)
- Position (X, Y coordinates)
- Size (Width, Height)

**Text Styling** (for text/number/date):
- Font Size
- Font Family (5 options)
- Text Color (picker + hex input)

**Dropdown Configuration:**
- Options textarea
- One option per line
- Auto-filtered empty lines

**Validation Section:**
- Required checkbox
- Min Length input (text fields)
- Max Length input (text fields)

**Conditional Display Section:**
- Show If variable input
- Hide If variable input
- Variable name placeholders

### Technical Implementation

**Field Interface:**
```typescript
interface FieldMapping {
  id: string
  name: string
  label: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  color: string
  type: "text" | "image" | "qr" | "date" | "number" | "checkbox" | "dropdown"
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  conditional?: {
    showIf?: string
    hideIf?: string
  }
  options?: string[]
  defaultValue?: any
}
```

**Grid Snap Function:**
```typescript
const snapToGrid = (value: number) => {
  if (!gridEnabled) return value
  return Math.round(value / gridSize) * gridSize
}
```

---

## 4. Template Builder Utilities Enhancement

### Advanced Template Syntax

#### Conditional Rendering

**Syntax:**
```html
{{#if variableName}}
  Content shown when variable is truthy
{{/if}}
```

**With Else:**
```html
{{#if isPassed}}
  <p>Congratulations! You passed.</p>
{{else}}
  <p>Please try again.</p>
{{/if}}
```

#### Loop/Iteration

**Syntax:**
```html
{{#each courses}}
  <div>{{this}}</div>
{{/each}}
```

**With Object Properties:**
```html
{{#each students}}
  <p>{{this.name}} - {{this.rollNo}}</p>
{{/each}}
```

**With Index:**
```html
{{#each items}}
  <p>{{@index}}. {{this}}</p>
{{/each}}
```

#### Nested Variables

**Dot Notation:**
```html
{{student.name}}
{{student.address.city}}
{{course.instructor.email}}
```

### Utility Functions

#### mergeTemplateVariables(htmlContent, data)
Basic variable replacement with nested support.

**Example:**
```javascript
const template = "<p>Hello {{user.name}}!</p>"
const data = { user: { name: "John" } }
const result = mergeTemplateVariables(template, data)
// Result: "<p>Hello John!</p>"
```

#### mergeTemplateAdvanced(htmlContent, data)
Advanced merging with conditionals and loops.

**Example:**
```javascript
const template = `
  {{#if isPassed}}
    <h2>Certificate</h2>
    {{#each courses}}
      <p>{{this.name}}: {{this.grade}}</p>
    {{/each}}
  {{/if}}
`
const data = {
  isPassed: true,
  courses: [
    { name: "Math", grade: "A" },
    { name: "Science", grade: "B+" }
  ]
}
const result = mergeTemplateAdvanced(template, data)
```

#### extractTemplateVariables(htmlContent)
Extract all variable names from template (excludes control structures).

#### validateFieldMapping(mappingConfig)
Validate field mapping with enhanced checks.

**Returns:**
```typescript
{
  isValid: boolean
  errors: string[]
  warnings: string[]
}
```

#### fabricToPDFConfig(fabricConfig)
Convert Fabric.js canvas to PDF configuration.

**Supports:**
- Text/IText objects
- Images
- Rectangles
- Circles
- Lines
- Rotation and opacity

#### computeFieldValue(expression, data)
Evaluate computed field expressions.

**Example:**
```javascript
const expr = "totalMarks / totalSubjects"
const data = { totalMarks: 450, totalSubjects: 5 }
const result = computeFieldValue(expr, data)
// Result: 90
```

#### shouldShowField(field, data)
Determine if field should be visible based on conditionals.

---

## Usage Guide

### Creating a Dynamic Landing Page

1. Navigate to `/admin/landing-builder`
2. Click "Add Section" and choose section type
3. Configure section properties in center panel
4. Preview changes in real-time on right panel
5. Add multiple sections as needed
6. Reorder using up/down buttons
7. Click "Save Landing Page" when done

### Designing a Certificate Template

1. Navigate to `/admin/templates`
2. Create new template (choose HTML Builder)
3. Add elements from left sidebar
4. Add standard or custom variables
5. Style elements using properties panel
6. Use alignment tools for precision
7. Adjust layers as needed
8. Save template

### Mapping PDF Fields

1. Navigate to `/admin/templates`
2. Create new template (choose PDF Mapper)
3. Upload background PDF/image
4. Add fields of appropriate types
5. Drag fields to position them
6. Enable grid for precise alignment
7. Configure validation rules
8. Set conditional visibility if needed
9. Save mapping

---

## Best Practices

### Landing Page Builder
- Use hero section at the top for best impact
- Keep notice board before important links
- Use text sections for detailed information
- Test with enabled/disabled sections
- Preview on different screen sizes

### HTML Template Builder
- Use undo/redo frequently
- Group related elements
- Use custom variables for flexibility
- Align elements for professional look
- Save frequently during design

### PDF Mapper
- Enable grid for precise alignment
- Use zoom for detailed positioning
- Set validation rules early
- Test conditional logic thoroughly
- Duplicate similar fields to save time
- Use descriptive field names

### Template Utilities
- Use conditionals sparingly
- Test loops with sample data
- Validate templates before production
- Document custom variables
- Use nested variables for complex data

---

## Technical Notes

### Performance
- Canvas operations are optimized with Fabric.js
- History is limited to prevent memory issues
- Preview updates are debounced
- Large images are automatically scaled

### Browser Compatibility
- Modern browsers required (Chrome, Firefox, Safari, Edge)
- Canvas API support needed
- Local storage for auth tokens
- File upload API support

### Security
- No script/iframe injection in templates
- File upload validation
- JWT token authentication
- Input sanitization

### Limitations
- Canvas size fixed at 800x600 for HTML builder
- Maximum zoom 200%
- Grid size 5-50px
- History limited to memory constraints

---

## Future Enhancements

### Planned Features
- Template marketplace for sharing
- Collaborative editing with WebSocket
- More section types for landing pages
- Advanced shapes in HTML builder
- AI-powered template suggestions
- Export/import functionality
- Template versioning
- Mobile-responsive preview
- Multi-language support

### API Endpoints (To Be Implemented)
- POST `/api/landing/save` - Save landing page config
- GET `/api/landing/get` - Retrieve landing config
- POST `/api/template/export` - Export template
- POST `/api/template/import` - Import template
- GET `/api/template/preview` - Preview with real data

---

## Troubleshooting

### Common Issues

**Canvas not loading:**
- Check browser console for errors
- Ensure Fabric.js is loaded
- Verify canvas dimensions

**Variables not replacing:**
- Check variable name spelling
- Ensure data object has property
- Test with extractTemplateVariables

**Grid not showing:**
- Enable grid checkbox
- Ensure background is uploaded
- Check grid size setting

**Zoom not working:**
- Reset zoom to 100%
- Check canvas scale state
- Refresh page if stuck

**Field not draggable:**
- Ensure field is selected
- Check if background is uploaded
- Verify mouse event handlers

---

## Conclusion

These enhancements make the EduCertEngine builders extremely dynamic and powerful, providing administrators with professional-grade tools for creating customized certificates, templates, and landing pages. The intuitive interfaces combined with advanced features enable both simple and complex use cases while maintaining ease of use.

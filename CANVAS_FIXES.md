# Canvas Rendering and Builder Fixes

## Overview
This document describes the fixes implemented to resolve canvas rendering, drag and drop, and resizing issues in the EduCertEngine template builders.

## Issues Fixed

### 1. Canvas Not Rendering in HTML Builder
**Problem**: The Fabric.js canvas was being recreated multiple times due to improper dependency array in useEffect, causing rendering issues.

**Solution**:
- Fixed the canvas initialization useEffect dependency array to only depend on `canvasRef.current`
- Added proper cleanup function to dispose canvas on unmount
- Removed `canvasWidth` and `canvasHeight` from dependencies to prevent recreation

**Code Location**: `app/admin/templates/html-builder/[id]/page.tsx` (Lines 39-86)

### 2. Drag and Drop Not Working
**Problem**: Objects added to the canvas didn't have proper selectable and evented properties enabled.

**Solution**:
- Added explicit object properties to all created objects:
  - `selectable: true` - Allows object to be selected
  - `evented: true` - Allows object to receive events
  - `hasControls: true` - Shows resize/rotate controls
  - `hasBorders: true` - Shows selection border
  - `lockScalingFlip: true` - Prevents negative scaling

**Affected Functions**:
- `addText()` - Lines 229-244
- `addVariable()` - Lines 246-262
- `addRectangle()` - Lines 277-294
- `addCircle()` - Lines 296-313
- `addLine()` - Lines 315-332
- `addImage()` - Lines 334-371
- `addQRCodePlaceholder()` - Lines 373-390

### 3. Resizing Not Working
**Problem**: Objects loaded from saved templates didn't have controls enabled, and modification events weren't being tracked.

**Solution**:
- Added `object:modified` event handler to auto-save state after any modification
- When loading template configuration, explicitly enable controls on all loaded objects
- Added proper state saving after modifications

**Code Location**: `app/admin/templates/html-builder/[id]/page.tsx` (Lines 124-147)

### 4. PDF Mapper Drag Issues
**Problem**: Drag calculations didn't account for canvas scale and had incorrect offset calculations.

**Solution**:
- Fixed `handleFieldMouseDown()` to calculate correct offset relative to container
- Updated `handleMouseMove()` to properly account for canvas scale
- Improved coordinate transformation: `(e.clientX - rect.left - dragStart.x) / canvasScale`

**Code Location**: `app/admin/templates/pdf-mapper/[id]/page.tsx` (Lines 185-212)

## Enhanced PDF Generation

### New Functions Added to `lib/pdf.ts`

#### 1. `generatePDFFromMapper()`
Generates PDF from PDF/JPEG field mapper templates using pdf-lib.

**Features**:
- Supports PDF and image (PNG/JPG) backgrounds
- Handles all field types: text, number, date, checkbox, image, QR
- Proper coordinate transformation (Y-axis flipping)
- QR code integration
- Color conversion (hex to RGB)

**Usage**:
```typescript
await generatePDFFromMapper({
  backgroundPath: '/path/to/background.pdf',
  fields: fieldMappings,
  data: studentData,
  outputPath: '/path/to/output.pdf',
  qrCode: {
    enabled: true,
    data: 'verification-hash',
    position: { x: 50, y: 50 }
  }
})
```

#### 2. `generatePDFFromCanvas()`
Converts Fabric.js canvas JSON to PDF using pdf-lib.

**Features**:
- Converts canvas objects (text, rectangles, circles) to PDF
- Supports variable replacement in text ({{variableName}})
- Background color support
- QR code integration
- Proper scaling and positioning

**Usage**:
```typescript
await generatePDFFromCanvas(
  canvasJSON,
  '/path/to/output.pdf',
  { studentName: 'John Doe', rollNo: '12345' },
  { enabled: true, data: 'verification-hash' }
)
```

#### 3. `hexToRgb()`
Utility function to convert hex color codes to RGB values for pdf-lib.

**Usage**:
```typescript
const rgb = hexToRgb('#ff5733')
// Returns: { r: 255, g: 87, b: 51 }
```

## Testing

### Manual Testing Steps

1. **Test Canvas Rendering**:
   - Navigate to HTML Builder
   - Verify canvas appears and is interactive
   - Try adding text, shapes, and images

2. **Test Drag and Drop**:
   - Add elements to canvas
   - Click and drag elements to move them
   - Verify position updates in real-time

3. **Test Resizing**:
   - Select any element on canvas
   - Drag corner handles to resize
   - Rotate using rotation handle
   - Verify transformations work smoothly

4. **Test PDF Mapper**:
   - Upload a background PDF/image
   - Add fields and position them
   - Drag fields to different positions
   - Verify zoom works correctly
   - Save and test PDF generation

5. **Test Canvas State**:
   - Add elements, move and resize them
   - Save template
   - Reload page
   - Verify all elements are in correct positions with controls enabled

## Technical Details

### Canvas Initialization Flow
1. Component mounts, `canvasRef` is created
2. `useEffect` detects `canvasRef.current` is available
3. New `fabric.Canvas` is created with initial dimensions
4. Event handlers are attached for selection and modification
5. Canvas state is saved to React state
6. Cleanup function disposes canvas on unmount

### Object Control Properties
All Fabric.js objects now include:
- `selectable: true` - Object can be selected with mouse
- `evented: true` - Object responds to mouse events
- `hasControls: true` - Shows corner/edge controls for resizing/rotation
- `hasBorders: true` - Shows selection border when selected
- `lockScalingFlip: true` - Prevents objects from being flipped with negative scale

### PDF Generation Architecture
- Uses `pdf-lib` (existing dependency) for all PDF operations
- Supports three template types:
  1. HTML Builder (Fabric.js canvas JSON)
  2. PDF Mapper (background + positioned fields)
  3. Direct Upload (pre-generated PDFs)
- Coordinate system conversion handles Y-axis differences between canvas and PDF
- QR code generation integrated via existing `generateQRCodeBuffer()` utility

## Dependencies

All fixes use existing dependencies:
- `fabric` (v5.5.2) - Canvas manipulation
- `pdf-lib` (v1.17.1) - PDF generation
- `qrcode` (v1.5.4) - QR code generation

No new dependencies were added.

## Future Enhancements

Potential improvements for future iterations:
1. Add support for more Fabric.js object types (polygons, paths, etc.) in PDF generation
2. Implement layers panel for easier object management
3. Add alignment guides and snapping in HTML builder
4. Support for grouped objects in PDF generation
5. Add undo/redo functionality (partially implemented)
6. Support for custom fonts in PDF generation
7. Background patterns and gradients support

## References

- [Fabric.js Documentation](http://fabricjs.com/docs/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Next.js Documentation](https://nextjs.org/docs)

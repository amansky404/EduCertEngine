const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate PDF certificate from template
 * @param {Object} certificate - Certificate data
 * @param {Object} template - Template configuration
 * @returns {Promise<String>} - Path to generated PDF
 */
exports.generatePDF = async (certificate, template) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([template.dimensions.width, template.dimensions.height]);
    
    // Load background if exists
    if (template.backgroundPDF) {
      const bgPath = path.join(process.cwd(), 'public', template.backgroundPDF);
      const bgBytes = await fs.readFile(bgPath);
      const bgPdf = await PDFDocument.load(bgBytes);
      const [bgPage] = await pdfDoc.copyPages(bgPdf, [0]);
      page.drawPage(bgPage);
    }
    
    // Load font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Draw fields
    for (const field of template.fields) {
      const value = certificate.fieldData.get(field.name) || field.defaultValue || '';
      
      if (field.type === 'text' || field.type === 'number' || field.type === 'date') {
        const selectedFont = field.style?.fontWeight === 'bold' ? boldFont : font;
        const fontSize = field.style?.fontSize || 12;
        const color = parseColor(field.style?.color || '#000000');
        
        page.drawText(String(value), {
          x: field.position.x,
          y: template.dimensions.height - field.position.y,
          size: fontSize,
          font: selectedFont,
          color: rgb(color.r, color.g, color.b),
        });
      }
      
      // Handle QR code
      if (field.type === 'qrcode' && certificate.qrCode) {
        const qrPath = path.join(process.cwd(), 'public', certificate.qrCode);
        const qrBytes = await fs.readFile(qrPath);
        const qrImage = await pdfDoc.embedPng(qrBytes);
        
        page.drawImage(qrImage, {
          x: field.position.x,
          y: template.dimensions.height - field.position.y - field.position.height,
          width: field.position.width,
          height: field.position.height,
        });
      }
    }
    
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfDir = path.join(process.cwd(), 'public', 'certificates', 'pdf');
    await fs.mkdir(pdfDir, { recursive: true });
    
    const pdfPath = path.join(pdfDir, `${certificate.certificateNumber}.pdf`);
    await fs.writeFile(pdfPath, pdfBytes);
    
    return `/certificates/pdf/${certificate.certificateNumber}.pdf`;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};

/**
 * Parse color string to RGB object
 * @param {String} colorString - Color in hex format
 * @returns {Object} - RGB values (0-1)
 */
function parseColor(colorString) {
  const hex = colorString.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255,
  };
}

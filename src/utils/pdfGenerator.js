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
      try {
        const bgPath = path.join(process.cwd(), 'public', template.backgroundPDF);
        const bgBytes = await fs.readFile(bgPath);
        const bgPdf = await PDFDocument.load(bgBytes);
        const [bgPage] = await pdfDoc.copyPages(bgPdf, [0]);
        page.drawPage(bgPage);
      } catch (error) {
        console.error('Failed to load background PDF:', error.message);
      }
    } else if (template.backgroundImage) {
      try {
        const bgPath = path.join(process.cwd(), 'public', template.backgroundImage);
        const bgBytes = await fs.readFile(bgPath);
        
        // Determine image type and embed
        let bgImage;
        const ext = path.extname(template.backgroundImage).toLowerCase();
        if (ext === '.png') {
          bgImage = await pdfDoc.embedPng(bgBytes);
        } else if (['.jpg', '.jpeg'].includes(ext)) {
          bgImage = await pdfDoc.embedJpg(bgBytes);
        }
        
        if (bgImage) {
          const { width, height } = page.getSize();
          page.drawImage(bgImage, {
            x: 0,
            y: 0,
            width,
            height,
          });
        }
      } catch (error) {
        console.error('Failed to load background image:', error.message);
      }
    }
    
    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
    // Draw fields
    for (const field of template.fields) {
      const value = certificate.fieldData.get(field.name) || field.defaultValue || '';
      
      if (field.type === 'text' || field.type === 'number' || field.type === 'date') {
        let selectedFont = font;
        
        // Select font based on style
        if (field.style?.fontWeight === 'bold') {
          selectedFont = boldFont;
        } else if (field.style?.fontStyle === 'italic') {
          selectedFont = italicFont;
        }
        
        const fontSize = field.style?.fontSize || 12;
        const color = parseColor(field.style?.color || '#000000');
        
        // Calculate text position based on alignment
        let xPos = field.position.x;
        const textWidth = selectedFont.widthOfTextAtSize(String(value), fontSize);
        
        if (field.style?.align === 'center' && field.position.width) {
          xPos = field.position.x + (field.position.width - textWidth) / 2;
        } else if (field.style?.align === 'right' && field.position.width) {
          xPos = field.position.x + field.position.width - textWidth;
        }
        
        page.drawText(String(value), {
          x: xPos,
          y: template.dimensions.height - field.position.y - fontSize,
          size: fontSize,
          font: selectedFont,
          color: rgb(color.r, color.g, color.b),
        });
      }
      
      // Handle QR code
      if (field.type === 'qrcode' && certificate.qrCode) {
        try {
          const qrPath = path.join(process.cwd(), 'public', certificate.qrCode);
          const qrBytes = await fs.readFile(qrPath);
          const qrImage = await pdfDoc.embedPng(qrBytes);
          
          page.drawImage(qrImage, {
            x: field.position.x,
            y: template.dimensions.height - field.position.y - field.position.height,
            width: field.position.width,
            height: field.position.height,
          });
        } catch (error) {
          console.error('Failed to embed QR code:', error.message);
        }
      }
      
      // Handle image fields
      if (field.type === 'image' && certificate.fieldData.get(field.name)) {
        try {
          const imgPath = path.join(process.cwd(), 'public', certificate.fieldData.get(field.name));
          const imgBytes = await fs.readFile(imgPath);
          
          let image;
          const ext = path.extname(certificate.fieldData.get(field.name)).toLowerCase();
          if (ext === '.png') {
            image = await pdfDoc.embedPng(imgBytes);
          } else if (['.jpg', '.jpeg'].includes(ext)) {
            image = await pdfDoc.embedJpg(imgBytes);
          }
          
          if (image) {
            page.drawImage(image, {
              x: field.position.x,
              y: template.dimensions.height - field.position.y - field.position.height,
              width: field.position.width,
              height: field.position.height,
            });
          }
        } catch (error) {
          console.error('Failed to embed image:', error.message);
        }
      }
    }
    
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfDir = path.join(process.cwd(), 'public', 'certificates', 'pdf');
    await fs.mkdir(pdfDir, { recursive: true });
    
    const pdfFilename = `${certificate.certificateNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFilename);
    await fs.writeFile(pdfPath, pdfBytes);
    
    return `/certificates/pdf/${pdfFilename}`;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Generate JPEG from PDF
 * @param {String} pdfPath - Path to PDF file
 * @returns {Promise<String>} - Path to generated JPEG
 */
exports.generateJPEG = async (pdfPath) => {
  // This would require additional dependencies like pdf2pic or sharp
  // For now, return a placeholder
  throw new Error('JPEG generation not yet implemented. Requires pdf2pic or similar library.');
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

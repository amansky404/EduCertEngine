/**
 * Template Builder Utilities
 * Provides helper functions for HTML template builder, PDF mapper, and direct upload modes
 */

/**
 * Merge template variables with data
 * @param {String} htmlContent - HTML template content with {{variables}}
 * @param {Object} data - Data object to merge
 * @returns {String} - HTML with variables replaced
 */
exports.mergeTemplateVariables = (htmlContent, data) => {
  let result = htmlContent;
  
  // Replace {{variable}} with data values
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value || '');
  }
  
  // Clean up any remaining unmatched variables
  result = result.replace(/{{[^}]+}}/g, '');
  
  return result;
};

/**
 * Extract variables from HTML template
 * @param {String} htmlContent - HTML template content
 * @returns {Array<String>} - Array of variable names
 */
exports.extractTemplateVariables = (htmlContent) => {
  const regex = /{{([^}]+)}}/g;
  const variables = new Set();
  let match;
  
  while ((match = regex.exec(htmlContent)) !== null) {
    variables.add(match[1].trim());
  }
  
  return Array.from(variables);
};

/**
 * Validate template HTML structure
 * @param {String} htmlContent - HTML content to validate
 * @returns {Object} - Validation result
 */
exports.validateTemplateHTML = (htmlContent) => {
  const errors = [];
  
  // Check for basic HTML structure
  if (!htmlContent || htmlContent.trim().length === 0) {
    errors.push('Template content is empty');
  }
  
  // Check for script tags (security)
  if (/<script\b[^>]*>/i.test(htmlContent)) {
    errors.push('Script tags are not allowed in templates');
  }
  
  // Check for iframe tags (security)
  if (/<iframe/i.test(htmlContent)) {
    errors.push('Iframe tags are not allowed in templates');
  }
  
  // Check for balanced tags (basic validation)
  const openTags = (htmlContent.match(/<[^/][^>]*>/g) || []).length;
  const closeTags = (htmlContent.match(/<\/[^>]+>/g) || []).length;
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: openTags !== closeTags ? ['HTML tags may not be balanced'] : [],
  };
};

/**
 * Generate field mapping configuration for PDF mapper
 * @param {Array} fields - Array of field definitions
 * @returns {Object} - Mapping configuration
 */
exports.generateFieldMapping = (fields) => {
  const mapping = {
    fields: [],
    metadata: {
      createdAt: new Date(),
      version: '1.0',
    },
  };
  
  fields.forEach(field => {
    mapping.fields.push({
      name: field.name,
      label: field.label || field.name,
      type: field.type || 'text',
      position: {
        x: field.x || 0,
        y: field.y || 0,
        width: field.width || 100,
        height: field.height || 30,
      },
      style: {
        fontSize: field.fontSize || 12,
        fontFamily: field.fontFamily || 'Helvetica',
        fontWeight: field.fontWeight || 'normal',
        color: field.color || '#000000',
        align: field.align || 'left',
      },
      required: field.required || false,
      defaultValue: field.defaultValue || '',
    });
  });
  
  return mapping;
};

/**
 * Validate field mapping configuration
 * @param {Object} mappingConfig - Mapping configuration to validate
 * @returns {Object} - Validation result
 */
exports.validateFieldMapping = (mappingConfig) => {
  const errors = [];
  
  if (!mappingConfig || typeof mappingConfig !== 'object') {
    errors.push('Invalid mapping configuration');
    return { isValid: false, errors };
  }
  
  if (!Array.isArray(mappingConfig.fields)) {
    errors.push('Fields must be an array');
    return { isValid: false, errors };
  }
  
  // Validate each field
  mappingConfig.fields.forEach((field, index) => {
    if (!field.name) {
      errors.push(`Field at index ${index} is missing 'name' property`);
    }
    
    if (!field.position || typeof field.position !== 'object') {
      errors.push(`Field '${field.name}' is missing valid position`);
    }
    
    if (field.position) {
      if (typeof field.position.x !== 'number' || typeof field.position.y !== 'number') {
        errors.push(`Field '${field.name}' has invalid position coordinates`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate file mapping for direct upload mode
 * @param {Array} files - Array of uploaded files
 * @param {Array} students - Array of student data
 * @returns {Object} - File mapping configuration
 */
exports.generateFileMapping = (files, students) => {
  const mapping = {
    files: [],
    unmapped: [],
    mapped: 0,
  };
  
  files.forEach(file => {
    const match = students.find(student => {
      // Try to match by roll number in filename
      const rollPattern = new RegExp(student.rollNumber, 'i');
      return rollPattern.test(file.name);
    });
    
    if (match) {
      mapping.files.push({
        filename: file.name,
        studentId: match._id || match.id,
        studentName: match.name,
        rollNumber: match.rollNumber,
        matched: true,
      });
      mapping.mapped++;
    } else {
      mapping.unmapped.push({
        filename: file.name,
        matched: false,
      });
    }
  });
  
  return mapping;
};

/**
 * Generate CSS for template styling
 * @param {Object} branding - Branding configuration
 * @returns {String} - CSS string
 */
exports.generateTemplateCSS = (branding) => {
  return `
    :root {
      --primary-color: ${branding.primaryColor || '#3b82f6'};
      --secondary-color: ${branding.secondaryColor || '#1e40af'};
      --text-color: #000000;
      --background-color: #ffffff;
    }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 0;
      background-color: var(--background-color);
      color: var(--text-color);
    }
    
    .certificate-container {
      width: 210mm; /* A4 width */
      height: 297mm; /* A4 height */
      position: relative;
      overflow: hidden;
    }
    
    .certificate-container.landscape {
      width: 297mm;
      height: 210mm;
    }
    
    .field {
      position: absolute;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .primary {
      color: var(--primary-color);
    }
    
    .secondary {
      color: var(--secondary-color);
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      
      .certificate-container {
        page-break-after: always;
      }
    }
  `;
};

/**
 * Convert Fabric.js config to PDF-lib compatible format
 * @param {Object} fabricConfig - Fabric.js canvas configuration
 * @returns {Object} - PDF-lib compatible configuration
 */
exports.fabricToPDFConfig = (fabricConfig) => {
  if (!fabricConfig || !fabricConfig.objects) {
    return { fields: [] };
  }
  
  const fields = [];
  
  fabricConfig.objects.forEach(obj => {
    if (obj.type === 'text' || obj.type === 'textbox') {
      fields.push({
        name: obj.name || `field_${fields.length}`,
        type: 'text',
        position: {
          x: obj.left || 0,
          y: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 30,
        },
        style: {
          fontSize: obj.fontSize || 12,
          fontFamily: obj.fontFamily || 'Helvetica',
          fontWeight: obj.fontWeight || 'normal',
          color: obj.fill || '#000000',
          align: obj.textAlign || 'left',
        },
        defaultValue: obj.text || '',
      });
    } else if (obj.type === 'image') {
      fields.push({
        name: obj.name || `image_${fields.length}`,
        type: 'image',
        position: {
          x: obj.left || 0,
          y: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
        },
      });
    }
  });
  
  return { fields };
};

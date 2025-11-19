/**
 * Template Builder Utilities
 * Provides helper functions for HTML template builder, PDF mapper, and direct upload modes
 */

/**
 * Merge template variables with data (supports nested and conditional)
 * @param {String} htmlContent - HTML template content with {{variables}}
 * @param {Object} data - Data object to merge
 * @returns {String} - HTML with variables replaced
 */
exports.mergeTemplateVariables = (htmlContent, data) => {
  let result = htmlContent;
  
  // Replace {{variable}} with data values (supports dot notation)
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value || '');
  }
  
  // Handle nested variables (e.g., {{student.name}})
  const nestedRegex = /{{([^}]+)}}/g;
  result = result.replace(nestedRegex, (match, path) => {
    const keys = path.trim().split('.');
    let value = data;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return '';
    }
    return value || '';
  });
  
  // Clean up any remaining unmatched variables
  result = result.replace(/{{[^}]+}}/g, '');
  
  return result;
};

/**
 * Merge template with conditional logic and loops
 * @param {String} htmlContent - HTML template content
 * @param {Object} data - Data object to merge
 * @returns {String} - HTML with conditionals and loops processed
 */
exports.mergeTemplateAdvanced = (htmlContent, data) => {
  let result = htmlContent;
  
  // Process loops: {{#each items}}...{{/each}}
  const loopRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
  result = result.replace(loopRegex, (match, arrayName, content) => {
    const array = data[arrayName];
    if (!Array.isArray(array)) return '';
    
    return array.map((item, index) => {
      let itemContent = content;
      // Replace {{this}} with current item
      itemContent = itemContent.replace(/{{this}}/g, item);
      // Replace {{@index}} with current index
      itemContent = itemContent.replace(/{{@index}}/g, index);
      // Replace {{item.property}} with item properties
      for (const [key, value] of Object.entries(item)) {
        const regex = new RegExp(`{{this\\.${key}}}`, 'g');
        itemContent = itemContent.replace(regex, value || '');
      }
      return itemContent;
    }).join('');
  });
  
  // Process conditionals: {{#if condition}}...{{/if}}
  const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
  result = result.replace(ifRegex, (match, varName, content) => {
    return data[varName] ? content : '';
  });
  
  // Process if-else: {{#if condition}}...{{else}}...{{/if}}
  const ifElseRegex = /{{#if\s+(\w+)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g;
  result = result.replace(ifElseRegex, (match, varName, ifContent, elseContent) => {
    return data[varName] ? ifContent : elseContent;
  });
  
  // Finally, merge simple variables
  return exports.mergeTemplateVariables(result, data);
};

/**
 * Extract variables from HTML template (including nested)
 * @param {String} htmlContent - HTML template content
 * @returns {Array<String>} - Array of variable names
 */
exports.extractTemplateVariables = (htmlContent) => {
  const regex = /{{([^}]+)}}/g;
  const variables = new Set();
  let match;
  
  while ((match = regex.exec(htmlContent)) !== null) {
    const varName = match[1].trim();
    // Skip control structures
    if (!varName.startsWith('#') && !varName.startsWith('/') && varName !== 'else') {
      variables.add(varName);
    }
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
 * Generate field mapping configuration for PDF mapper (enhanced)
 * @param {Array} fields - Array of field definitions
 * @returns {Object} - Mapping configuration
 */
exports.generateFieldMapping = (fields) => {
  const mapping = {
    fields: [],
    metadata: {
      createdAt: new Date(),
      version: '2.0',
      features: ['conditionals', 'validation', 'computed'],
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
      validation: {
        required: field.required || false,
        minLength: field.minLength,
        maxLength: field.maxLength,
        pattern: field.pattern,
      },
      conditional: {
        show: field.showIf,
        hide: field.hideIf,
      },
      computed: field.computed || false,
      computeExpression: field.computeExpression,
      defaultValue: field.defaultValue || '',
    });
  });
  
  return mapping;
};

/**
 * Validate field mapping configuration (enhanced)
 * @param {Object} mappingConfig - Mapping configuration to validate
 * @returns {Object} - Validation result
 */
exports.validateFieldMapping = (mappingConfig) => {
  const errors = [];
  const warnings = [];
  
  if (!mappingConfig || typeof mappingConfig !== 'object') {
    errors.push('Invalid mapping configuration');
    return { isValid: false, errors, warnings };
  }
  
  if (!Array.isArray(mappingConfig.fields)) {
    errors.push('Fields must be an array');
    return { isValid: false, errors, warnings };
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
    
    // Validate field type
    const validTypes = ['text', 'image', 'qr', 'date', 'number', 'checkbox', 'dropdown'];
    if (field.type && !validTypes.includes(field.type)) {
      warnings.push(`Field '${field.name}' has unknown type '${field.type}'`);
    }
    
    // Validate computed fields
    if (field.computed && !field.computeExpression) {
      warnings.push(`Computed field '${field.name}' is missing computeExpression`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
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
 * Convert Fabric.js config to PDF-lib compatible format (enhanced)
 * @param {Object} fabricConfig - Fabric.js canvas configuration
 * @returns {Object} - PDF-lib compatible configuration
 */
exports.fabricToPDFConfig = (fabricConfig) => {
  if (!fabricConfig || !fabricConfig.objects) {
    return { fields: [] };
  }
  
  const fields = [];
  
  fabricConfig.objects.forEach(obj => {
    if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
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
        rotation: obj.angle || 0,
        opacity: obj.opacity !== undefined ? obj.opacity : 1,
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
        rotation: obj.angle || 0,
        opacity: obj.opacity !== undefined ? obj.opacity : 1,
      });
    } else if (obj.type === 'rect') {
      fields.push({
        name: obj.name || `rect_${fields.length}`,
        type: 'shape',
        shape: 'rectangle',
        position: {
          x: obj.left || 0,
          y: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
        },
        style: {
          fill: obj.fill || 'transparent',
          stroke: obj.stroke || '#000000',
          strokeWidth: obj.strokeWidth || 1,
        },
        rotation: obj.angle || 0,
        opacity: obj.opacity !== undefined ? obj.opacity : 1,
      });
    } else if (obj.type === 'circle') {
      fields.push({
        name: obj.name || `circle_${fields.length}`,
        type: 'shape',
        shape: 'circle',
        position: {
          x: obj.left || 0,
          y: obj.top || 0,
          radius: obj.radius || 50,
        },
        style: {
          fill: obj.fill || 'transparent',
          stroke: obj.stroke || '#000000',
          strokeWidth: obj.strokeWidth || 1,
        },
        rotation: obj.angle || 0,
        opacity: obj.opacity !== undefined ? obj.opacity : 1,
      });
    } else if (obj.type === 'line') {
      fields.push({
        name: obj.name || `line_${fields.length}`,
        type: 'shape',
        shape: 'line',
        position: {
          x1: obj.x1 || 0,
          y1: obj.y1 || 0,
          x2: obj.x2 || 100,
          y2: obj.y2 || 100,
        },
        style: {
          stroke: obj.stroke || '#000000',
          strokeWidth: obj.strokeWidth || 1,
        },
      });
    }
  });
  
  return { fields };
};

/**
 * Calculate field value from expression
 * @param {String} expression - Compute expression
 * @param {Object} data - Data context
 * @returns {Any} - Computed value
 */
exports.computeFieldValue = (expression, data) => {
  try {
    // Simple expression evaluation (can be extended)
    // Supports basic arithmetic and string concatenation
    let result = expression;
    
    // Replace variables with values
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      if (typeof value === 'string') {
        result = result.replace(regex, `"${value}"`);
      } else {
        result = result.replace(regex, value);
      }
    }
    
    // Evaluate the expression (use with caution in production)
    // In production, use a safe expression evaluator
    return eval(result);
  } catch (error) {
    console.error('Error computing field value:', error);
    return '';
  }
};

/**
 * Apply conditional visibility
 * @param {Object} field - Field configuration
 * @param {Object} data - Data context
 * @returns {Boolean} - Whether field should be visible
 */
exports.shouldShowField = (field, data) => {
  if (!field.conditional) return true;
  
  // Check show condition
  if (field.conditional.show) {
    const showVar = field.conditional.show;
    return !!data[showVar];
  }
  
  // Check hide condition
  if (field.conditional.hide) {
    const hideVar = field.conditional.hide;
    return !data[hideVar];
  }
  
  return true;
};

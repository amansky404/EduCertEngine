const csvtojson = require('csvtojson');
const fs = require('fs').promises;

/**
 * Parse CSV file and extract data
 * @param {String} filePath - Path to CSV file
 * @returns {Promise<Array>} - Array of objects
 */
exports.parseCSV = async (filePath) => {
  try {
    const jsonArray = await csvtojson().fromFile(filePath);
    return jsonArray;
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error('Failed to parse CSV file');
  }
};

/**
 * Validate CSV data against template fields
 * @param {Array} data - CSV data array
 * @param {Object} template - Template with field definitions
 * @returns {Object} - Validation result
 */
exports.validateCSVData = (data, template) => {
  const errors = [];
  const requiredFields = template.fields
    .filter(f => f.required)
    .map(f => f.name);
  
  // Check if data is empty
  if (!data || data.length === 0) {
    return {
      isValid: false,
      errors: ['CSV file is empty'],
    };
  }
  
  // Get CSV headers from first row
  const csvHeaders = Object.keys(data[0]);
  
  // Check for missing required fields
  const missingFields = requiredFields.filter(field => !csvHeaders.includes(field));
  
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Validate each row
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Row ${index + 2}: Missing value for required field '${field}'`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    totalRows: data.length,
  };
};

/**
 * Map CSV row to certificate field data
 * @param {Object} row - CSV row data
 * @param {Object} template - Template with field definitions
 * @returns {Map} - Field data map
 */
exports.mapCSVRowToFields = (row, template) => {
  const fieldData = new Map();
  
  template.fields.forEach(field => {
    if (row[field.name] !== undefined) {
      fieldData.set(field.name, row[field.name]);
    } else if (field.defaultValue) {
      fieldData.set(field.name, field.defaultValue);
    }
  });
  
  return fieldData;
};

/**
 * Generate sample CSV template
 * @param {Object} template - Template with field definitions
 * @returns {String} - CSV string
 */
exports.generateCSVTemplate = (template) => {
  const headers = template.fields.map(f => f.name);
  const sampleRow = template.fields.map(f => f.defaultValue || '');
  
  return `${headers.join(',')}\n${sampleRow.join(',')}\n`;
};

const Template = require('../models/Template');
const path = require('path');
const fs = require('fs').promises;
const {
  mergeTemplateVariables,
  extractTemplateVariables,
  validateTemplateHTML,
  generateFieldMapping,
  validateFieldMapping,
  fabricToPDFConfig,
} = require('../utils/templateBuilder');

// @desc    Create new template
// @route   POST /api/templates
// @access  Private/Admin
exports.createTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      university: req.user.university,
      createdBy: req.user._id,
    };

    const template = await Template.create(templateData);

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all templates for university
// @route   GET /api/templates
// @access  Private
exports.getTemplates = async (req, res) => {
  try {
    const query = { university: req.user.university };
    
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.isActive) {
      query.isActive = req.query.isActive === 'true';
    }

    const templates = await Template.find(query)
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Private
exports.getTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Check if user has access to this template
    if (template.university.toString() !== req.user.university.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this template',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private/Admin
exports.updateTemplate = async (req, res) => {
  try {
    let template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Check if user has access to this template
    if (template.university.toString() !== req.user.university.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this template',
      });
    }

    // Increment version if fields are modified
    if (req.body.fields) {
      req.body.version = template.version + 1;
    }

    template = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private/Admin
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Check if user has access to this template
    if (template.university.toString() !== req.user.university.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this template',
      });
    }

    await template.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload template background
// @route   POST /api/templates/:id/upload-background
// @access  Private/Admin
exports.uploadBackground = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    if (!req.files || !req.files.background) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const file = req.files.background;
    const uploadDir = path.join(process.cwd(), 'public', 'templates', template._id.toString());
    
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, file.name);
    await file.mv(filePath);

    const relativePath = `/templates/${template._id}/${file.name}`;

    // Update template based on file type
    if (file.mimetype === 'application/pdf') {
      template.backgroundPDF = relativePath;
    } else {
      template.backgroundImage = relativePath;
    }

    await template.save();

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Validate HTML template
// @route   POST /api/templates/validate-html
// @access  Private/Admin
exports.validateHTML = async (req, res) => {
  try {
    const { htmlContent } = req.body;

    if (!htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'HTML content is required',
      });
    }

    const validation = validateTemplateHTML(htmlContent);
    const variables = extractTemplateVariables(htmlContent);

    res.json({
      success: true,
      data: {
        ...validation,
        variables,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Preview template with sample data
// @route   POST /api/templates/:id/preview
// @access  Private
exports.previewTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    const { sampleData } = req.body;

    // For HTML templates
    if (template.type === 'certificate' && template.backgroundImage) {
      // Generate preview HTML
      const previewHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { margin: 0; padding: 20px; }
            .preview-container {
              width: ${template.dimensions.width}px;
              height: ${template.dimensions.height}px;
              position: relative;
              background: url('${template.backgroundImage}') no-repeat center center;
              background-size: cover;
              border: 1px solid #ccc;
            }
            .field {
              position: absolute;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            ${template.fields.map(field => {
              const value = sampleData[field.name] || field.defaultValue || `[${field.name}]`;
              return `
                <div class="field" style="
                  left: ${field.position.x}px;
                  top: ${field.position.y}px;
                  font-size: ${field.style?.fontSize || 12}px;
                  font-weight: ${field.style?.fontWeight || 'normal'};
                  color: ${field.style?.color || '#000000'};
                  text-align: ${field.style?.align || 'left'};
                ">${value}</div>
              `;
            }).join('')}
          </div>
        </body>
        </html>
      `;

      res.json({
        success: true,
        data: {
          html: previewHTML,
          type: 'html',
        },
      });
    } else {
      // For other template types, return field data
      res.json({
        success: true,
        data: {
          template,
          sampleData,
          type: 'fields',
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Convert Fabric.js config to template
// @route   POST /api/templates/fabric-to-template
// @access  Private/Admin
exports.fabricToTemplate = async (req, res) => {
  try {
    const { fabricConfig, templateId } = req.body;

    if (!fabricConfig) {
      return res.status(400).json({
        success: false,
        message: 'Fabric.js configuration is required',
      });
    }

    const pdfConfig = fabricToPDFConfig(fabricConfig);

    if (templateId) {
      // Update existing template
      const template = await Template.findByIdAndUpdate(
        templateId,
        {
          fields: pdfConfig.fields,
          version: { $inc: 1 },
        },
        { new: true }
      );

      res.json({
        success: true,
        data: template,
      });
    } else {
      // Return converted config for preview
      res.json({
        success: true,
        data: pdfConfig,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate field mapping template
// @route   POST /api/templates/generate-mapping
// @access  Private/Admin
exports.generateMapping = async (req, res) => {
  try {
    const { fields } = req.body;

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: 'Fields array is required',
      });
    }

    const mapping = generateFieldMapping(fields);
    const validation = validateFieldMapping(mapping);

    res.json({
      success: true,
      data: {
        mapping,
        validation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Clone template
// @route   POST /api/templates/:id/clone
// @access  Private/Admin
exports.cloneTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Create clone
    const clonedData = template.toObject();
    delete clonedData._id;
    delete clonedData.createdAt;
    delete clonedData.updatedAt;
    
    clonedData.name = `${clonedData.name} (Copy)`;
    clonedData.createdBy = req.user._id;
    clonedData.version = 1;

    const clonedTemplate = await Template.create(clonedData);

    res.status(201).json({
      success: true,
      data: clonedTemplate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


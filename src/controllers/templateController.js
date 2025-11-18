const Template = require('../models/Template');
const path = require('path');
const fs = require('fs').promises;

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

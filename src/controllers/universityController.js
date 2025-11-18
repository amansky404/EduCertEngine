const University = require('../models/University');

// @desc    Create new university
// @route   POST /api/universities
// @access  Private/Superadmin
exports.createUniversity = async (req, res) => {
  try {
    const university = await University.create(req.body);

    res.status(201).json({
      success: true,
      data: university,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all universities
// @route   GET /api/universities
// @access  Private/Superadmin
exports.getUniversities = async (req, res) => {
  try {
    const universities = await University.find().populate('admins', 'name email');

    res.json({
      success: true,
      count: universities.length,
      data: universities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single university
// @route   GET /api/universities/:id
// @access  Private
exports.getUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id).populate('admins', 'name email');

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

    res.json({
      success: true,
      data: university,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update university
// @route   PUT /api/universities/:id
// @access  Private/Admin
exports.updateUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

    res.json({
      success: true,
      data: university,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete university
// @route   DELETE /api/universities/:id
// @access  Private/Superadmin
exports.deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

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

// @desc    Get university by subdomain
// @route   GET /api/universities/subdomain/:subdomain
// @access  Public
exports.getUniversityBySubdomain = async (req, res) => {
  try {
    const university = await University.findOne({ 
      subdomain: req.params.subdomain,
      isActive: true,
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

    res.json({
      success: true,
      data: university,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

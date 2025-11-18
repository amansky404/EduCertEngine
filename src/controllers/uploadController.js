const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// @desc    Upload file
// @route   POST /api/upload
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const file = req.files.file;
    const { folder = 'uploads', universityId } = req.body;

    // Validate file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size must be less than ${maxSize / 1024 / 1024}MB`,
      });
    }

    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/zip',
      'text/html',
      'text/csv',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Allowed: JPEG, PNG, GIF, PDF, ZIP, HTML, CSV',
      });
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const randomName = crypto.randomBytes(16).toString('hex');
    const filename = `${randomName}${ext}`;

    // Create upload directory
    const uploadPath = path.join(process.cwd(), 'public', folder, universityId || 'general');
    await fs.mkdir(uploadPath, { recursive: true });

    // Move file
    const filePath = path.join(uploadPath, filename);
    await file.mv(filePath);

    // Return file info
    const fileUrl = `/${folder}/${universityId || 'general'}/${filename}`;

    res.status(201).json({
      success: true,
      data: {
        filename,
        originalName: file.name,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        path: filePath,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file',
    });
  }
};

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || !req.files.files) {
      return res.status(400).json({
        success: false,
        message: 'Please upload files',
      });
    }

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const { folder = 'uploads', universityId } = req.body;

    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
    const uploadedFiles = [];

    for (const file of files) {
      // Validate file size
      if (file.size > maxSize) {
        continue; // Skip files that are too large
      }

      // Generate unique filename
      const ext = path.extname(file.name);
      const randomName = crypto.randomBytes(16).toString('hex');
      const filename = `${randomName}${ext}`;

      // Create upload directory
      const uploadPath = path.join(process.cwd(), 'public', folder, universityId || 'general');
      await fs.mkdir(uploadPath, { recursive: true });

      // Move file
      const filePath = path.join(uploadPath, filename);
      await file.mv(filePath);

      const fileUrl = `/${folder}/${universityId || 'general'}/${filename}`;

      uploadedFiles.push({
        filename,
        originalName: file.name,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
      });
    }

    res.status(201).json({
      success: true,
      count: uploadedFiles.length,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload files',
    });
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
exports.deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const { folder = 'uploads', universityId } = req.query;

    const filePath = path.join(
      process.cwd(),
      'public',
      folder,
      universityId || 'general',
      filename
    );

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Delete file
    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete file',
    });
  }
};

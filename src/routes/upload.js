const express = require('express');
const router = express.Router();
const {
  uploadFile,
  uploadMultiple,
  deleteFile,
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.post('/', protect, authorize('admin', 'staff', 'superadmin'), uploadLimiter, uploadFile);
router.post('/multiple', protect, authorize('admin', 'superadmin'), uploadLimiter, uploadMultiple);
router.delete('/:filename', protect, authorize('admin', 'superadmin'), deleteFile);

module.exports = router;

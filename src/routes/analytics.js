const express = require('express');
const router = express.Router();
const {
  getUniversityStats,
  getSystemStats,
  getTemplateStats,
  getDownloadStats,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/university', protect, authorize('admin', 'superadmin'), getUniversityStats);
router.get('/system', protect, authorize('superadmin'), getSystemStats);
router.get('/template/:id', protect, getTemplateStats);
router.get('/downloads', protect, authorize('admin', 'superadmin'), getDownloadStats);

module.exports = router;

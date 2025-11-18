const express = require('express');
const router = express.Router();
const {
  advancedCertificateSearch,
  advancedStudentSearch,
  getCertificateStats,
  exportCertificates,
  bulkUpdate,
} = require('../controllers/searchController');
const { protect, authorize } = require('../middleware/auth');

router.post('/certificates', protect, advancedCertificateSearch);
router.post('/students', protect, advancedStudentSearch);
router.post('/certificates/stats', protect, authorize('admin', 'superadmin'), getCertificateStats);
router.post('/certificates/export', protect, authorize('admin', 'superadmin'), exportCertificates);
router.post('/certificates/bulk-update', protect, authorize('admin', 'superadmin'), bulkUpdate);

module.exports = router;

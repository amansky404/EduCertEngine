const express = require('express');
const router = express.Router();
const {
  createCertificate,
  generateCertificatePDF,
  bulkImport,
  getCertificates,
  getCertificate,
  searchCertificates,
  verifyCertificate,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getCertificates)
  .post(protect, authorize('admin', 'staff', 'superadmin'), createCertificate);

router.post('/bulk-import', protect, authorize('admin', 'superadmin'), bulkImport);
router.get('/search', searchCertificates);
router.get('/verify/:code', verifyCertificate);

router
  .route('/:id')
  .get(protect, getCertificate);

router.post('/:id/generate', protect, authorize('admin', 'staff', 'superadmin'), generateCertificatePDF);

module.exports = router;

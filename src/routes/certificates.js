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
  downloadCertificate,
  batchGenerate,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');
const { uploadLimiter, generateLimiter, verificationLimiter } = require('../middleware/rateLimiter');

router
  .route('/')
  .get(protect, getCertificates)
  .post(protect, authorize('admin', 'staff', 'superadmin'), createCertificate);

router.post('/bulk-import', protect, authorize('admin', 'superadmin'), uploadLimiter, bulkImport);
router.post('/batch-generate', protect, authorize('admin', 'superadmin'), generateLimiter, batchGenerate);
router.get('/search', verificationLimiter, searchCertificates);
router.get('/verify/:code', verificationLimiter, verifyCertificate);

router
  .route('/:id')
  .get(protect, getCertificate);

router.get('/:id/download', downloadCertificate);
router.post('/:id/generate', protect, authorize('admin', 'staff', 'superadmin'), generateLimiter, generateCertificatePDF);

module.exports = router;

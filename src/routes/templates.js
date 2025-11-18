const express = require('express');
const router = express.Router();
const {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  uploadBackground,
  validateHTML,
  previewTemplate,
  fabricToTemplate,
  generateMapping,
  cloneTemplate,
} = require('../controllers/templateController');
const { protect, authorize } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');

router
  .route('/')
  .get(protect, getTemplates)
  .post(protect, authorize('admin', 'superadmin'), createTemplate);

// Template utility endpoints
router.post('/validate-html', protect, authorize('admin', 'superadmin'), validateHTML);
router.post('/fabric-to-template', protect, authorize('admin', 'superadmin'), fabricToTemplate);
router.post('/generate-mapping', protect, authorize('admin', 'superadmin'), generateMapping);

router
  .route('/:id')
  .get(protect, getTemplate)
  .put(protect, authorize('admin', 'superadmin'), updateTemplate)
  .delete(protect, authorize('admin', 'superadmin'), deleteTemplate);

router.post('/:id/upload-background', protect, authorize('admin', 'superadmin'), uploadLimiter, uploadBackground);
router.post('/:id/preview', protect, previewTemplate);
router.post('/:id/clone', protect, authorize('admin', 'superadmin'), cloneTemplate);

module.exports = router;

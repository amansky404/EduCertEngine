const express = require('express');
const router = express.Router();
const {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  uploadBackground,
} = require('../controllers/templateController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getTemplates)
  .post(protect, authorize('admin', 'superadmin'), createTemplate);

router
  .route('/:id')
  .get(protect, getTemplate)
  .put(protect, authorize('admin', 'superadmin'), updateTemplate)
  .delete(protect, authorize('admin', 'superadmin'), deleteTemplate);

router.post('/:id/upload-background', protect, authorize('admin', 'superadmin'), uploadBackground);

module.exports = router;

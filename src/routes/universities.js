const express = require('express');
const router = express.Router();
const {
  createUniversity,
  getUniversities,
  getUniversity,
  updateUniversity,
  deleteUniversity,
  getUniversityBySubdomain,
} = require('../controllers/universityController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('superadmin'), getUniversities)
  .post(protect, authorize('superadmin'), createUniversity);

router.get('/subdomain/:subdomain', getUniversityBySubdomain);

router
  .route('/:id')
  .get(protect, getUniversity)
  .put(protect, authorize('superadmin', 'admin'), updateUniversity)
  .delete(protect, authorize('superadmin'), deleteUniversity);

module.exports = router;

const {
  getUniversityAnalytics,
  getSystemAnalytics,
  getTemplateAnalytics,
  getDownloadTrends,
} = require('../utils/analytics');

// @desc    Get university analytics
// @route   GET /api/analytics/university
// @access  Private/Admin
exports.getUniversityStats = async (req, res) => {
  try {
    const analytics = await getUniversityAnalytics(req.user.university);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get system-wide analytics
// @route   GET /api/analytics/system
// @access  Private/Superadmin
exports.getSystemStats = async (req, res) => {
  try {
    const analytics = await getSystemAnalytics();

    res.json(analytics);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get template analytics
// @route   GET /api/analytics/template/:id
// @access  Private
exports.getTemplateStats = async (req, res) => {
  try {
    const analytics = await getTemplateAnalytics(req.params.id);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get download trends
// @route   GET /api/analytics/downloads
// @access  Private/Admin
exports.getDownloadStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const trends = await getDownloadTrends(req.user.university, days);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

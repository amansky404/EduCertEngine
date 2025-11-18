const Certificate = require('../models/Certificate');
const Template = require('../models/Template');
const University = require('../models/University');

/**
 * Get university analytics
 * @param {String} universityId - University ID
 * @returns {Promise<Object>} - Analytics data
 */
exports.getUniversityAnalytics = async (universityId) => {
  try {
    const [
      totalCertificates,
      issuedCertificates,
      draftCertificates,
      revokedCertificates,
      totalTemplates,
      activeTemplates,
      totalDownloads,
      recentCertificates,
    ] = await Promise.all([
      Certificate.countDocuments({ university: universityId }),
      Certificate.countDocuments({ university: universityId, status: 'issued' }),
      Certificate.countDocuments({ university: universityId, status: 'draft' }),
      Certificate.countDocuments({ university: universityId, status: 'revoked' }),
      Template.countDocuments({ university: universityId }),
      Template.countDocuments({ university: universityId, isActive: true }),
      Certificate.aggregate([
        { $match: { university: universityId } },
        { $group: { _id: null, total: { $sum: '$downloadCount' } } },
      ]),
      Certificate.find({ university: universityId })
        .sort('-createdAt')
        .limit(10)
        .select('certificateNumber studentInfo status createdAt'),
    ]);

    // Certificates by status
    const certificatesByStatus = {
      draft: draftCertificates,
      issued: issuedCertificates,
      revoked: revokedCertificates,
      total: totalCertificates,
    };

    // Templates summary
    const templatesSummary = {
      total: totalTemplates,
      active: activeTemplates,
      inactive: totalTemplates - activeTemplates,
    };

    // Download statistics
    const downloadStats = {
      total: totalDownloads[0]?.total || 0,
      average: totalCertificates > 0 ? Math.round((totalDownloads[0]?.total || 0) / totalCertificates) : 0,
    };

    // Certificates by month (last 12 months)
    const certificatesByMonth = await getCertificatesByMonth(universityId, 12);

    // Most downloaded certificates
    const mostDownloaded = await Certificate.find({ university: universityId })
      .sort('-downloadCount')
      .limit(10)
      .select('certificateNumber studentInfo downloadCount');

    return {
      success: true,
      data: {
        overview: {
          totalCertificates,
          certificatesByStatus,
          templatesSummary,
          downloadStats,
        },
        trends: {
          certificatesByMonth,
        },
        recent: {
          certificates: recentCertificates,
          mostDownloaded,
        },
      },
    };
  } catch (error) {
    throw new Error(`Failed to get analytics: ${error.message}`);
  }
};

/**
 * Get system-wide analytics (for super admin)
 * @returns {Promise<Object>} - System analytics
 */
exports.getSystemAnalytics = async () => {
  try {
    const [
      totalUniversities,
      activeUniversities,
      totalCertificates,
      totalTemplates,
      universitiesWithStats,
    ] = await Promise.all([
      University.countDocuments(),
      University.countDocuments({ isActive: true }),
      Certificate.countDocuments(),
      Template.countDocuments(),
      University.aggregate([
        {
          $lookup: {
            from: 'certificates',
            localField: '_id',
            foreignField: 'university',
            as: 'certificates',
          },
        },
        {
          $project: {
            name: 1,
            subdomain: 1,
            certificateCount: { $size: '$certificates' },
            isActive: 1,
          },
        },
        { $sort: { certificateCount: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // Certificates by status across all universities
    const certificatesByStatus = await Certificate.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Growth over time (last 12 months)
    const growthData = await getSystemGrowth(12);

    return {
      success: true,
      data: {
        overview: {
          totalUniversities,
          activeUniversities,
          inactiveUniversities: totalUniversities - activeUniversities,
          totalCertificates,
          totalTemplates,
        },
        certificatesByStatus: certificatesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topUniversities: universitiesWithStats,
        growth: growthData,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get system analytics: ${error.message}`);
  }
};

/**
 * Get certificates by month
 * @param {String} universityId - University ID
 * @param {Number} months - Number of months
 * @returns {Promise<Array>} - Monthly data
 */
async function getCertificatesByMonth(universityId, months = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const data = await Certificate.aggregate([
    {
      $match: {
        university: universityId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Format data
  return data.map(item => ({
    year: item._id.year,
    month: item._id.month,
    monthName: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
    count: item.count,
  }));
}

/**
 * Get system growth data
 * @param {Number} months - Number of months
 * @returns {Promise<Object>} - Growth data
 */
async function getSystemGrowth(months = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const [universities, certificates] = await Promise.all([
    University.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Certificate.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  return {
    universities: universities.map(item => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count,
    })),
    certificates: certificates.map(item => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count,
    })),
  };
}

/**
 * Get template analytics
 * @param {String} templateId - Template ID
 * @returns {Promise<Object>} - Template analytics
 */
exports.getTemplateAnalytics = async (templateId) => {
  try {
    const template = await Template.findById(templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    const [
      totalCertificates,
      issuedCertificates,
      totalDownloads,
      recentCertificates,
    ] = await Promise.all([
      Certificate.countDocuments({ template: templateId }),
      Certificate.countDocuments({ template: templateId, status: 'issued' }),
      Certificate.aggregate([
        { $match: { template: templateId } },
        { $group: { _id: null, total: { $sum: '$downloadCount' } } },
      ]),
      Certificate.find({ template: templateId })
        .sort('-createdAt')
        .limit(5)
        .select('certificateNumber studentInfo status createdAt'),
    ]);

    return {
      success: true,
      data: {
        template: {
          id: template._id,
          name: template.name,
          type: template.type,
          version: template.version,
          isActive: template.isActive,
        },
        usage: {
          totalCertificates,
          issuedCertificates,
          totalDownloads: totalDownloads[0]?.total || 0,
        },
        recent: recentCertificates,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get template analytics: ${error.message}`);
  }
};

/**
 * Get certificate download trends
 * @param {String} universityId - University ID
 * @param {Number} days - Number of days
 * @returns {Promise<Array>} - Download trends
 */
exports.getDownloadTrends = async (universityId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const downloads = await Certificate.aggregate([
    {
      $match: {
        university: universityId,
        lastDownloadedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$lastDownloadedAt' },
          month: { $month: '$lastDownloadedAt' },
          day: { $dayOfMonth: '$lastDownloadedAt' },
        },
        count: { $sum: '$downloadCount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  return downloads.map(item => ({
    date: new Date(item._id.year, item._id.month - 1, item._id.day),
    count: item.count,
  }));
};

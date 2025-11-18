const Certificate = require('../models/Certificate');
const Student = require('../models/Student');

/**
 * Advanced search for certificates
 * @param {Object} filters - Search filters
 * @param {String} universityId - University ID
 * @returns {Promise<Object>} - Search results
 */
exports.searchCertificates = async (filters, universityId) => {
  try {
    const query = { university: universityId };

    // Status filter
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    // Template filter
    if (filters.templateId) {
      query.template = filters.templateId;
    }

    // Batch filter
    if (filters.batchId) {
      query.batchId = filters.batchId;
    }

    // Text search (student name, roll number, certificate number)
    if (filters.searchText) {
      query.$or = [
        { 'studentInfo.name': { $regex: filters.searchText, $options: 'i' } },
        { 'studentInfo.rollNumber': { $regex: filters.searchText, $options: 'i' } },
        { certificateNumber: { $regex: filters.searchText, $options: 'i' } },
      ];
    }

    // Course filter
    if (filters.courseName) {
      query['courseInfo.courseName'] = { $regex: filters.courseName, $options: 'i' };
    }

    // Grade filter
    if (filters.grade) {
      query['courseInfo.grade'] = filters.grade;
    }

    // Download count filter
    if (filters.minDownloads !== undefined) {
      query.downloadCount = { $gte: parseInt(filters.minDownloads) };
    }

    // Sorting
    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    // Execute query
    const [certificates, total] = await Promise.all([
      Certificate.find(query)
        .populate('template', 'name type')
        .populate('generatedBy', 'name email')
        .sort(sort)
        .limit(limit)
        .skip(skip),
      Certificate.countDocuments(query),
    ]);

    return {
      success: true,
      data: {
        certificates,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
        filters: filters,
      },
    };
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
};

/**
 * Advanced search for students
 * @param {Object} filters - Search filters
 * @param {String} universityId - University ID
 * @returns {Promise<Object>} - Search results
 */
exports.searchStudents = async (filters, universityId) => {
  try {
    const query = { university: universityId };

    // Text search
    if (filters.searchText) {
      query.$or = [
        { name: { $regex: filters.searchText, $options: 'i' } },
        { rollNumber: { $regex: filters.searchText, $options: 'i' } },
        { email: { $regex: filters.searchText, $options: 'i' } },
        { mobile: { $regex: filters.searchText, $options: 'i' } },
      ];
    }

    // Date of birth filter
    if (filters.dob) {
      query.dob = new Date(filters.dob);
    }

    // Email filter
    if (filters.email) {
      query.email = { $regex: filters.email, $options: 'i' };
    }

    // Mobile filter
    if (filters.mobile) {
      query.mobile = { $regex: filters.mobile, $options: 'i' };
    }

    // Created date range
    if (filters.createdFrom || filters.createdTo) {
      query.createdAt = {};
      if (filters.createdFrom) {
        query.createdAt.$gte = new Date(filters.createdFrom);
      }
      if (filters.createdTo) {
        query.createdAt.$lte = new Date(filters.createdTo);
      }
    }

    // Sorting
    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    // Execute query
    const [students, total] = await Promise.all([
      Student.find(query)
        .sort(sort)
        .limit(limit)
        .skip(skip),
      Student.countDocuments(query),
    ]);

    return {
      success: true,
      data: {
        students,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
        filters: filters,
      },
    };
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
};

/**
 * Get certificate statistics by filters
 * @param {Object} filters - Search filters
 * @param {String} universityId - University ID
 * @returns {Promise<Object>} - Statistics
 */
exports.getCertificateStatistics = async (filters, universityId) => {
  try {
    const query = { university: universityId };

    // Apply same filters as search
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    if (filters.templateId) {
      query.template = filters.templateId;
    }

    // Get statistics
    const [
      total,
      byStatus,
      byTemplate,
      totalDownloads,
    ] = await Promise.all([
      Certificate.countDocuments(query),
      Certificate.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Certificate.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'templates',
            localField: 'template',
            foreignField: '_id',
            as: 'templateInfo',
          },
        },
        { $unwind: '$templateInfo' },
        {
          $group: {
            _id: '$template',
            name: { $first: '$templateInfo.name' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Certificate.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$downloadCount' } } },
      ]),
    ]);

    return {
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byTemplate: byTemplate,
        totalDownloads: totalDownloads[0]?.total || 0,
        averageDownloads: total > 0 ? Math.round((totalDownloads[0]?.total || 0) / total) : 0,
      },
    };
  } catch (error) {
    throw new Error(`Statistics failed: ${error.message}`);
  }
};

/**
 * Export certificates to CSV format
 * @param {Object} filters - Search filters
 * @param {String} universityId - University ID
 * @returns {Promise<String>} - CSV string
 */
exports.exportCertificatesToCSV = async (filters, universityId) => {
  try {
    const searchResult = await exports.searchCertificates(
      { ...filters, limit: 10000 }, // Export limit
      universityId
    );

    const certificates = searchResult.data.certificates;

    // CSV headers
    const headers = [
      'Certificate Number',
      'Student Name',
      'Roll Number',
      'Email',
      'Course Name',
      'Grade',
      'Issue Date',
      'Status',
      'Downloads',
      'Template',
    ];

    // CSV rows
    const rows = certificates.map(cert => [
      cert.certificateNumber,
      cert.studentInfo.name,
      cert.studentInfo.rollNumber || '',
      cert.studentInfo.email || '',
      cert.courseInfo?.courseName || '',
      cert.courseInfo?.grade || '',
      cert.courseInfo?.issueDate ? new Date(cert.courseInfo.issueDate).toISOString().split('T')[0] : '',
      cert.status,
      cert.downloadCount,
      cert.template?.name || '',
    ]);

    // Generate CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return {
      success: true,
      data: csvContent,
      count: certificates.length,
    };
  } catch (error) {
    throw new Error(`Export failed: ${error.message}`);
  }
};

/**
 * Bulk update certificates
 * @param {Array} certificateIds - Array of certificate IDs
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Update result
 */
exports.bulkUpdateCertificates = async (certificateIds, updates) => {
  try {
    // Validate update fields (only allow certain fields)
    const allowedFields = ['status', 'notes'];
    const updateData = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    const result = await Certificate.updateMany(
      { _id: { $in: certificateIds } },
      { $set: updateData }
    );

    return {
      success: true,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    };
  } catch (error) {
    throw new Error(`Bulk update failed: ${error.message}`);
  }
};

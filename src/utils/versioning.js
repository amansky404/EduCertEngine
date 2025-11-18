const Certificate = require('../models/Certificate');

/**
 * Create a new version of a certificate
 * @param {String} certificateId - Original certificate ID
 * @param {Object} updates - Updated field data
 * @param {Object} user - User making the update
 * @returns {Promise<Object>} - New certificate version
 */
exports.createCertificateVersion = async (certificateId, updates, user) => {
  try {
    const originalCertificate = await Certificate.findById(certificateId);

    if (!originalCertificate) {
      throw new Error('Certificate not found');
    }

    // Create new version
    const newVersion = await Certificate.create({
      university: originalCertificate.university,
      template: originalCertificate.template,
      certificateNumber: `${originalCertificate.certificateNumber}-v${Date.now()}`,
      studentInfo: {
        ...originalCertificate.studentInfo,
        ...updates.studentInfo,
      },
      courseInfo: {
        ...originalCertificate.courseInfo,
        ...updates.courseInfo,
      },
      fieldData: new Map([
        ...originalCertificate.fieldData,
        ...Object.entries(updates.fieldData || {}),
      ]),
      status: 'draft',
      generatedBy: user._id,
      notes: `Version of certificate ${originalCertificate.certificateNumber}`,
    });

    // Update original certificate to reference new version
    originalCertificate.notes = `${originalCertificate.notes || ''}\nNew version created: ${newVersion.certificateNumber}`;
    await originalCertificate.save();

    return {
      success: true,
      data: {
        original: originalCertificate,
        newVersion,
      },
    };
  } catch (error) {
    throw new Error(`Failed to create version: ${error.message}`);
  }
};

/**
 * Get certificate version history
 * @param {String} certificateNumber - Certificate number (base)
 * @returns {Promise<Array>} - Version history
 */
exports.getCertificateVersions = async (certificateNumber) => {
  try {
    // Extract base certificate number (without version suffix)
    const baseCertNumber = certificateNumber.split('-v')[0];

    // Find all versions
    const versions = await Certificate.find({
      certificateNumber: new RegExp(`^${baseCertNumber}`),
    })
      .sort('createdAt')
      .select('certificateNumber status createdAt generatedBy notes');

    return {
      success: true,
      data: {
        baseCertificate: baseCertNumber,
        versions,
        count: versions.length,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get versions: ${error.message}`);
  }
};

/**
 * Compare two certificate versions
 * @param {String} version1Id - First certificate ID
 * @param {String} version2Id - Second certificate ID
 * @returns {Promise<Object>} - Comparison result
 */
exports.compareCertificateVersions = async (version1Id, version2Id) => {
  try {
    const [cert1, cert2] = await Promise.all([
      Certificate.findById(version1Id),
      Certificate.findById(version2Id),
    ]);

    if (!cert1 || !cert2) {
      throw new Error('One or both certificates not found');
    }

    const differences = {
      studentInfo: findDifferences(cert1.studentInfo, cert2.studentInfo),
      courseInfo: findDifferences(cert1.courseInfo, cert2.courseInfo),
      fieldData: findMapDifferences(cert1.fieldData, cert2.fieldData),
      status: cert1.status !== cert2.status ? {
        old: cert1.status,
        new: cert2.status,
      } : null,
    };

    return {
      success: true,
      data: {
        version1: {
          id: cert1._id,
          certificateNumber: cert1.certificateNumber,
          createdAt: cert1.createdAt,
        },
        version2: {
          id: cert2._id,
          certificateNumber: cert2.certificateNumber,
          createdAt: cert2.createdAt,
        },
        differences,
      },
    };
  } catch (error) {
    throw new Error(`Failed to compare versions: ${error.message}`);
  }
};

/**
 * Restore a certificate to a previous version
 * @param {String} certificateId - Certificate to restore
 * @param {String} versionId - Version to restore from
 * @param {Object} user - User performing restore
 * @returns {Promise<Object>} - Restored certificate
 */
exports.restoreCertificateVersion = async (certificateId, versionId, user) => {
  try {
    const [currentCert, versionCert] = await Promise.all([
      Certificate.findById(certificateId),
      Certificate.findById(versionId),
    ]);

    if (!currentCert || !versionCert) {
      throw new Error('Certificate or version not found');
    }

    // Create backup of current state
    const backup = await exports.createCertificateVersion(
      certificateId,
      {
        studentInfo: currentCert.studentInfo,
        courseInfo: currentCert.courseInfo,
        fieldData: Object.fromEntries(currentCert.fieldData),
      },
      user
    );

    // Restore from version
    currentCert.studentInfo = versionCert.studentInfo;
    currentCert.courseInfo = versionCert.courseInfo;
    currentCert.fieldData = versionCert.fieldData;
    currentCert.notes = `${currentCert.notes || ''}\nRestored from version ${versionCert.certificateNumber} on ${new Date().toISOString()}`;
    currentCert.status = 'draft'; // Set to draft for review

    await currentCert.save();

    return {
      success: true,
      data: {
        restored: currentCert,
        backup: backup.data.newVersion,
      },
    };
  } catch (error) {
    throw new Error(`Failed to restore version: ${error.message}`);
  }
};

/**
 * Find differences between two objects
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {Object} - Differences
 */
function findDifferences(obj1, obj2) {
  const diffs = {};

  // Check all keys in obj1
  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) {
      diffs[key] = {
        old: obj1[key],
        new: obj2[key],
      };
    }
  }

  // Check for keys in obj2 that are not in obj1
  for (const key in obj2) {
    if (!(key in obj1)) {
      diffs[key] = {
        old: null,
        new: obj2[key],
      };
    }
  }

  return Object.keys(diffs).length > 0 ? diffs : null;
}

/**
 * Find differences between two Maps
 * @param {Map} map1 - First map
 * @param {Map} map2 - Second map
 * @returns {Object} - Differences
 */
function findMapDifferences(map1, map2) {
  const diffs = {};

  // Convert maps to objects for comparison
  const obj1 = Object.fromEntries(map1);
  const obj2 = Object.fromEntries(map2);

  return findDifferences(obj1, obj2);
}

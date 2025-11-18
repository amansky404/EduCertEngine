const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

/**
 * Generate QR code for certificate verification
 * @param {String} data - Data to encode in QR code
 * @param {String} certificateId - Certificate ID for filename
 * @returns {Promise<String>} - Path to generated QR code
 */
exports.generateQRCode = async (data, certificateId) => {
  try {
    const qrDir = path.join(process.cwd(), 'public', 'certificates', 'qr');
    
    // Ensure directory exists
    await fs.mkdir(qrDir, { recursive: true });
    
    const qrPath = path.join(qrDir, `${certificateId}.png`);
    
    // Generate QR code
    await QRCode.toFile(qrPath, data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return `/certificates/qr/${certificateId}.png`;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate verification URL for certificate
 * @param {String} verificationCode - Verification code
 * @param {String} subdomain - University subdomain
 * @returns {String} - Verification URL
 */
exports.generateVerificationURL = (verificationCode, subdomain) => {
  const baseDomain = process.env.BASE_DOMAIN || 'localhost:5000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  if (subdomain) {
    return `${protocol}://${subdomain}.${baseDomain}/verify/${verificationCode}`;
  }
  
  return `${protocol}://${baseDomain}/verify/${verificationCode}`;
};

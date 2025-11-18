/**
 * Email Notification Utilities
 * Provides email sending functionality for certificates and notifications
 */

/**
 * Send certificate notification email
 * Note: This is a placeholder implementation. In production, integrate with:
 * - SendGrid
 * - AWS SES
 * - Nodemailer with SMTP
 * - Other email service providers
 * 
 * @param {Object} options - Email options
 * @returns {Promise<Object>} - Send result
 */
exports.sendCertificateEmail = async (options) => {
  const {
    to,
    studentName,
    certificateNumber,
    universityName,
    downloadLink,
    verificationLink,
  } = options;

  // Prepare email content
  const emailContent = {
    to,
    subject: `Your Certificate from ${universityName}`,
    html: generateCertificateEmailHTML({
      studentName,
      certificateNumber,
      universityName,
      downloadLink,
      verificationLink,
    }),
  };

  // Log email for now (in production, actually send the email)
  console.log('Email to be sent:', emailContent);

  // Return success response
  return {
    success: true,
    message: 'Email sent successfully',
    data: {
      to,
      subject: emailContent.subject,
      sentAt: new Date(),
    },
  };

  // In production, use an email service:
  // const result = await emailService.send(emailContent);
  // return result;
};

/**
 * Send bulk certificate notification emails
 * @param {Array} recipients - Array of recipient objects
 * @returns {Promise<Object>} - Bulk send result
 */
exports.sendBulkCertificateEmails = async (recipients) => {
  const results = {
    success: [],
    failed: [],
    total: recipients.length,
  };

  for (const recipient of recipients) {
    try {
      await exports.sendCertificateEmail(recipient);
      results.success.push({
        email: recipient.to,
        certificateNumber: recipient.certificateNumber,
      });
    } catch (error) {
      results.failed.push({
        email: recipient.to,
        certificateNumber: recipient.certificateNumber,
        error: error.message,
      });
    }
  }

  return {
    success: true,
    data: results,
  };
};

/**
 * Send verification reminder email
 * @param {Object} options - Email options
 * @returns {Promise<Object>} - Send result
 */
exports.sendVerificationReminder = async (options) => {
  const { to, studentName, certificateNumber, verificationLink } = options;

  const emailContent = {
    to,
    subject: 'Verify Your Certificate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Certificate Verification Reminder</h2>
        <p>Dear ${studentName},</p>
        <p>This is a reminder to verify your certificate (${certificateNumber}).</p>
        <p>Click the link below to verify:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
          Verify Certificate
        </a>
        <p>If you have any questions, please contact us.</p>
      </div>
    `,
  };

  console.log('Verification reminder email:', emailContent);

  return {
    success: true,
    message: 'Verification reminder sent',
    data: { to, sentAt: new Date() },
  };
};

/**
 * Send admin notification email
 * @param {Object} options - Email options
 * @returns {Promise<Object>} - Send result
 */
exports.sendAdminNotification = async (options) => {
  const { to, subject, message, actionLink, actionText } = options;

  const emailContent = {
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>${message}</p>
        ${actionLink ? `
          <a href="${actionLink}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
            ${actionText || 'Take Action'}
          </a>
        ` : ''}
      </div>
    `,
  };

  console.log('Admin notification email:', emailContent);

  return {
    success: true,
    message: 'Admin notification sent',
    data: { to, sentAt: new Date() },
  };
};

/**
 * Generate certificate email HTML
 * @param {Object} data - Email data
 * @returns {String} - HTML string
 */
function generateCertificateEmailHTML(data) {
  const { studentName, certificateNumber, universityName, downloadLink, verificationLink } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Certificate is Ready</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);">
          <h1 style="color: white; margin: 0;">Certificate Ready!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="font-size: 16px; color: #333;">Dear ${studentName},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Congratulations! Your certificate from <strong>${universityName}</strong> is now ready for download.
          </p>
          
          <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #333;">
              <strong>Certificate Number:</strong><br>
              <span style="font-size: 18px; color: #3b82f6;">${certificateNumber}</span>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadLink}" style="display: inline-block; padding: 15px 30px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              Download Certificate
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            You can also verify the authenticity of your certificate at any time using the link below:
          </p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: transparent; color: #3b82f6; text-decoration: none; border: 2px solid #3b82f6; border-radius: 5px; font-size: 14px;">
              Verify Certificate
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated email. Please do not reply to this message.<br>
            If you have any questions, please contact your university administrator.
          </p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #666; margin: 0;">
            © ${new Date().getFullYear()} ${universityName}. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate welcome email for new admin
 * @param {Object} data - Email data
 * @returns {String} - HTML string
 */
exports.generateWelcomeEmail = (data) => {
  const { name, email, universityName, loginLink } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Welcome to ${universityName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <h2 style="color: #3b82f6;">Welcome to ${universityName}!</h2>
        <p>Hello ${name},</p>
        <p>Your administrator account has been created successfully.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>Click the button below to login:</p>
        <a href="${loginLink}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
          Login Now
        </a>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          If you did not request this account, please contact support immediately.
        </p>
      </div>
    </body>
    </html>
  `;
};

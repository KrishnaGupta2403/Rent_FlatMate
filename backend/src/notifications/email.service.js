const nodemailer = require('nodemailer');
const notifRepo = require('./notification.repository');

// Create Nodemailer transport (uses environment variables or defaults to console/mock mode)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

let forceFailToggle = false;

exports.setForceFail = (val) => {
  forceFailToggle = val;
};

exports.sendEmail = async ({ to, subject, html, forceFail = false }) => {
  const shouldFail = forceFail || forceFailToggle;

  try {
    if (!to || !subject) {
      throw new Error('Recipient email and subject are required');
    }

    if (shouldFail) {
      throw new Error('Simulated email delivery failure (for retry testing)');
    }

    // If SMTP_USER is configured, send via real SMTP. Otherwise simulate successful delivery in local dev
    if (process.env.SMTP_USER) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Rent Flatmate" <no-reply@rentflatmate.com>',
        to,
        subject,
        html: html || subject
      });
    } else {
      console.log(`[EMAIL DEV MOCK] Sent to: ${to} | Subject: "${subject}"`);
    }

    const log = await notifRepo.createEmailLog({
      recipientEmail: to,
      subject,
      status: 'SENT'
    });

    return { success: true, status: 'SENT', logId: log.id };
  } catch (error) {
    console.warn(`[EMAIL ERROR] Failed to send email to ${to}: ${error.message}`);
    const log = await notifRepo.createEmailLog({
      recipientEmail: to,
      subject,
      status: 'FAILED'
    });

    // Add to retry queue automatically
    try {
      const emailQueue = require('../jobs/emailQueue');
      emailQueue.addJob({ logId: log.id, to, subject, html });
    } catch (e) {
      console.error('Failed to add email to retry queue:', e.message);
    }

    return { success: false, status: 'FAILED', error: error.message, logId: log.id };
  }
};

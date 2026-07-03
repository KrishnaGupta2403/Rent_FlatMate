const notifRepo = require('../notifications/notification.repository');

const queue = []; // Array<{ logId, to, subject, html, attempts }>
let cronInterval = null;

exports.addJob = ({ logId, to, subject, html }) => {
  // Avoid duplicate jobs for same logId
  if (!queue.find(j => j.logId === logId)) {
    queue.push({ logId, to, subject, html, attempts: 0 });
    console.log(`[EMAIL QUEUE] Added job for ${to} (Log ID: ${logId})`);
  }
};

exports.processQueue = async () => {
  if (queue.length === 0) return;
  console.log(`[EMAIL QUEUE] Processing ${queue.length} failed email job(s)...`);

  const emailService = require('../notifications/email.service');
  const currentJobs = [...queue];

  for (const job of currentJobs) {
    job.attempts++;
    try {
      // Retry sending without forceFail
      const result = await emailService.sendEmail({
        to: job.to,
        subject: job.subject,
        html: job.html,
        forceFail: false
      });

      if (result.success) {
        await notifRepo.updateEmailLogStatus(job.logId, 'SENT');
        const idx = queue.findIndex(j => j.logId === job.logId);
        if (idx !== -1) queue.splice(idx, 1);
        console.log(`[EMAIL QUEUE] Successfully retried and sent email to ${job.to}`);
      } else if (job.attempts >= 3) {
        // Drop after 3 failed attempts
        const idx = queue.findIndex(j => j.logId === job.logId);
        if (idx !== -1) queue.splice(idx, 1);
        console.warn(`[EMAIL QUEUE] Dropping email job for ${job.to} after 3 failed attempts.`);
      }
    } catch (err) {
      console.error(`[EMAIL QUEUE] Retry error for ${job.to}:`, err.message);
    }
  }
};

exports.startCron = (intervalMs = 30000) => {
  if (cronInterval) clearInterval(cronInterval);
  cronInterval = setInterval(() => {
    exports.processQueue();
  }, intervalMs);
  console.log('✓ Email retry worker started');
};

exports.stopCron = () => {
  if (cronInterval) clearInterval(cronInterval);
  cronInterval = null;
};

exports.getQueue = () => queue;

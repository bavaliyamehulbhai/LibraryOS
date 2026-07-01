const EmailQueue = require("../models/EmailQueue");

const addToQueue = async (libraryId, to, subject, body) => {
  const emailJob = new EmailQueue({
    libraryId,
    to,
    subject,
    body,
    status: "PENDING",
    attempts: 0
  });
  await emailJob.save();
  return emailJob;
};

const processQueue = async () => {
  const pendingEmails = await EmailQueue.find({
    status: { $in: ["PENDING", "FAILED"] },
    attempts: { $lt: 3 }
  }).limit(50); // Process batch of 50

  for (const email of pendingEmails) {
    try {
      email.status = "PROCESSING";
      email.attempts += 1;
      await email.save();

      // Mock sending email
      // await someSmtpClient.sendEmail(email.to, email.subject, email.body);
      console.log(`[EmailQueue] Sent email to ${email.to}: ${email.subject}`);

      email.status = "SENT";
      email.sentAt = new Date();
      await email.save();
    } catch (error) {
      email.status = "FAILED";
      email.error = error.message;
      await email.save();
      console.error(`[EmailQueue] Failed to send email to ${email.to}:`, error.message);
    }
  }
};

module.exports = {
  addToQueue,
  processQueue
};

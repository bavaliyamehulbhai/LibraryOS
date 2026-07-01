const nodemailer = require("nodemailer");

/**
 * Configure Nodemailer Transport
 * For local development, we use Ethereal Email which generates a fake SMTP service.
 * In production, this would be replaced with SendGrid, Amazon SES, or Mailgun.
 */

// Define transport globally so it can be reused
let transporter = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  try {
    // Determine if we should use real credentials from .env or fallback to Ethereal
    if (process.env.EMAIL_SMTP_HOST && process.env.EMAIL_SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port: process.env.EMAIL_SMTP_PORT || 587,
        secure: process.env.EMAIL_SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_SMTP_USER,
          pass: process.env.EMAIL_SMTP_PASS
        }
      });
      console.log("[Email] Configured with external SMTP provider.");
    } else {
      // Fallback to Ethereal for testing
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log("[Email] Configured with Ethereal Email for testing.");
      console.log(`[Email] Ethereal Webmail: https://ethereal.email/login`);
      console.log(`[Email] User: ${testAccount.user} | Pass: ${testAccount.pass}`);
    }
  } catch (err) {
    console.error("[Email] Failed to create transport:", err);
  }

  return transporter;
};

module.exports = { createTransporter };

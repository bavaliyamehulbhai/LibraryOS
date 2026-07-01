const nodemailer = require("nodemailer");
const EmailLog = require("../models/EmailLog");
const EmailTemplate = require("../models/EmailTemplate");
const { createTransporter } = require("../config/emailConfig");
const { renderTemplate } = require("./templateEngine");
const { generateTransactionCode } = require("./transactionCodeService");

/**
 * Direct email sender (resolves templates, sends, logs)
 */
exports.processEmailJob = async (jobData) => {
  const { email, subject, message, notificationId, templateName, libraryId } = jobData;
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  
  try {
    // 1. Create PENDING Email Log
    const emailCode = await generateTransactionCode(libraryId, "EML");
    const emailLog = await EmailLog.create({
      emailCode,
      recipient: email,
      subject: subject,
      templateName: templateName || "System Default",
      status: "PENDING",
      libraryId,
      notificationId
    });

    // 2. Render HTML Content with Tracking Pixel
    // If a raw message was passed from NotificationService, we'll wrap it in basic HTML.
    // Otherwise we'd look up a specific EmailTemplate.
    let finalHtml = "";
    if (templateName) {
      const template = await EmailTemplate.findOne({ name: templateName, libraryId, isActive: true });
      if (template) {
        finalHtml = renderTemplate(template.htmlContent, jobData.variables || {}, emailLog._id, backendUrl);
      }
    }
    
    // Fallback if no specific EmailTemplate is found
    if (!finalHtml) {
      const basicHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0;">LibraryOS</h2>
          </div>
          <p>${message ? message.replace(/\n/g, '<br>') : "You have a new notification."}</p>
          <div style="margin-top: 30px; font-size: 12px; color: #888;">
            <p>This is an automated email from LibraryOS.</p>
          </div>
        </div>
      `;
      finalHtml = renderTemplate(basicHtml, {}, emailLog._id, backendUrl);
    }

    // 3. Send Email via Nodemailer
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"LibraryOS" <${process.env.EMAIL_FROM || "noreply@libraryos.local"}>`,
      to: email,
      subject: subject,
      html: finalHtml
    });

    console.log(`[EmailService] Sent to ${email}. MessageId: ${info.messageId}`);
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log(`[EmailService] Ethereal Preview URL: %s`, nodemailer.getTestMessageUrl(info));
    }

    // 4. Mark as SENT
    emailLog.status = "SENT";
    emailLog.sentAt = new Date();
    await emailLog.save();

    return { success: true, emailLogId: emailLog._id };

  } catch (error) {
    console.error("[EmailService] Delivery failed:", error);
    // If we have an email log created, update it to FAILED
    if (jobData.libraryId) {
      await EmailLog.findOneAndUpdate(
        { recipient: email, status: "PENDING", libraryId },
        { status: "FAILED", errorMessage: error.message },
        { sort: { createdAt: -1 } }
      );
    }
    throw error; // Let the queue handle retries
  }
};

exports.sendOtpEmail = async (email, otpCode, libraryId) => {
  return exports.processEmailJob({
    email,
    subject: "Your OTP for LibraryOS",
    message: `Your One-Time Password is: ${otpCode}. It will expire in 5 minutes.`,
    libraryId
  });
};

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  return exports.processEmailJob({
    email,
    subject: "Reset your LibraryOS Password",
    message: `Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
  });
};

exports.sendSecurityAlertEmail = async (email, title, details) => {
  return exports.processEmailJob({
    email,
    subject: `Security Alert: ${title}`,
    message: details
  });
};

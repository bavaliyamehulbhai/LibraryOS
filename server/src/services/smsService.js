const SmsLog = require("../models/SmsLog");
const SmsTemplate = require("../models/SmsTemplate");
const { generateTransactionCode } = require("./transactionCodeService");

/**
 * Process SMS Queue Job
 */
exports.processSmsJob = async (jobData) => {
  const { phone, message, notificationId, templateName, libraryId, memberId } = jobData;
  
  try {
    // 1. Create PENDING SMS Log
    const smsCode = await generateTransactionCode(libraryId, "SMS");
    const smsLog = await SmsLog.create({
      smsCode,
      phone,
      memberId,
      message: message || "", // Base message
      templateName: templateName || "System Default",
      status: "PENDING",
      libraryId,
      notificationId
    });

    // 2. Resolve Template if applicable
    let finalMessage = message;
    if (templateName) {
      const template = await SmsTemplate.findOne({ name: templateName, libraryId, isActive: true });
      if (template) {
        finalMessage = template.message;
        // Basic variable replacement
        if (jobData.variables) {
          for (const [key, value] of Object.entries(jobData.variables)) {
            finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), value || "");
          }
        }
      }
    }
    smsLog.message = finalMessage;
    await smsLog.save();

    // 3. Provider Delivery
    const provider = process.env.SMS_PROVIDER || "MOCK";
    smsLog.provider = provider;
    
    if (provider === "TWILIO") {
      // Setup Twilio (Require at runtime to avoid crashing if not installed)
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const response = await client.messages.create({
        body: finalMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      
      smsLog.providerMessageId = response.sid;
      smsLog.status = "SENT";
      smsLog.sentAt = new Date();
      console.log(`[SmsService - TWILIO] Sent to ${phone}. SID: ${response.sid}`);
    } else if (provider === "MSG91") {
      // MSG91 implementation would go here (using axios)
      throw new Error("MSG91 provider not fully implemented yet.");
    } else {
      // MOCK Provider
      console.log("==========================================");
      console.log(`[MOCK SMS] To: ${phone}`);
      console.log(`[MOCK SMS] Message: ${finalMessage}`);
      console.log("==========================================");
      
      smsLog.providerMessageId = `mock_${Date.now()}`;
      smsLog.status = "DELIVERED"; // Immediately mark delivered for testing
      smsLog.sentAt = new Date();
      smsLog.deliveredAt = new Date();
    }

    // 4. Save success
    await smsLog.save();
    return { success: true, smsLogId: smsLog._id };

  } catch (error) {
    console.error("[SmsService] Delivery failed:", error);
    if (jobData.libraryId) {
      await SmsLog.findOneAndUpdate(
        { phone, status: "PENDING", libraryId },
        { status: "FAILED", errorMessage: error.message },
        { sort: { createdAt: -1 } }
      );
    }
    throw error;
  }
};

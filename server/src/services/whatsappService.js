const WhatsAppLog = require("../models/WhatsAppLog");
const WhatsAppTemplate = require("../models/WhatsAppTemplate");
const { generateTransactionCode } = require("./transactionCodeService");

/**
 * Process WhatsApp Queue Job
 */
exports.processWhatsAppJob = async (jobData) => {
  const { phone, message, notificationId, templateName, libraryId, memberId } = jobData;
  
  try {
    // 1. Create PENDING WhatsApp Log
    const messageCode = await generateTransactionCode(libraryId, "WA");
    const waLog = await WhatsAppLog.create({
      messageCode,
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
    let interactiveButtons = [];
    if (templateName) {
      const template = await WhatsAppTemplate.findOne({ name: templateName, libraryId, isActive: true });
      if (template) {
        finalMessage = template.message;
        interactiveButtons = template.interactiveButtons || [];
        // Basic variable replacement
        if (jobData.variables) {
          for (const [key, value] of Object.entries(jobData.variables)) {
            finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), value || "");
          }
        }
      }
    }
    waLog.message = finalMessage;
    await waLog.save();

    // 3. Provider Delivery
    const provider = process.env.WHATSAPP_PROVIDER || "MOCK";
    
    if (provider === "META") {
      // Real Meta API implementation would go here using axios to https://graph.facebook.com/vXX.X/
      throw new Error("META provider not fully implemented yet. Missing API keys.");
    } else {
      // MOCK Provider
      console.log("==========================================");
      console.log(`[MOCK WHATSAPP] To: ${phone}`);
      console.log(`[MOCK WHATSAPP] Message: ${finalMessage}`);
      if (interactiveButtons.length > 0) {
        console.log(`[MOCK WHATSAPP] Buttons: [ ${interactiveButtons.join(" | ")} ]`);
      }
      console.log("==========================================");
      
      waLog.providerMessageId = `wa_mock_${Date.now()}`;
      waLog.status = "DELIVERED"; // Automatically mark delivered for testing
      waLog.sentAt = new Date();
      waLog.deliveredAt = new Date();
    }

    // 4. Save success
    await waLog.save();
    return { success: true, waLogId: waLog._id };

  } catch (error) {
    console.error("[WhatsAppService] Delivery failed:", error);
    if (jobData.libraryId) {
      await WhatsAppLog.findOneAndUpdate(
        { phone, status: "PENDING", libraryId },
        { status: "FAILED", errorMessage: error.message },
        { sort: { createdAt: -1 } }
      );
    }
    throw error;
  }
};

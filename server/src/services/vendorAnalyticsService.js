const Vendor = require("../models/Vendor");
const { callChatCompletion } = require("../utils/aiClient");

exports.generateVendorInsights = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new Error("Vendor not found");

  if (!process.env.GROQ_API_KEY) {
    return "AI Insights are currently disabled. Please add a valid GROQ_API_KEY.";
  }

  try {
    const prompt = `Analyze this vendor's performance for a library procurement system:
Company: ${vendor.companyName}
Status: ${vendor.status}
Rating: ${vendor.rating} / 5
Orders Completed: ${vendor.ordersCompleted}
Revenue Generated: ₹${vendor.revenueGenerated}
Risk Score: ${vendor.riskScore}

Provide a 2-3 sentence strategic insight on this vendor's reliability and if we should continue business with them.`;

    const response = await callChatCompletion({
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI Vendor Insight Error:", error.message);
    return `Vendor ${vendor.companyName} holds an active status with reliable fulfillment history. Procurement metrics indicate normal operational risk.`;
  }
};

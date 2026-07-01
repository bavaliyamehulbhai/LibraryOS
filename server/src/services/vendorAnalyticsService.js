const Vendor = require("../models/Vendor");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1"
});

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

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Grok AI Vendor Insight Error:", error.message);
    return "Failed to generate AI insights due to an API error.";
  }
};

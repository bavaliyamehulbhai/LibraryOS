const ResearchPaper = require("../models/ResearchPaper");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1"
});

exports.aiSummarize = async (abstract) => {
  if (!process.env.GROQ_API_KEY) return "AI Summary unavailable. Please configure GROQ_API_KEY.";
  
  const prompt = `You are an expert AI Research Assistant. Summarize this academic abstract into three bullet points covering Key Findings, Methodology, and Conclusion:
Abstract: "${abstract}"`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI Summarize Error:", error.message);
    return "Failed to generate AI summary.";
  }
};

exports.aiGenerateCitation = async (paperData, format = "APA") => {
  if (!process.env.GROQ_API_KEY) {
    // Basic fallback for APA
    if (format === "APA") return `${paperData.authors[0]} et al. (${paperData.publicationYear}). ${paperData.title}.`;
    return "Citation generation requires AI integration.";
  }
  
  const prompt = `Generate a standard ${format} citation for this research paper. Return ONLY the citation string, nothing else.
Title: ${paperData.title}
Authors: ${paperData.authors.join(", ")}
Year: ${paperData.publicationYear}
Type: ${paperData.researchType}`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Citation Error:", error.message);
    return "Failed to generate AI citation.";
  }
};

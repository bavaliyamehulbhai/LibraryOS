const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1"
});

exports.summarizeChapter = async (chapterText) => {
  if (!process.env.GROQ_API_KEY) {
    return "AI Summary is currently disabled. Please add a valid GROQ_API_KEY.";
  }

  try {
    const prompt = `You are a helpful reading assistant. Summarize the following excerpt from a book/document in a concise, bulleted format:\n\n"${chapterText.substring(0, 3000)}"`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Grok AI Summarize Error:", error.message);
    return "Failed to generate summary.";
  }
};

exports.explainConcept = async (selectedText) => {
  if (!process.env.GROQ_API_KEY) {
    return "AI Explanation is currently disabled. Please add a valid GROQ_API_KEY.";
  }

  try {
    const prompt = `You are a highly intelligent tutor. Explain the following concept or text as simply as possible, as if explaining to a beginner student. Provide a clear, intuitive answer.\n\nText: "${selectedText.substring(0, 1000)}"`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Grok AI Explain Error:", error.message);
    return "Failed to explain concept.";
  }
};

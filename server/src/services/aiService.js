const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1"
});

exports.generateResponse = async (question, dbResult) => {
  if (!process.env.GROQ_API_KEY) {
    // Fallback if no API key is provided
    return `[Mock AI Response] Based on your query: "${question}", I found the following in the database: ${JSON.stringify(dbResult)}`;
  }

  try {
    const prompt = `You are LibraryOS AI Librarian, a helpful assistant for a library management system.
User Question: "${question}"
Database Result: ${JSON.stringify(dbResult)}

Provide a concise, natural language response answering the user's question based ONLY on the database result.`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error in Chat:", error.message);
    return `[Mock AI Response] Based on your query: "${question}", I found the following in the database: ${JSON.stringify(dbResult)}. (This is a simulated response because the AI model is currently unavailable or the API key is incorrect.)`;
  }
};

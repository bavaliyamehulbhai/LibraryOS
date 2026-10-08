const { callChatCompletion } = require("../utils/aiClient");

exports.summarizeChapter = async (chapterText) => {
  if (!process.env.GROQ_API_KEY) {
    return "AI Summary is currently disabled. Please add a valid GROQ_API_KEY.";
  }

  try {
    const prompt = `You are a helpful reading assistant. Summarize the following excerpt from a book/document in a concise, bulleted format:\n\n"${chapterText.substring(0, 3000)}"`;

    const response = await callChatCompletion({
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI Summarize Error:", error.message);
    return "Summary temporarily unavailable. Please try again in a moment.";
  }
};

exports.explainConcept = async (selectedText) => {
  if (!process.env.GROQ_API_KEY) {
    return "AI Explanation is currently disabled. Please add a valid GROQ_API_KEY.";
  }

  try {
    const prompt = `You are a highly intelligent tutor. Explain the following concept or text as simply as possible, as if explaining to a beginner student. Provide a clear, intuitive answer.\n\nText: "${selectedText.substring(0, 1000)}"`;

    const response = await callChatCompletion({
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI Explain Error:", error.message);
    return "Explanation temporarily unavailable. Please try again in a moment.";
  }
};

exports.askChat = async (question, contextText) => {
  if (!process.env.GROQ_API_KEY) {
    return "AI Chat is currently disabled. Please add a valid GROQ_API_KEY.";
  }

  try {
    const prompt = `You are a helpful reading assistant. Answer the user's question based strictly on the provided context (the current page they are reading). If the context doesn't contain the answer, use your general knowledge but mention that it's not explicitly stated in the text.

Context: "${contextText.substring(0, 3000)}"

Question: "${question}"`;

    const response = await callChatCompletion({
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI Chat Error:", error.message);
    return "I am currently unable to process your question. Please try again.";
  }
};

const { callChatCompletion } = require("../utils/aiClient");

exports.detectCategoryAndCorrect = async (bookData) => {
  if (!process.env.GROQ_API_KEY) {
    return { ...bookData, category: "Uncategorized" };
  }

  try {
    const prompt = `You are a library cataloging expert.
Book Title: ${bookData.title}
Author: ${bookData.author}
Description: ${bookData.description}

Analyze the above book.
1. Fix any obvious typos in the Title or Author.
2. Determine the most appropriate single-word library category (e.g., Technology, Fiction, Science, History, Business).

Respond strictly in JSON format:
{
  "title": "Corrected Title",
  "author": "Corrected Author",
  "category": "CategoryName"
}`;

    const response = await callChatCompletion({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(response.choices[0].message.content);
    
    return {
      ...bookData,
      title: aiData.title || bookData.title,
      author: aiData.author || bookData.author,
      category: aiData.category || "Uncategorized"
    };

  } catch (error) {
    console.error("Groq AI Metadata Error in ocrService:", error.message);
    return { ...bookData, category: "Uncategorized" };
  }
};

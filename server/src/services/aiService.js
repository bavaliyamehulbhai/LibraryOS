const { callChatCompletion } = require("../utils/aiClient");

const formatNaturalResponse = (question, dbResult) => {
  if (!dbResult) {
    return "I checked the library records, but no data was found matching your inquiry.";
  }

  const intent = dbResult.intent;

  if (intent === "GET_MEMBERS_SUMMARY" || (dbResult.total !== undefined && dbResult.active !== undefined)) {
    const total = dbResult.total || 0;
    const active = dbResult.active || 0;
    const joined = dbResult.joinedThisMonth !== undefined ? dbResult.joinedThisMonth : 0;
    let text = `There are currently **${active} active members** registered in the library (out of a total of **${total} members**).`;
    if (joined > 0) {
      text += ` In the current month, **${joined} new member${joined === 1 ? '' : 's'}** joined the library.`;
    } else {
      text += ` No new members have joined in the current month so far.`;
    }
    return text;
  }

  if (intent === "GET_OVERDUE_BOOKS" || dbResult.count !== undefined) {
    const count = dbResult.count || 0;
    if (count === 0) {
      return "All books are currently on schedule! There are **0 overdue books** in the library system.";
    }
    return `There are currently **${count} overdue book${count === 1 ? '' : 's'}** requiring return or reminder notifications.`;
  }

  if (intent === "GET_BOOKS_SUMMARY" || (dbResult.availableCopies !== undefined || dbResult.totalCopies !== undefined)) {
    const totalCopies = dbResult.totalCopies || 0;
    const available = dbResult.availableCopies || 0;
    const titles = dbResult.totalTitles || totalCopies;
    return `The library catalog currently holds **${titles} unique titles** across **${totalCopies} total copies**, with **${available} copies currently available** on shelves for borrowing.`;
  }

  if (intent === "GET_FINES_SUMMARY" || dbResult.totalUnpaidAmount !== undefined) {
    const amount = dbResult.totalUnpaidAmount || 0;
    const count = dbResult.pendingFinesCount || 0;
    if (count === 0 || amount === 0) {
      return "All member accounts are currently in good standing with **₹0 pending fines**.";
    }
    return `There are **${count} pending fine records** totaling **₹${amount.toLocaleString('en-IN')}** pending settlement.`;
  }

  if (intent === "GET_ANALYTICS" || dbResult.monthlyCirculation !== undefined) {
    const circ = dbResult.monthlyCirculation || 0;
    const members = dbResult.totalMembers || 0;
    return `This month, the library recorded **${circ} book circulations** across an active community of **${members} members**.`;
  }

  if (dbResult.message && typeof dbResult.message === "string") {
    return `Regarding your inquiry on "${question}": ${dbResult.message}`;
  }

  return `Regarding your query: I found **${JSON.stringify(dbResult)}** in the library database.`;
};

const cleanText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/\+\+([^*]+)\*\*/g, '**$1**')
    .replace(/\*\*([^*]+)\+\+/g, '**$1**')
    .replace(/\+\+/g, '')
    .trim();
};

exports.generateResponse = async (question, dbResult) => {
  // Try AI completion if GROQ_API_KEY is available
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "dummy_key") {
    try {
      const prompt = `You are LibraryOS AI Copilot, a professional, concise, and helpful assistant for a library management system.
User Question: "${question}"
Database Result: ${JSON.stringify(dbResult)}

Answer the user's question directly and concisely in natural language using the database result. Use markdown bolding for numbers and key facts. Do not output raw JSON. Avoid symbols like '++'.`;

      const response = await callChatCompletion({
        messages: [{ role: "user", content: prompt }]
      });

      if (response && response.choices && response.choices[0] && response.choices[0].message) {
        return cleanText(response.choices[0].message.content);
      }
    } catch (error) {
      console.warn("[AI Copilot] Cloud LLM error, synthesizing locally:", error.message);
    }
  }

  // Graceful, polished natural language fallback
  return cleanText(formatNaturalResponse(question, dbResult));
};

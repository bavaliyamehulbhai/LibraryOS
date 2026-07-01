const Shelf = require("../models/Shelf");
const Book = require("../models/Book");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1"
});

exports.createShelf = async (shelfData) => {
  return await Shelf.create(shelfData);
};

exports.getShelves = async (libraryId) => {
  return await Shelf.find({ libraryId }).sort({ floor: 1, section: 1, rack: 1 });
};

exports.recommendShelf = async (libraryId, category, requiredSpace = 1) => {
  // 1. Try to find a shelf matching the category that has enough capacity
  const shelves = await Shelf.find({ libraryId, category });
  
  for (let shelf of shelves) {
    if (shelf.capacity - shelf.occupiedSlots >= requiredSpace) {
      return shelf;
    }
  }

  // 2. If no matching category shelf has space, just find ANY shelf with space (Overflow)
  const anyShelf = await Shelf.findOne({
    libraryId,
    $expr: { $gte: [{ $subtract: ["$capacity", "$occupiedSlots"] }, requiredSpace] }
  });

  return anyShelf || null;
};

exports.getAnalytics = async (libraryId) => {
  const shelves = await Shelf.find({ libraryId });
  
  let totalCapacity = 0;
  let totalOccupied = 0;
  let overloadedShelves = [];
  let healthyShelves = 0;
  
  shelves.forEach(shelf => {
    totalCapacity += shelf.capacity;
    totalOccupied += shelf.occupiedSlots;
    
    const util = (shelf.occupiedSlots / shelf.capacity) * 100;
    if (util >= 90) {
      overloadedShelves.push(shelf);
    } else {
      healthyShelves++;
    }
  });

  const utilizationPercent = totalCapacity === 0 ? 0 : Math.round((totalOccupied / totalCapacity) * 100);

  return {
    totalShelves: shelves.length,
    totalCapacity,
    totalOccupied,
    availableSpace: totalCapacity - totalOccupied,
    utilizationPercent,
    overloadedCount: overloadedShelves.length,
    healthyCount: healthyShelves,
    overloadedShelves
  };
};

exports.aiAssistant = async (libraryId, query) => {
  if (!process.env.GROQ_API_KEY) return "AI Assistant unavailable without API key.";
  
  // Fetch current shelf state to feed to the AI
  const analytics = await this.getAnalytics(libraryId);
  
  const prompt = `You are a Smart Library Physical Reorganization Assistant.
Current Library Status:
- Total Capacity: ${analytics.totalCapacity}
- Total Occupied: ${analytics.totalOccupied}
- Utilization: ${analytics.utilizationPercent}%
- Overloaded Shelves: ${analytics.overloadedShelves.map(s => s.shelfCode + ' (' + s.category + ')').join(", ") || "None"}

User Question: "${query}"

Provide a concise, practical recommendation for organizing the physical library space or assigning books based on the user's question and the current status.`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI Assistant Error:", error.message);
    return "Failed to generate AI recommendation.";
  }
};

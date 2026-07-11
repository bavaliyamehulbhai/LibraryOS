const StudyProfile = require("../models/StudyProfile");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1"
});

exports.getOrCreateProfile = async (userId, libraryId) => {
  let profile = await StudyProfile.findOne({ userId });
  if (!profile) {
    profile = await StudyProfile.create({ userId, libraryId });
  }
  return profile;
};

exports.updateProgress = async (userId, libraryId, metric) => {
  const profile = await this.getOrCreateProfile(userId, libraryId);
  if (metric === 'quiz') profile.quizzesCompleted += 1;
  if (metric === 'notes') profile.notesGenerated += 1;
  if (metric === 'summary') profile.summariesGenerated += 1;
  
  await profile.save();
  return profile;
};

exports.generateContent = async (userId, libraryId, mode, topic, content) => {
  if (!process.env.GROQ_API_KEY) return "AI Study Assistant unavailable without API key.";

  let prompt = "";
  let metricToUpdate = "";

  if (mode === "SUMMARIZE") {
    prompt = `You are an AI Study Assistant. Summarize the following content in simple language.
Provide:
- Main Concepts
- Key Points
- Important Terms

Content:
"${topic || content}"`;
    metricToUpdate = "summary";
  } 
  else if (mode === "EXPLAIN") {
    prompt = `You are an AI Study Assistant. Explain the following concept clearly for a student.
Provide:
- A Simple Explanation
- A Real World Example
- An Interview Perspective (Why it matters)

Concept: "${topic}"
Context (if any): "${content}"`;
    metricToUpdate = "notes"; // Using notes metric for explanations
  }
  else if (mode === "NOTES") {
    prompt = `You are an AI Study Assistant. Generate highly structured, interview-focused study notes from the following topic/content. Use markdown formatting with bullet points.

Topic: "${topic}"
Content: "${content}"`;
    metricToUpdate = "notes";
  }
  else if (mode === "QUIZ") {
    prompt = `You are an AI Study Assistant. Generate a 5-question Multiple Choice Quiz on the following topic.
You MUST return ONLY a valid JSON array containing the quiz data. Do not include any markdown formatting, backticks, or other text outside the JSON array.
Format exactly like this:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0
  }
]

Topic: "${topic}"`;
    metricToUpdate = "quiz";
  }
  else {
    throw new Error("Invalid AI mode");
  }

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });

    const aiOutput = response.choices[0].message.content;
    
    // Update progress asynchronously
    this.updateProgress(userId, libraryId, metricToUpdate).catch(console.error);

    return aiOutput;
  } catch (error) {
    console.error("AI Study Assistant Error:", error.message);
    
    // Return a realistic mock response for demo purposes if the API key/model fails
    let mockOutput = "### Mock AI Response\n\n- **Main Concepts**: " + topic + "\n- **Key Point**: This is a simulated response because the AI model is currently unavailable or the API key is incorrect.\n\nKeep studying!";
    
    if (mode === "QUIZ") {
      mockOutput = JSON.stringify([
        {
          question: `What is the main concept of ${topic || 'this topic'}?`,
          options: ["It is a framework", "It is an architecture", "It is a simulated AI quiz", "It is a database"],
          answerIndex: 2
        },
        {
          question: "Which of the following is true?",
          options: ["Mock data is useless", "This is a fallback response", "The AI API is working perfectly", "None of the above"],
          answerIndex: 1
        }
      ]);
    }

    this.updateProgress(userId, libraryId, metricToUpdate).catch(console.error);
    return mockOutput;
  }
};

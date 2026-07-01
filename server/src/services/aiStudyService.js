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
Return EXACTLY in this format for each question:
Q: [Question Text]
A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]
Answer: [Correct Option Letter]

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
    const mockOutput = "### Mock AI Response\n\n- **Main Concepts**: " + topic + "\n- **Key Point**: This is a simulated response because the AI model is currently unavailable or the API key is incorrect.\n\nKeep studying!";
    this.updateProgress(userId, libraryId, metricToUpdate).catch(console.error);
    return mockOutput;
  }
};

const KnowledgeArticle = require("../models/KnowledgeArticle");
const FAQ = require("../models/FAQ");

exports.getAllArticles = async (libraryId, query) => {
  // Auto-seed mock data if empty
  const count = await KnowledgeArticle.countDocuments({ libraryId });
  if (count === 0) {
    await KnowledgeArticle.create([
      {
        libraryId,
        title: "How to Borrow Digital Books",
        content: "Borrowing digital books is easy. Navigate to the Digital Library, browse the collection, and click on 'Borrow'. The book will be instantly available in your 'My Digital Content' section. You can read it online or download it for offline reading. Remember that digital books have a return date just like physical books.",
        category: "GUIDES",
        status: "PUBLISHED",
        views: 145
      },
      {
        libraryId,
        title: "Library Rules and Policies",
        content: "To maintain a peaceful and productive environment, please observe the following rules: 1. Keep your devices on silent. 2. No food or drinks near the computers. 3. Return books on or before the due date to avoid fines. 4. Treat all library staff and members with respect.",
        category: "POLICIES",
        status: "PUBLISHED",
        views: 89
      }
    ]);
  }

  const filter = { libraryId, status: "PUBLISHED" };
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } }
    ];
  }
  return await KnowledgeArticle.find(filter).sort({ views: -1 });
};

exports.getArticleById = async (libraryId, articleId) => {
  const article = await KnowledgeArticle.findOne({ _id: articleId, libraryId });
  if (article) {
    article.views += 1;
    await article.save();
  }
  return article;
};

exports.createArticle = async (libraryId, data) => {
  return await KnowledgeArticle.create({ ...data, libraryId });
};

exports.submitFeedback = async (articleId, isHelpful) => {
  const article = await KnowledgeArticle.findById(articleId);
  if (!article) throw new Error("Article not found");
  
  if (!article.stats) {
    article.stats = { totalVotes: 0, helpfulVotes: 0, helpfulnessPercentage: 0 };
  }
  
  article.stats.totalVotes += 1;
  if (isHelpful) article.stats.helpfulVotes += 1;
  
  article.stats.helpfulnessPercentage = Math.round((article.stats.helpfulVotes / article.stats.totalVotes) * 100);
  
  await article.save();
  return article;
};

exports.getAllFAQs = async (libraryId, query) => {
  // Auto-seed mock data if empty
  const count = await FAQ.countDocuments({ libraryId });
  if (count === 0) {
    await FAQ.create([
      {
        libraryId,
        question: "How do I reset my password?",
        answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page. An email with a reset link will be sent to your registered email address.",
        category: "ACCOUNT",
        order: 1
      },
      {
        libraryId,
        question: "What happens if I return a book late?",
        answer: "If you return a book after the due date, a fine will be calculated based on your membership plan's daily fine rate. You can view and pay your fines in the 'My Fines' section of your dashboard.",
        category: "BORROWING",
        order: 2
      }
    ]);
  }

  const filter = { libraryId };
  if (query) {
    filter.$or = [
      { question: { $regex: query, $options: "i" } },
      { answer: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } }
    ];
  }
  return await FAQ.find(filter).sort({ order: 1 });
};

exports.createFAQ = async (libraryId, data) => {
  return await FAQ.create({ ...data, libraryId });
};

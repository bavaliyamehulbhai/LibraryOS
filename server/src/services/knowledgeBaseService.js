const KnowledgeArticle = require("../models/KnowledgeArticle");
const KnowledgeCategory = require("../models/KnowledgeCategory");
const ArticleFeedback = require("../models/ArticleFeedback");

/**
 * Get all categories
 */
exports.getCategories = async (tenantId = null) => {
  const query = { $or: [{ tenantId: null }] };
  if (tenantId) {
    query.$or.push({ tenantId });
  }
  return await KnowledgeCategory.find(query).sort({ name: 1 });
};

/**
 * Create a new category
 */
exports.createCategory = async (data) => {
  const category = new KnowledgeCategory(data);
  await category.save();
  return category;
};

/**
 * Get published articles (with optional search query)
 */
exports.getArticles = async (tenantId = null, searchQuery = "", categoryId = null) => {
  const query = { 
    status: "PUBLISHED",
    $or: [{ tenantId: null }]
  };
  
  if (tenantId) {
    query.$or.push({ tenantId });
  }

  if (categoryId) {
    query.categoryId = categoryId;
  }

  if (searchQuery) {
    query.$text = { $search: searchQuery };
    return await KnowledgeArticle.find(query, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .populate("categoryId", "name icon");
  }

  return await KnowledgeArticle.find(query)
    .populate("categoryId", "name icon")
    .sort({ views: -1, createdAt: -1 });
};

/**
 * Get article details by slug and increment views
 */
exports.getArticleBySlug = async (slug, tenantId = null) => {
  const query = { slug };
  
  const article = await KnowledgeArticle.findOne(query).populate("categoryId", "name icon");
  
  if (!article) {
    throw new Error("Article not found");
  }

  // Increment views
  article.views += 1;
  await article.save();

  return article;
};

/**
 * Create a new article
 */
exports.createArticle = async (data) => {
  // Generate a slug if not provided
  if (!data.slug) {
    data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  const existing = await KnowledgeArticle.findOne({ slug: data.slug });
  if (existing) {
    // Append random string to make it unique
    data.slug = `${data.slug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const article = new KnowledgeArticle(data);
  await article.save();
  return article;
};

/**
 * Submit helpfulness feedback
 */
exports.submitFeedback = async (articleId, userId, helpful) => {
  const feedback = new ArticleFeedback({
    articleId,
    userId,
    helpful
  });
  await feedback.save();
  return feedback;
};

/**
 * Get feedback stats for an article
 */
exports.getArticleStats = async (articleId) => {
  const total = await ArticleFeedback.countDocuments({ articleId });
  const helpful = await ArticleFeedback.countDocuments({ articleId, helpful: true });
  
  return {
    totalVotes: total,
    helpfulVotes: helpful,
    helpfulnessPercentage: total > 0 ? Math.round((helpful / total) * 100) : 0
  };
};

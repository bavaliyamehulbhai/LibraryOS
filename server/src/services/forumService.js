const ForumPost = require("../models/ForumPost");
const ForumComment = require("../models/ForumComment");
const gamificationService = require("./gamificationService");

exports.getPosts = async (libraryId, query) => {
  const filter = { libraryId, status: "ACTIVE" };
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
      { tags: { $in: [new RegExp(query, "i")] } }
    ];
  }
  return await ForumPost.find(filter)
    .populate("authorId", "name avatar")
    .sort({ createdAt: -1 }); // Sort by newest
};

exports.createPost = async (libraryId, authorId, data) => {
  const post = await ForumPost.create({ ...data, libraryId, authorId });
  // Grant XP for creating a post
  try {
     await gamificationService.addXP(authorId, libraryId, 10);
  } catch (e) {
     console.error("Failed to grant gamification XP for post creation", e);
  }
  return post;
};

exports.getPostDetails = async (libraryId, postId) => {
  const post = await ForumPost.findOne({ _id: postId, libraryId }).populate("authorId", "name avatar");
  if (post) {
    post.views += 1;
    await post.save();
  }
  
  const comments = await ForumComment.find({ postId })
    .populate("authorId", "name avatar")
    .sort({ isBestAnswer: -1, createdAt: 1 });
    
  return { post, comments };
};

exports.addComment = async (postId, authorId, content) => {
  const comment = await ForumComment.create({ postId, authorId, content });
  
  // Increment comment count
  const post = await ForumPost.findById(postId);
  if (post) {
     post.commentsCount += 1;
     await post.save();
     
     // Grant XP
     try {
        await gamificationService.addXP(authorId, post.libraryId, 5);
     } catch(e) {}
  }
  
  return comment;
};

exports.upvotePost = async (postId) => {
  const post = await ForumPost.findById(postId);
  if (post) {
    post.upvotes += 1;
    await post.save();
    
    // Grant XP to author
    try {
        await gamificationService.addXP(post.authorId, post.libraryId, 2);
    } catch(e) {}
  }
  return post;
};

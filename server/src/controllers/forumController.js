const forumService = require("../services/forumService");

exports.getPosts = async (req, res) => {
  try {
    const posts = await forumService.getPosts(req.user.libraryId, req.query.q);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const post = await forumService.createPost(req.user.libraryId, req.user.id, req.body);
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPostDetails = async (req, res) => {
  try {
    const details = await forumService.getPostDetails(req.user.libraryId, req.params.id);
    if (!details.post) return res.status(404).json({ success: false, message: "Post not found" });
    res.json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const comment = await forumService.addComment(req.params.id, req.user.id, req.body.content);
    res.json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.upvotePost = async (req, res) => {
  try {
    const post = await forumService.upvotePost(req.params.id);
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const authorService = require("../services/authorService");
const Author = require("../models/Author");
const { createAuthorSchema, updateAuthorSchema } = require("../validators/authorValidator");
const AuditLog = require("../models/AuditLog");

exports.createAuthor = async (req, res) => {
  try {
    const { error, value } = createAuthorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const libraryId = req.user.libraryId;

    const exists = await Author.findOne({ name: value.name, libraryId, isActive: true });
    if (exists) {
      return res.status(400).json({ success: false, message: "Author with this name already exists" });
    }

    const authorData = { ...value, libraryId };
    const author = await authorService.createAuthor(authorData);

    await AuditLog.create({
      action: "AUTHOR_CREATED",
      entity: "AUTHOR",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Author ${author.name} created.`
    });

    res.status(201).json({ success: true, data: author });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAuthors = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const result = await authorService.getAuthors(req.query, libraryId);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAuthor = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const author = await authorService.getAuthorById(req.params.id, libraryId);
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    res.status(200).json({ success: true, data: author });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAuthor = async (req, res) => {
  try {
    const { error, value } = updateAuthorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const libraryId = req.user.libraryId;

    if (value.name) {
      const exists = await Author.findOne({ 
        name: value.name, 
        libraryId, 
        isActive: true,
        _id: { $ne: req.params.id }
      });
      if (exists) {
        return res.status(400).json({ success: false, message: "Author with this name already exists" });
      }
    }

    const author = await authorService.updateAuthor(req.params.id, libraryId, value);

    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }

    await AuditLog.create({
      action: "AUTHOR_UPDATED",
      entity: "AUTHOR",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Author ${author.name} updated.`
    });

    res.status(200).json({ success: true, data: author });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAuthor = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const author = await authorService.deleteAuthor(req.params.id, libraryId);

    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }

    await AuditLog.create({
      action: "AUTHOR_DELETED",
      entity: "AUTHOR",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Author ${author.name} deleted.`
    });

    res.status(200).json({ success: true, data: author });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAuthorStats = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const stats = await authorService.getAuthorStats(req.params.id, libraryId);
    if (!stats) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

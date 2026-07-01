const categoryService = require("../services/categoryService");
const Category = require("../models/Category");
const { createCategorySchema, updateCategorySchema } = require("../validators/categoryValidator");
const AuditLog = require("../models/AuditLog");

exports.createCategory = async (req, res) => {
  try {
    const { error, value } = createCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const libraryId = req.user.libraryId;

    const exists = await Category.findOne({ name: value.name, libraryId, isActive: true });
    if (exists) {
      return res.status(400).json({ success: false, message: "Category with this name already exists" });
    }

    const categoryData = { ...value, libraryId };
    const category = await categoryService.createCategory(categoryData);

    await AuditLog.create({
      action: "CATEGORY_CREATED",
      entity: "CATEGORY",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Category ${category.name} created.`
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const result = await categoryService.getCategories(req.query, libraryId);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const category = await categoryService.getCategoryById(req.params.id, libraryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { error, value } = updateCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const libraryId = req.user.libraryId;

    if (value.name) {
      const exists = await Category.findOne({ 
        name: value.name, 
        libraryId, 
        isActive: true,
        _id: { $ne: req.params.id }
      });
      if (exists) {
        return res.status(400).json({ success: false, message: "Category with this name already exists" });
      }
    }

    const category = await categoryService.updateCategory(req.params.id, libraryId, value);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await AuditLog.create({
      action: "CATEGORY_UPDATED",
      entity: "CATEGORY",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Category ${category.name} updated.`
    });

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const category = await categoryService.deleteCategory(req.params.id, libraryId);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await AuditLog.create({
      action: "CATEGORY_DELETED",
      entity: "CATEGORY",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Category ${category.name} deleted.`
    });

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategoryStats = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const stats = await categoryService.getCategoryStats(req.params.id, libraryId);
    if (!stats) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

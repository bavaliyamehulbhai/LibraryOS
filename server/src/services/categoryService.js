const Category = require("../models/Category");
const Book = require("../models/Book");

exports.createCategory = async (categoryData) => {
  return await Category.create(categoryData);
};

exports.getCategories = async (query, libraryId) => {
  const { search, page = 1, limit = 10, sort = "name" } = query;
  
  const filter = { libraryId, isActive: true };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const data = await Category.find(filter)
    .populate("parentCategory")
    .sort(sort)
    .skip(skip)
    .limit(limitNumber);

  const total = await Category.countDocuments(filter);

  return {
    data,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
    total
  };
};

exports.getCategoryById = async (id, libraryId) => {
  return await Category.findOne({ _id: id, libraryId, isActive: true })
    .populate("parentCategory");
};

exports.updateCategory = async (id, libraryId, updateData) => {
  return await Category.findOneAndUpdate(
    { _id: id, libraryId, isActive: true },
    updateData,
    { new: true, runValidators: true }
  ).populate("parentCategory");
};

exports.deleteCategory = async (id, libraryId) => {
  return await Category.findOneAndUpdate(
    { _id: id, libraryId, isActive: true },
    { isActive: false },
    { new: true }
  );
};

exports.getCategoryStats = async (id, libraryId) => {
  const category = await Category.findOne({ _id: id, libraryId, isActive: true });
  if (!category) return null;

  const booksCount = await Book.countDocuments({ category: id, libraryId, isActive: true });

  return {
    category: category.name,
    books: booksCount
  };
};

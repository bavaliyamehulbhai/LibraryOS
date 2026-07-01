const Author = require("../models/Author");
const Book = require("../models/Book");

exports.createAuthor = async (authorData) => {
  return await Author.create(authorData);
};

exports.getAuthors = async (query, libraryId) => {
  const { search, page = 1, limit = 10, sort = "name" } = query;
  
  const filter = { libraryId, isActive: true };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const data = await Author.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber);

  const total = await Author.countDocuments(filter);

  return {
    data,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
    total
  };
};

exports.getAuthorById = async (id, libraryId) => {
  return await Author.findOne({ _id: id, libraryId, isActive: true });
};

exports.updateAuthor = async (id, libraryId, updateData) => {
  return await Author.findOneAndUpdate(
    { _id: id, libraryId, isActive: true },
    updateData,
    { new: true, runValidators: true }
  );
};

exports.deleteAuthor = async (id, libraryId) => {
  return await Author.findOneAndUpdate(
    { _id: id, libraryId, isActive: true },
    { isActive: false },
    { new: true }
  );
};

exports.getAuthorStats = async (id, libraryId) => {
  const author = await Author.findOne({ _id: id, libraryId, isActive: true });
  if (!author) return null;

  const booksCount = await Book.countDocuments({ author: id, libraryId, isActive: true });

  return {
    author: author.name,
    totalBooks: booksCount
  };
};

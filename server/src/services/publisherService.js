const Publisher = require("../models/Publisher");
const Book = require("../models/Book");

exports.createPublisher = async (publisherData) => {
  return await Publisher.create(publisherData);
};

exports.getPublishers = async (query, libraryId) => {
  const { search, page = 1, limit = 10, sort = "name" } = query;
  
  const filter = { libraryId, isActive: true };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const data = await Publisher.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber);

  const total = await Publisher.countDocuments(filter);

  return {
    data,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
    total
  };
};

exports.getPublisherById = async (id, libraryId) => {
  return await Publisher.findOne({ _id: id, libraryId, isActive: true });
};

exports.updatePublisher = async (id, libraryId, updateData) => {
  return await Publisher.findOneAndUpdate(
    { _id: id, libraryId, isActive: true },
    updateData,
    { new: true, runValidators: true }
  );
};

exports.deletePublisher = async (id, libraryId) => {
  return await Publisher.findOneAndUpdate(
    { _id: id, libraryId, isActive: true },
    { isActive: false },
    { new: true }
  );
};

exports.getPublisherStats = async (id, libraryId) => {
  const publisher = await Publisher.findOne({ _id: id, libraryId, isActive: true });
  if (!publisher) return null;

  const booksCount = await Book.countDocuments({ publisher: id, libraryId, isActive: true });

  return {
    publisher: publisher.name,
    totalBooks: booksCount
  };
};

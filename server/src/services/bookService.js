const Book = require("../models/Book");

exports.createBook = async (bookData) => {
  return await Book.create(bookData);
};

exports.getBooks = async (query, libraryId) => {
  const { search, page = 1, limit = 10, sort = "-createdAt" } = query;
  
  const filter = { libraryId, isActive: true };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { isbn: { $regex: search, $options: "i" } }
    ];
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const books = await Book.find(filter)
    .populate("author category publisher")
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)
    .lean(); // Use lean so we can attach properties

  const Inventory = require("../models/Inventory");
  
  // Fetch inventory for these books
  const bookIds = books.map(b => b._id);
  const inventories = await Inventory.find({ bookId: { $in: bookIds }, libraryId });
  
  const inventoryMap = {};
  inventories.forEach(inv => {
    inventoryMap[inv.bookId.toString()] = inv;
  });

  const booksWithInventory = books.map(book => {
    const inv = inventoryMap[book._id.toString()];
    return {
      ...book,
      totalCopies: inv ? inv.totalCopies : 0,
      issuedCopies: inv ? inv.issuedCopies : 0,
      availableCopies: inv ? inv.availableCopies : 0
    };
  });

  const total = await Book.countDocuments(filter);

  return {
    books: booksWithInventory,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
    total
  };
};

exports.getBookById = async (id, libraryId) => {
  return await Book.findOne({ _id: id, libraryId, isActive: true })
    .populate("author category publisher");
};

exports.updateBook = async (id, libraryId, updateData) => {
  return await Book.findOneAndUpdate(
    { _id: id, libraryId, isActive: true },
    updateData,
    { new: true, runValidators: true }
  ).populate("author category publisher");
};

exports.deleteBook = async (id, libraryId) => {
  return await Book.findOneAndUpdate(
    { _id: id, libraryId, isActive: true },
    { isActive: false },
    { new: true }
  );
};

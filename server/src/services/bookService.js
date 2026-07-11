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
  const BookCopy = require("../models/BookCopy");
  
  // Fetch inventory for these books
  const bookIds = books.map(b => b._id);
  
  const mongoose = require("mongoose");
  const libObjectId = typeof libraryId === 'string' ? new mongoose.Types.ObjectId(libraryId) : libraryId;

  const [inventories, copiesAgg] = await Promise.all([
    Inventory.find({ bookId: { $in: bookIds }, libraryId }),
    BookCopy.aggregate([
      { $match: { bookId: { $in: bookIds }, libraryId: libObjectId } },
      { $group: {
          _id: "$bookId",
          totalCopies: { $sum: 1 },
          issuedCopies: { $sum: { $cond: [{ $eq: ["$status", "ISSUED"] }, 1, 0] } },
          availableCopies: { $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0] } }
        }
      }
    ])
  ]);
  
  const inventoryMap = {};
  inventories.forEach(inv => { inventoryMap[inv.bookId.toString()] = inv; });
  
  const copiesMap = {};
  copiesAgg.forEach(c => { copiesMap[c._id.toString()] = c; });

  const booksWithInventory = books.map(book => {
    const idStr = book._id.toString();
    const inv = inventoryMap[idStr];
    const cop = copiesMap[idStr];
    
    // Use Inventory if it exists and has totalCopies > 0, else fallback to BookCopy aggregation
    const useInv = inv && inv.totalCopies > 0;
    
    return {
      ...book,
      totalCopies: useInv ? inv.totalCopies : (cop ? cop.totalCopies : 0),
      issuedCopies: useInv ? inv.issuedCopies : (cop ? cop.issuedCopies : 0),
      availableCopies: useInv ? inv.availableCopies : (cop ? cop.availableCopies : 0)
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

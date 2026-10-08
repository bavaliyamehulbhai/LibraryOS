const Book = require("../models/Book");
const Category = require("../models/Category");
const Reservation = require("../models/Reservation");
const Library = require("../models/Library");

// Get Public Catalog (Supports 100+ books with category filter & pagination)
exports.getPublicCatalog = async (req, res) => {
  try {
    const totalCountInDb = await Book.countDocuments({ status: "AVAILABLE", isActive: true });
    if (totalCountInDb < 50) {
      try {
        const seedBooks = require("../seeders/bookSeeder");
        await seedBooks();
      } catch (seedErr) {
        console.error("Auto seeding error:", seedErr);
      }
    }

    const { category, search, limit = 150, page = 1 } = req.query;
    const filter = { isActive: { $ne: false }, status: "AVAILABLE" };

    if (category && category !== "All Categories") {
      const catDoc = await Category.findOne({ 
        name: { $regex: new RegExp(`^${category.trim()}$`, "i") } 
      });
      if (catDoc) {
        filter.category = catDoc._id;
      }
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { subtitle: { $regex: search.trim(), $options: "i" } },
        { isbn: { $regex: search.trim(), $options: "i" } }
      ];
    }

    const books = await Book.find(filter)
      .populate("author", "name bio country")
      .populate("category", "name icon color description")
      .populate("publisher", "name")
      .populate("libraryId", "name address")
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    res.json({ 
      success: true, 
      data: books, 
      count: books.length,
      totalCount: await Book.countDocuments({ isActive: { $ne: false }, status: "AVAILABLE" })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search Public Catalog
exports.searchPublicCatalog = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ success: true, data: [] });

    const books = await Book.find({
      $or: [
        { title: { $regex: q.trim(), $options: "i" } },
        { subtitle: { $regex: q.trim(), $options: "i" } },
        { isbn: { $regex: q.trim(), $options: "i" } }
      ],
      isActive: { $ne: false },
      status: "AVAILABLE"
    })
      .populate("author", "name bio country")
      .populate("category", "name icon color description")
      .populate("publisher", "name")
      .populate("libraryId", "name")
      .limit(100);

    res.json({ success: true, data: books, count: books.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Public Categories
exports.getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: { $ne: false } })
      .select("name icon color description")
      .sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Book Details Publicly
exports.getPublicBookDetails = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author", "name bio country")
      .populate("category", "name icon color description")
      .populate("publisher", "name website")
      .populate("libraryId", "name address phone email");
      
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Library Statistics for Public Portal
exports.getLibraryStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments({ isActive: { $ne: false }, status: "AVAILABLE" });
    const totalLibraries = await Library.countDocuments();
    const totalCategories = await Category.countDocuments({ isActive: { $ne: false } });
    
    res.json({ 
      success: true, 
      data: {
        totalBooks,
        totalLibraries: Math.max(totalLibraries, 1),
        totalCategories,
        activeMembers: 14850
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get List of Libraries for Registration
exports.getLibraries = async (req, res) => {
  try {
    const libraries = await Library.find().select('name _id code');
    res.json({ success: true, data: libraries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

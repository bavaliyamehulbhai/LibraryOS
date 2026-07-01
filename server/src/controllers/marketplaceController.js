const MarketplaceBook = require("../models/MarketplaceBook");
const MarketplaceOrder = require("../models/MarketplaceOrder");
const Vendor = require("../models/Vendor");
const marketplaceService = require("../services/marketplaceService");

exports.getBooks = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { title: { $regex: search, $options: "i" } };
    }
    
    // Populate vendor to show who is selling it
    const books = await MarketplaceBook.find(query).populate("vendorId", "name companyName rating");
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookDetails = async (req, res) => {
  try {
    const book = await MarketplaceBook.findById(req.params.id).populate("vendorId");
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const totalAmount = await marketplaceService.calculateCartTotal(items);
    const order = await marketplaceService.createPurchaseOrder(req.user.libraryId, items, totalAmount);
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await MarketplaceOrder.find({ libraryId: req.user.libraryId })
      .populate("vendorId", "companyName")
      .populate("items.bookId", "title coverImage")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Temp endpoint to seed data for testing
exports.seedData = async (req, res) => {
  try {
    const vendor = await Vendor.create({
      name: "John Doe",
      companyName: "TechBooks Distributors",
      email: "john@techbooks.com",
      phone: "+1234567890",
      status: "APPROVED",
      rating: 4.8
    });

    await MarketplaceBook.insertMany([
      { title: "Clean Code", isbn: "978-0132350884", author: "Robert C. Martin", publisher: "Prentice Hall", category: "Programming", price: 450, stock: 50, vendorId: vendor._id },
      { title: "Design Patterns", isbn: "978-0201633610", author: "Erich Gamma", publisher: "Addison-Wesley", category: "Software Engineering", price: 550, stock: 30, vendorId: vendor._id },
      { title: "Introduction to Algorithms", isbn: "978-0262033848", author: "Thomas H. Cormen", publisher: "MIT Press", category: "Computer Science", price: 850, stock: 20, vendorId: vendor._id },
    ]);

    res.json({ success: true, message: "Seeded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

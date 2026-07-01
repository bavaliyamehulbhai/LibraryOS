const MarketplaceBook = require("../models/MarketplaceBook");
const MarketplaceOrder = require("../models/MarketplaceOrder");

exports.calculateCartTotal = async (items) => {
  let totalAmount = 0;
  for (const item of items) {
    const book = await MarketplaceBook.findById(item.bookId);
    if (book) {
      totalAmount += book.price * item.quantity;
      item.price = book.price; // Attach current price
    }
  }
  return totalAmount;
};

exports.createPurchaseOrder = async (libraryId, items, totalAmount) => {
  // Simple order number generation
  const orderNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // In a real system, you'd split orders by Vendor if multiple vendors are in the cart.
  // We'll assume a single vendor for simplicity in this MVP.
  const book = await MarketplaceBook.findById(items[0].bookId);

  const order = await MarketplaceOrder.create({
    orderNumber,
    libraryId,
    vendorId: book.vendorId,
    items,
    totalAmount,
    status: "PENDING"
  });

  return order;
};

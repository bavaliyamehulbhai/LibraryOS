const Inventory = require("../models/Inventory");
const InventoryMovement = require("../models/InventoryMovement");
const AuditLog = require("../models/AuditLog");

const recordMovement = async (data, session = null) => {
  const movement = new InventoryMovement(data);
  return await movement.save({ session });
};

const createInventory = async (bookId, libraryId) => {
  const inventory = new Inventory({ bookId, libraryId });
  return await inventory.save();
};

const addStock = async (bookId, libraryId, quantity, reason, userId) => {
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");
  
  let inventory = await Inventory.findOne({ bookId, libraryId });
  if (!inventory) inventory = new Inventory({ bookId, libraryId });

  inventory.totalCopies += quantity;
  inventory.availableCopies += quantity;
  await inventory.save();

  await recordMovement({
    bookId,
    inventoryId: inventory._id,
    libraryId,
    userId,
    type: "STOCK_ADDED",
    quantity,
    reason
  });

  await AuditLog.create({
    action: "STOCK_ADDED",
    entity: "INVENTORY",
    userId,
    libraryId,
    details: `Added ${quantity} copies to book ${bookId}. Reason: ${reason}`
  });

  return inventory;
};

const removeStock = async (bookId, libraryId, quantity, reason, userId) => {
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");
  
  let inventory = await Inventory.findOne({ bookId, libraryId });
  if (!inventory) throw new Error("Inventory not found");

  if (inventory.availableCopies < quantity) {
    throw new Error(`Cannot remove ${quantity} copies. Only ${inventory.availableCopies} available.`);
  }

  inventory.totalCopies -= quantity;
  inventory.availableCopies -= quantity;
  await inventory.save();

  await recordMovement({
    bookId,
    inventoryId: inventory._id,
    libraryId,
    userId,
    type: "STOCK_REMOVED",
    quantity,
    reason
  });

  await AuditLog.create({
    action: "STOCK_REMOVED",
    entity: "INVENTORY",
    userId,
    libraryId,
    details: `Removed ${quantity} copies from book ${bookId}. Reason: ${reason}`
  });

  return inventory;
};

const issueBook = async (bookId, libraryId, quantity, userId) => {
  let inventory = await Inventory.findOne({ bookId, libraryId });
  if (!inventory) throw new Error("Inventory not found");

  if (inventory.availableCopies < quantity) {
    throw new Error(`Cannot issue book. Only ${inventory.availableCopies} available.`);
  }

  inventory.availableCopies -= quantity;
  inventory.issuedCopies += quantity;
  await inventory.save();

  await recordMovement({
    bookId,
    inventoryId: inventory._id,
    libraryId,
    userId,
    type: "BOOK_ISSUED",
    quantity
  });

  await AuditLog.create({
    action: "BOOK_ISSUED",
    entity: "INVENTORY",
    userId,
    libraryId,
    details: `Issued ${quantity} copies of book ${bookId}.`
  });

  return inventory;
};

const returnBook = async (bookId, libraryId, quantity, userId) => {
  let inventory = await Inventory.findOne({ bookId, libraryId });
  if (!inventory) throw new Error("Inventory not found");

  if (inventory.issuedCopies < quantity) {
    throw new Error(`Cannot return ${quantity} copies. Only ${inventory.issuedCopies} issued.`);
  }

  inventory.issuedCopies -= quantity;
  inventory.availableCopies += quantity;
  await inventory.save();

  await recordMovement({
    bookId,
    inventoryId: inventory._id,
    libraryId,
    userId,
    type: "BOOK_RETURNED",
    quantity
  });

  await AuditLog.create({
    action: "BOOK_RETURNED",
    entity: "INVENTORY",
    userId,
    libraryId,
    details: `Returned ${quantity} copies of book ${bookId}.`
  });

  return inventory;
};

const reserveBook = async (bookId, libraryId, quantity, userId) => {
  let inventory = await Inventory.findOne({ bookId, libraryId });
  if (!inventory) throw new Error("Inventory not found");

  if (inventory.availableCopies < quantity) {
    throw new Error(`Cannot reserve book. Only ${inventory.availableCopies} available.`);
  }

  inventory.availableCopies -= quantity;
  inventory.reservedCopies += quantity;
  await inventory.save();

  await recordMovement({
    bookId,
    inventoryId: inventory._id,
    libraryId,
    userId,
    type: "BOOK_RESERVED",
    quantity
  });

  return inventory;
};

const cancelReservation = async (bookId, libraryId, quantity, userId) => {
  let inventory = await Inventory.findOne({ bookId, libraryId });
  if (!inventory) throw new Error("Inventory not found");

  if (inventory.reservedCopies < quantity) {
    throw new Error(`Cannot cancel reservation of ${quantity}. Only ${inventory.reservedCopies} reserved.`);
  }

  inventory.reservedCopies -= quantity;
  inventory.availableCopies += quantity;
  await inventory.save();

  return inventory;
};

const markDamaged = async (bookId, libraryId, quantity, reason, userId) => {
  let inventory = await Inventory.findOne({ bookId, libraryId });
  if (!inventory) throw new Error("Inventory not found");

  if (inventory.availableCopies < quantity) {
    throw new Error(`Cannot mark damaged. Only ${inventory.availableCopies} available.`);
  }

  inventory.availableCopies -= quantity;
  inventory.damagedCopies += quantity;
  await inventory.save();

  await recordMovement({
    bookId,
    inventoryId: inventory._id,
    libraryId,
    userId,
    type: "BOOK_DAMAGED",
    quantity,
    reason
  });

  await AuditLog.create({
    action: "BOOK_DAMAGED",
    entity: "INVENTORY",
    userId,
    libraryId,
    details: `Marked ${quantity} copies of book ${bookId} as damaged. Reason: ${reason}`
  });

  return inventory;
};

const markLost = async (bookId, libraryId, quantity, reason, userId) => {
  let inventory = await Inventory.findOne({ bookId, libraryId });
  if (!inventory) throw new Error("Inventory not found");

  if (inventory.availableCopies < quantity) {
    throw new Error(`Cannot mark lost. Only ${inventory.availableCopies} available.`);
  }

  inventory.availableCopies -= quantity;
  inventory.lostCopies += quantity;
  await inventory.save();

  await recordMovement({
    bookId,
    inventoryId: inventory._id,
    libraryId,
    userId,
    type: "BOOK_LOST",
    quantity,
    reason
  });

  await AuditLog.create({
    action: "BOOK_LOST",
    entity: "INVENTORY",
    userId,
    libraryId,
    details: `Marked ${quantity} copies of book ${bookId} as lost. Reason: ${reason}`
  });

  return inventory;
};

const getInventoryStats = async (libraryId) => {
  const result = await Inventory.aggregate([
    { $match: { libraryId: libraryId } },
    {
      $group: {
        _id: null,
        totalBooks: { $sum: 1 },
        totalCopies: { $sum: "$totalCopies" },
        available: { $sum: "$availableCopies" },
        issued: { $sum: "$issuedCopies" },
        reserved: { $sum: "$reservedCopies" },
        damaged: { $sum: "$damagedCopies" },
        lost: { $sum: "$lostCopies" }
      }
    }
  ]);

  if (result.length > 0) {
    const stats = result[0];
    delete stats._id;
    return stats;
  }

  return {
    totalBooks: 0,
    totalCopies: 0,
    available: 0,
    issued: 0,
    reserved: 0,
    damaged: 0,
    lost: 0
  };
};

module.exports = {
  createInventory,
  addStock,
  removeStock,
  issueBook,
  returnBook,
  reserveBook,
  cancelReservation,
  markDamaged,
  markLost,
  getInventoryStats
};

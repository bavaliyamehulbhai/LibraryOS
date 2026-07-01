const BookCopy = require("../models/BookCopy");
const CopyMovement = require("../models/CopyMovement");
const AuditLog = require("../models/AuditLog");
const { generateCopyCode, generateBulkCopyCodes } = require("./copyCodeService");
const inventoryService = require("./inventoryService");

const recordMovement = async (data) => {
  const movement = new CopyMovement(data);
  return await movement.save();
};

const createCopy = async (bookId, libraryId, userId) => {
  const copyCode = await generateCopyCode(libraryId);
  const copy = new BookCopy({
    bookId,
    libraryId,
    copyCode,
    status: "AVAILABLE",
    condition: "NEW"
  });

  await copy.save();

  await recordMovement({
    copyId: copy._id,
    bookId,
    libraryId,
    userId,
    action: "COPY_CREATED",
    remarks: "Initial copy creation"
  });

  await AuditLog.create({
    action: "COPY_CREATED",
    entity: "BOOK_COPY",
    userId,
    libraryId,
    details: `Created copy ${copyCode} for book ${bookId}`
  });

  // Auto-sync inventory
  await inventoryService.addStock(bookId, libraryId, 1, `Auto-sync: Created copy ${copyCode}`, userId);

  return copy;
};

const bulkCreateCopies = async (bookId, libraryId, quantity, userId) => {
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");

  const codes = await generateBulkCopyCodes(libraryId, quantity);
  const copiesToInsert = codes.map(code => ({
    bookId,
    libraryId,
    copyCode: code,
    status: "AVAILABLE",
    condition: "NEW"
  }));

  const insertedCopies = await BookCopy.insertMany(copiesToInsert);

  const movements = insertedCopies.map(copy => ({
    copyId: copy._id,
    bookId,
    libraryId,
    userId,
    action: "COPY_CREATED",
    remarks: "Bulk copy creation"
  }));
  await CopyMovement.insertMany(movements);

  await AuditLog.create({
    action: "COPY_CREATED",
    entity: "BOOK_COPY",
    userId,
    libraryId,
    details: `Bulk created ${quantity} copies for book ${bookId}`
  });

  // Auto-sync inventory
  await inventoryService.addStock(bookId, libraryId, quantity, `Auto-sync: Bulk created ${quantity} copies`, userId);

  return insertedCopies;
};

const issueCopy = async (copyId, libraryId, userId) => {
  const copy = await BookCopy.findOne({ _id: copyId, libraryId });
  if (!copy) throw new Error("Copy not found");
  if (copy.status !== "AVAILABLE") throw new Error(`Cannot issue copy. Current status is ${copy.status}`);

  copy.status = "ISSUED";
  await copy.save();

  await recordMovement({
    copyId: copy._id,
    bookId: copy.bookId,
    libraryId,
    userId,
    action: "COPY_ISSUED"
  });

  // Sync inventory
  await inventoryService.issueBook(copy.bookId, libraryId, 1, userId);

  return copy;
};

const returnCopy = async (copyId, libraryId, userId, conditionRemarks) => {
  const copy = await BookCopy.findOne({ _id: copyId, libraryId });
  if (!copy) throw new Error("Copy not found");
  if (copy.status !== "ISSUED") throw new Error(`Cannot return copy. Current status is ${copy.status}`);

  copy.status = "AVAILABLE";
  await copy.save();

  await recordMovement({
    copyId: copy._id,
    bookId: copy.bookId,
    libraryId,
    userId,
    action: "COPY_RETURNED",
    remarks: conditionRemarks || "Returned in good condition"
  });

  // Sync inventory
  await inventoryService.returnBook(copy.bookId, libraryId, 1, userId);

  return copy;
};

const reserveCopy = async (copyId, libraryId, userId) => {
  const copy = await BookCopy.findOne({ _id: copyId, libraryId });
  if (!copy) throw new Error("Copy not found");
  if (copy.status !== "AVAILABLE") throw new Error(`Cannot reserve copy. Current status is ${copy.status}`);

  copy.status = "RESERVED";
  await copy.save();

  await recordMovement({
    copyId: copy._id,
    bookId: copy.bookId,
    libraryId,
    userId,
    action: "COPY_RESERVED"
  });

  // Sync inventory
  await inventoryService.reserveBook(copy.bookId, libraryId, 1, userId);

  return copy;
};

const markLost = async (copyId, libraryId, userId, remarks) => {
  const copy = await BookCopy.findOne({ _id: copyId, libraryId });
  if (!copy) throw new Error("Copy not found");
  
  // Note: a book can be marked lost from AVAILABLE or ISSUED. Let's assume from AVAILABLE for simplicity matching inventoryService
  if (copy.status !== "AVAILABLE") {
    // If it was issued, we'd theoretically need to un-issue it in inventory first, then mark lost.
    // To keep it simple based on the instructions: "AVAILABLE -> LOST"
    if (copy.status === "ISSUED") {
       throw new Error("Cannot mark lost directly from ISSUED. Return it first or build advanced logic.");
    }
  }

  copy.status = "LOST";
  await copy.save();

  await recordMovement({
    copyId: copy._id,
    bookId: copy.bookId,
    libraryId,
    userId,
    action: "COPY_LOST",
    remarks
  });

  // Sync inventory
  await inventoryService.markLost(copy.bookId, libraryId, 1, remarks || "Marked lost", userId);

  return copy;
};

const markDamaged = async (copyId, libraryId, userId, remarks) => {
  const copy = await BookCopy.findOne({ _id: copyId, libraryId });
  if (!copy) throw new Error("Copy not found");

  if (copy.status !== "AVAILABLE") {
    if (copy.status === "ISSUED") {
       throw new Error("Cannot mark damaged directly from ISSUED. Return it first or build advanced logic.");
    }
  }

  copy.status = "DAMAGED";
  copy.condition = "DAMAGED";
  await copy.save();

  await recordMovement({
    copyId: copy._id,
    bookId: copy.bookId,
    libraryId,
    userId,
    action: "COPY_DAMAGED",
    remarks
  });

  // Sync inventory
  await inventoryService.markDamaged(copy.bookId, libraryId, 1, remarks || "Marked damaged", userId);

  return copy;
};

const assignShelf = async (copyId, libraryId, shelfId, userId) => {
  const copy = await BookCopy.findOne({ _id: copyId, libraryId });
  if (!copy) throw new Error("Copy not found");

  copy.shelfId = shelfId;
  await copy.save();

  await recordMovement({
    copyId: copy._id,
    bookId: copy.bookId,
    libraryId,
    userId,
    action: "SHELF_CHANGED",
    remarks: `Assigned to shelf ${shelfId}`
  });

  return copy;
};

const updateCondition = async (copyId, libraryId, condition, userId) => {
  const copy = await BookCopy.findOne({ _id: copyId, libraryId });
  if (!copy) throw new Error("Copy not found");

  copy.condition = condition;
  await copy.save();

  await recordMovement({
    copyId: copy._id,
    bookId: copy.bookId,
    libraryId,
    userId,
    action: "CONDITION_CHANGED",
    remarks: `Condition changed to ${condition}`
  });

  return copy;
};

module.exports = {
  createCopy,
  bulkCreateCopies,
  issueCopy,
  returnCopy,
  reserveCopy,
  markLost,
  markDamaged,
  assignShelf,
  updateCondition
};

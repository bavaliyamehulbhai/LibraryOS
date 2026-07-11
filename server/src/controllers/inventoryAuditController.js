const AuditSession = require("../models/AuditSession");
const AuditRecord = require("../models/AuditRecord");
const BookCopy = require("../models/BookCopy");

exports.startAudit = async (req, res) => {
  try {
    const { name } = req.body;
    const libraryId = req.user.libraryId;

    if (!name) {
      return res.status(400).json({ success: false, message: "Audit session name is required" });
    }

    // Check if there is already an active session
    const activeSession = await AuditSession.findOne({ libraryId, status: "IN_PROGRESS" });
    if (activeSession) {
      return res.status(400).json({ success: false, message: "An audit session is already in progress. Please complete it first." });
    }

    const session = await AuditSession.create({
      name,
      libraryId,
      createdBy: req.user.id || req.user._id
    });

    res.json({ success: true, message: "Audit session started successfully", data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAuditSessions = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const sessions = await AuditSession.find({ libraryId }).sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAuditDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const libraryId = req.user.libraryId;

    const session = await AuditSession.findOne({ _id: id, libraryId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Audit session not found" });
    }

    const records = await AuditRecord.find({ auditSessionId: id })
      .populate({
        path: "bookCopyId",
        select: "copyCode barcode status condition bookId",
        populate: { path: "bookId", select: "title isbn" }
      })
      .populate("expectedShelfId", "name code")
      .populate("scannedShelfId", "name code");

    res.json({ success: true, data: { session, records } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.scanBook = async (req, res) => {
  try {
    const { id } = req.params; // Audit Session ID
    const { barcode, shelfId, condition } = req.body;
    const libraryId = req.user.libraryId;

    const session = await AuditSession.findOne({ _id: id, libraryId, status: "IN_PROGRESS" });
    if (!session) {
      return res.status(404).json({ success: false, message: "Active audit session not found" });
    }

    // Find the book copy
    let bookCopy = await BookCopy.findOne({ libraryId, $or: [{ barcode }, { copyCode: barcode }] });
    if (!bookCopy) {
      return res.status(404).json({ success: false, message: "Book not found with this barcode" });
    }

    // Check if already scanned in this session
    const existingRecord = await AuditRecord.findOne({ auditSessionId: id, bookCopyId: bookCopy._id });
    if (existingRecord) {
      return res.status(400).json({ success: false, message: "Book already scanned in this session" });
    }

    // Determine status
    let status = "VERIFIED";
    if (bookCopy.shelfId && shelfId && bookCopy.shelfId.toString() !== shelfId) {
      status = "MISPLACED";
      session.totalMisplaced += 1;
    }

    // Create Audit Record
    const record = await AuditRecord.create({
      auditSessionId: id,
      libraryId,
      bookCopyId: bookCopy._id,
      expectedShelfId: bookCopy.shelfId,
      scannedShelfId: shelfId,
      status,
      condition: condition || bookCopy.condition || "GOOD",
      scannedAt: new Date()
    });

    // Update book copy condition if changed
    if (condition && bookCopy.condition !== condition) {
      bookCopy.condition = condition;
    }
    // If it was previously MISSING, and now found, revert status to AVAILABLE
    if (bookCopy.status === "MISSING" || bookCopy.status === "LOST") {
      bookCopy.status = "AVAILABLE";
    }
    await bookCopy.save();

    session.totalScanned += 1;
    await session.save();

    res.json({ success: true, message: "Book scanned successfully", data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeShelf = async (req, res) => {
  try {
    const { id } = req.params;
    const { shelfId } = req.body; // The shelf that was just fully audited
    const libraryId = req.user.libraryId;

    const session = await AuditSession.findOne({ _id: id, libraryId, status: "IN_PROGRESS" });
    if (!session) {
      return res.status(404).json({ success: false, message: "Active audit session not found" });
    }

    if (!shelfId) {
      return res.status(400).json({ success: false, message: "Shelf ID is required to complete the shelf audit" });
    }

    // 1. Find all expected books for this shelf
    const expectedBooks = await BookCopy.find({ libraryId, shelfId, status: { $in: ["AVAILABLE", "MISSING"] } });
    
    // 2. Find all books actually scanned for this shelf during THIS session
    const scannedRecords = await AuditRecord.find({ auditSessionId: id, scannedShelfId: shelfId });
    const scannedCopyIds = scannedRecords.map(r => r.bookCopyId.toString());

    // 3. Mark unscanned expected books as MISSING
    let newMissingCount = 0;
    for (const book of expectedBooks) {
      if (!scannedCopyIds.includes(book._id.toString())) {
        // Log it as missing
        await AuditRecord.create({
          auditSessionId: id,
          libraryId,
          bookCopyId: book._id,
          expectedShelfId: shelfId,
          scannedShelfId: null,
          status: "MISSING"
        });
        
        book.status = "MISSING";
        await book.save();
        newMissingCount++;
      }
    }

    session.totalMissing += newMissingCount;
    await session.save();

    res.json({ success: true, message: `Shelf audit completed. ${newMissingCount} books marked as MISSING.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.closeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const libraryId = req.user.libraryId;

    const session = await AuditSession.findOne({ _id: id, libraryId, status: "IN_PROGRESS" });
    if (!session) {
      return res.status(404).json({ success: false, message: "Active audit session not found" });
    }

    session.status = "COMPLETED";
    session.endDate = new Date();
    await session.save();

    res.json({ success: true, message: "Audit session closed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

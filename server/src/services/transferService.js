const BranchTransfer = require("../models/BranchTransfer");
const BookCopy = require("../models/BookCopy");

exports.requestTransfer = async (libraryId, fromBranch, toBranch, bookCopyId, requestedBy, notes) => {
  // Check if book copy exists and is in fromBranch
  const copy = await BookCopy.findOne({ _id: bookCopyId, libraryId, branchId: fromBranch });
  if (!copy) throw new Error("Book copy not found in the source branch");

  if (copy.status !== "AVAILABLE") {
    throw new Error(`Cannot transfer book copy. Current status: ${copy.status}`);
  }

  const transfer = new BranchTransfer({
    libraryId,
    fromBranch,
    toBranch,
    bookCopy: bookCopyId,
    requestedBy,
    notes,
    status: "REQUESTED"
  });

  return await transfer.save();
};

exports.getTransfers = async (libraryId, branchId = null) => {
  const query = { libraryId };
  if (branchId) {
    query.$or = [{ fromBranch: branchId }, { toBranch: branchId }];
  }
  return await BranchTransfer.find(query)
    .populate("bookCopy", "copyCode")
    .populate("fromBranch", "branchName")
    .populate("toBranch", "branchName")
    .populate("requestedBy", "name")
    .sort({ createdAt: -1 });
};

exports.approveTransfer = async (libraryId, transferId, approvedBy) => {
  const transfer = await BranchTransfer.findOne({ _id: transferId, libraryId });
  if (!transfer) throw new Error("Transfer not found");
  if (transfer.status !== "REQUESTED") throw new Error("Only REQUESTED transfers can be approved");

  transfer.status = "APPROVED";
  transfer.approvedBy = approvedBy;
  await transfer.save();

  return transfer;
};

exports.markInTransit = async (libraryId, transferId) => {
  const transfer = await BranchTransfer.findOne({ _id: transferId, libraryId });
  if (!transfer) throw new Error("Transfer not found");
  if (transfer.status !== "APPROVED") throw new Error("Transfer must be APPROVED first");

  transfer.status = "IN_TRANSIT";
  transfer.transferDate = new Date();
  
  // Update BookCopy status
  await BookCopy.findByIdAndUpdate(transfer.bookCopy, { status: "IN_TRANSIT" });
  
  await transfer.save();
  return transfer;
};

exports.receiveTransfer = async (libraryId, transferId) => {
  const transfer = await BranchTransfer.findOne({ _id: transferId, libraryId });
  if (!transfer) throw new Error("Transfer not found");
  if (transfer.status !== "IN_TRANSIT") throw new Error("Transfer must be IN_TRANSIT to receive");

  transfer.status = "RECEIVED";
  transfer.receiveDate = new Date();
  
  // Update BookCopy branchId and status
  await BookCopy.findByIdAndUpdate(transfer.bookCopy, { 
    status: "AVAILABLE",
    branchId: transfer.toBranch
  });
  
  await transfer.save();
  return transfer;
};

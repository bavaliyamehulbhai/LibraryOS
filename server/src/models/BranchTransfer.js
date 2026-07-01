const mongoose = require("mongoose");

const branchTransferSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    fromBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },
    toBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },
    bookCopy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookCopy",
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    transferDate: {
      type: Date
    },
    receiveDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ["REQUESTED", "APPROVED", "IN_TRANSIT", "RECEIVED", "REJECTED"],
      default: "REQUESTED"
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BranchTransfer", branchTransferSchema);

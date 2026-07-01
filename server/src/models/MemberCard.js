const mongoose = require("mongoose");

const memberCardSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true
    },
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
      index: true
    },
    cardNumber: {
      type: String,
      required: true,
      unique: true
    },
    barcode: {
      type: String
    },
    qrCode: {
      type: String
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "BLOCKED", "LOST"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true
  }
);

memberCardSchema.index({ status: 1 });

module.exports = mongoose.model("MemberCard", memberCardSchema);

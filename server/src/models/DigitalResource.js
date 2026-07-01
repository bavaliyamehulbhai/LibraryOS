const mongoose = require("mongoose");

const digitalResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    resourceType: {
      type: String,
      enum: ["EBOOK", "JOURNAL", "RESEARCH_PAPER", "THESIS", "MAGAZINE", "QUESTION_PAPER"],
      default: "EBOOK"
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    author: { type: String, required: true },
    fileUrl: { type: String, required: true },
    coverImage: { type: String },
    fileSize: { type: Number }, // in bytes
    totalPages: { type: Number, default: 0 },
    language: { type: String, default: "en" },
    accessLevel: {
      type: String,
      enum: ["PUBLIC", "MEMBERS_ONLY", "PREMIUM", "STAFF_ONLY"],
      default: "MEMBERS_ONLY"
    },
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DigitalResource", digitalResourceSchema);

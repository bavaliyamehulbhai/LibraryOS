const mongoose = require("mongoose");

const researchPaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    abstract: { type: String, required: true },
    authors: [{ type: String, required: true }],
    keywords: [{ type: String }],
    publicationYear: { type: Number, required: true },
    researchType: { 
      type: String, 
      enum: ["RESEARCH_PAPER", "THESIS", "DISSERTATION", "PROJECT_REPORT", "CONFERENCE_PAPER", "JOURNAL_ARTICLE", "BOOK_CHAPTER", "PATENT"],
      required: true 
    },
    doi: { type: String }, // e.g., 10.1000/xyz123
    department: { type: String, required: true },
    fileUrl: { type: String, required: true }, // External link to PDF
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    status: { 
      type: String, 
      enum: ["DRAFT", "UNDER_REVIEW", "PUBLISHED", "ARCHIVED"], 
      default: "PUBLISHED" // Auto-publish for demo purposes
    },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Indexes for fast searching
researchPaperSchema.index({ title: 'text', keywords: 'text', abstract: 'text' });
researchPaperSchema.index({ department: 1, researchType: 1 });

module.exports = mongoose.model("ResearchPaper", researchPaperSchema);

const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventType: { 
      type: String, 
      enum: ["WORKSHOP", "SEMINAR", "BOOK_FAIR", "COMPETITION", "WEBINAR", "TRAINING"], 
      required: true 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, required: true },
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    maxParticipants: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"], 
      default: "PUBLISHED" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);

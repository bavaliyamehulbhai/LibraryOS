const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { 
      type: String, 
      enum: ["REGISTERED", "WAITLISTED", "ATTENDED", "ABSENT", "CANCELLED"], 
      default: "REGISTERED" 
    },
    certificateIssued: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Prevent duplicate registrations
eventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);

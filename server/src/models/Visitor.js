const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    purpose: { type: String, required: true },
    idProof: { type: String }, // Document type like Aadhar, License
    idNumber: { type: String },
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date },
    status: {
      type: String,
      enum: ["IN", "OUT"],
      default: "IN"
    },
    durationMinutes: { type: Number, default: 0 },
    autoPunchedOut: { type: Boolean, default: false }
  },
  { timestamps: true }
);

visitorSchema.index({ libraryId: 1, entryTime: -1 });
visitorSchema.index({ phone: 1 });

module.exports = mongoose.model("Visitor", visitorSchema);

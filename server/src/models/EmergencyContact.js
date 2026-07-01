const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    relation: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("EmergencyContact", emergencyContactSchema);

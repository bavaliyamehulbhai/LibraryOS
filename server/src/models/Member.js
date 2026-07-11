const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    memberCode: {
      type: String,
      unique: true,
      index: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"]
    },
    profileImage: String,
    dateOfBirth: Date,
    memberType: {
      type: String,
      enum: ["STUDENT", "TEACHER", "FACULTY", "GUEST", "EXTERNAL"],
      required: true
    },
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
      index: true
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch"
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED", "SUSPENDED"],
      default: "ACTIVE"
    },
    blockReason: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the authentication user record
      default: null
    },
    membershipPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan"
    },
    
    // Card tracking fields
    memberCardNumber: String,
    barcode: String,
    qrCode: String,
    cardIssuedDate: Date,
    cardExpiryDate: Date,

    profileImage: {
      type: String,
      default: "default-avatar.png"
    },
    activeCheckouts: {
      type: Number,
      default: 0
    },
    totalFines: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

memberSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes for search performance
memberSchema.index({ firstName: "text", lastName: "text", email: "text", phone: "text", memberCode: "text" });

module.exports = mongoose.model("Member", memberSchema);

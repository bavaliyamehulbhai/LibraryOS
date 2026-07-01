const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  studentId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, index: true },
  phone: { type: String },
  course: { type: String },
  department: { type: String },
  semester: { type: Number },
  joiningDate: { type: Date, default: Date.now },
  membershipPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
  activeCheckouts: { type: Number, default: 0 },
  totalFines: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
    default: "ACTIVE"
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);

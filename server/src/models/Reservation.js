const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservationCode: { type: String, unique: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  queuePosition: { type: Number, required: true },
  reservationDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  status: {
    type: String,
    enum: ["PENDING", "READY", "COLLECTED", "EXPIRED", "CANCELLED"],
    default: "PENDING",
    index: true
  },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  allocatedCopyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);

const reservationService = require("../services/reservationService");
const Reservation = require("../models/Reservation");

exports.reserveBook = async (req, res) => {
  try {
    const { memberId, bookId } = req.body;
    const reservation = await reservationService.reserveBook(req.user.libraryId, memberId, bookId, req.user._id);
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ libraryId: req.user.libraryId })
      .populate("memberId", "firstName lastName memberCode")
      .populate("bookId", "title authors coverImage")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await reservationService.cancelReservation(req.user.libraryId, req.params.id, req.user._id);
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.collectReservation = async (req, res) => {
  try {
    const reservation = await reservationService.collectReservation(req.user.libraryId, req.params.id, req.user._id);
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

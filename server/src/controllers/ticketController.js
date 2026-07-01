const ticketService = require("../services/ticketService");

exports.createTicket = async (req, res) => {
  try {
    const libraryId = req.user.libraryId || req.libraryId;
    const ticket = await ticketService.createTicket(libraryId, req.user._id, req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const libraryId = req.user.role === "SUPER_ADMIN" ? null : (req.user.libraryId || req.libraryId);
    
    // Allow SUPER_ADMIN to filter by tenantId if they pass it in query
    const filters = { ...req.query };
    if (req.user.role === "SUPER_ADMIN" && req.query.tenantId) {
      filters.tenantId = req.query.tenantId;
    }

    const tickets = await ticketService.getTickets(libraryId, filters);
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTicketDetails = async (req, res) => {
  try {
    const libraryId = req.user.role === "SUPER_ADMIN" ? null : (req.user.libraryId || req.libraryId);
    const data = await ticketService.getTicketDetails(req.params.id, libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { comment, isInternal } = req.body;
    
    // Only SUPER_ADMIN can add internal notes
    const internal = req.user.role === "SUPER_ADMIN" ? isInternal : false;

    const newComment = await ticketService.addComment(req.params.id, req.user._id, comment, internal);
    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    // Only SUPER_ADMIN or authorized roles can change status/assignment
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ success: false, message: "Only support agents can update ticket status" });
    }

    const ticket = await ticketService.updateTicket(req.params.id, req.body);
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

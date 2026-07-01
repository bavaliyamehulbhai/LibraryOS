const Ticket = require("../models/Ticket");
const TicketComment = require("../models/TicketComment");

/**
 * Generate a unique ticket number
 */
const generateTicketNumber = async () => {
  const count = await Ticket.countDocuments();
  const year = new Date().getFullYear();
  return `TKT-${year}-${String(count + 1).padStart(6, '0')}`;
};

/**
 * Create a new ticket
 */
exports.createTicket = async (tenantId, userId, ticketData) => {
  const ticketNumber = await generateTicketNumber();
  
  const ticket = new Ticket({
    ...ticketData,
    ticketNumber,
    tenantId,
    createdBy: userId
  });

  await ticket.save();
  return ticket;
};

/**
 * Get all tickets (filtered by tenant if provided)
 */
exports.getTickets = async (tenantId = null, filters = {}) => {
  const query = { ...filters };
  if (tenantId) {
    query.tenantId = tenantId;
  }
  
  return await Ticket.find(query)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("tenantId", "name")
    .sort({ createdAt: -1 });
};

/**
 * Get ticket details with comments
 */
exports.getTicketDetails = async (ticketId, tenantId = null) => {
  const query = { _id: ticketId };
  if (tenantId) {
    query.tenantId = tenantId;
  }

  const ticket = await Ticket.findOne(query)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const comments = await TicketComment.find({ ticketId })
    .populate("userId", "name role")
    .sort({ createdAt: 1 });

  return { ticket, comments };
};

/**
 * Add a comment to a ticket
 */
exports.addComment = async (ticketId, userId, commentText, isInternal = false) => {
  const comment = new TicketComment({
    ticketId,
    userId,
    comment: commentText,
    isInternal
  });

  await comment.save();

  // If a customer replies to a waiting ticket, change status to OPEN/IN_PROGRESS
  const ticket = await Ticket.findById(ticketId);
  if (ticket && !isInternal && ticket.status === "WAITING_CUSTOMER") {
    ticket.status = "IN_PROGRESS";
    await ticket.save();
  }

  return comment;
};

/**
 * Update ticket status or assignment
 */
exports.updateTicket = async (ticketId, updateData) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (updateData.status === "RESOLVED" || updateData.status === "CLOSED") {
    ticket.resolvedAt = new Date();
  }

  Object.assign(ticket, updateData);
  await ticket.save();
  
  return ticket;
};

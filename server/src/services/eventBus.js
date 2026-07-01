const EventEmitter = require("events");
const AuditLog = require("../models/AuditLog");

class EventBus extends EventEmitter {}
const eventBus = new EventBus();

// Core Workflow Triggers
eventBus.on("BOOK_ISSUED", async (data) => {
  // E.g. Send Issue Confirmation, Update Analytics
  await AuditLog.create({
    action: "WORKFLOW_EXECUTED",
    libraryId: data.libraryId,
    description: `Workflow executed for BOOK_ISSUED on book ${data.bookId}`
  });
});

eventBus.on("BOOK_RETURNED", async (data) => {
  // E.g. Send Return Confirmation, Check Fines
  await AuditLog.create({
    action: "WORKFLOW_EXECUTED",
    libraryId: data.libraryId,
    description: `Workflow executed for BOOK_RETURNED on book ${data.bookId}`
  });
});

eventBus.on("STUDENT_CREATED", async (data) => {
  // Send Welcome Email
  await AuditLog.create({
    action: "WORKFLOW_EXECUTED",
    libraryId: data.libraryId,
    description: `Workflow executed for STUDENT_CREATED on student ${data.studentId}`
  });
});

module.exports = eventBus;

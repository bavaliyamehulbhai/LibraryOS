// restart trigger - client defined fixed
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const http = require("http");
const app = require("./app");
const logger = require("./utils/logger");
const connectDB = require("./config/db");
const socket = require("./socket");

connectDB().then(async () => {
  try {
    const seedBooks = require("./seeders/bookSeeder");
    await seedBooks();
  } catch (err) {
    console.error("[Seeder] Error auto-seeding books:", err.message);
  }
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = socket.init(server);
io.on("connection", (client) => {
  console.log("Client connected via socket");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[CRITICAL] Port ${PORT} is already in use. Please terminate existing node processes.`);
  } else {
    console.error(`[Server Error]`, err);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Unhandled Rejection at]", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[Uncaught Exception]", err);
});

server.listen(PORT, () => {
  console.log(`[INFO] Server running on port ${PORT}`);
});

const cron = require("node-cron");
const AttendanceLog = require("./models/AttendanceLog");
const Visitor = require("./models/Visitor");

// Schedule task to run at 11:59 PM every day
cron.schedule("59 23 * * *", async () => {
  try {
    console.log("[CRON] Running auto-punch out for remaining attendees...");
    const exitTime = new Date();
    
    // Auto punch out members
    const activeLogs = await AttendanceLog.find({ status: "IN" });
    for (const log of activeLogs) {
      log.exitTime = exitTime;
      log.status = "OUT";
      log.autoPunchedOut = true;
      log.durationMinutes = Math.round((exitTime - log.entryTime) / 60000);
      await log.save();
    }

    // Auto punch out visitors
    const activeVisitors = await Visitor.find({ status: "IN" });
    for (const v of activeVisitors) {
      v.exitTime = exitTime;
      v.status = "OUT";
      v.autoPunchedOut = true;
      v.durationMinutes = Math.round((exitTime - v.entryTime) / 60000);
      await v.save();
    }
    
    console.log(`[CRON] Auto-punched out ${activeLogs.length} members and ${activeVisitors.length} visitors.`);
  } catch (error) {
    console.error("[CRON] Error during auto-punch out:", error);
  }
});

// Server export for testing / cluster
module.exports = server;

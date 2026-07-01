require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const http = require("http");
const app = require("./app");
const logger = require("./utils/logger");
const connectDB = require("./config/db");
const socket = require("./socket");

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = socket.init(server);
io.on("connection", (client) => {
  console.log("Client connected via socket");
});

server.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});




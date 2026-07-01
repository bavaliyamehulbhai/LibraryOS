require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("../src/models/Role");

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/libraryos");
  try {
    const defaultRoles = [
      { name: "Librarian", description: "Full access to library management", libraryId: "6a42008ce6842c143600a918", isSystem: false },
      { name: "Assistant", description: "Can manage books and users", libraryId: "6a42008ce6842c143600a918", isSystem: false },
      { name: "Member", description: "Can borrow and read books", libraryId: "6a42008ce6842c143600a918", isSystem: false }
    ];
    let roles = await Role.insertMany(defaultRoles);
    console.log("Inserted successfully");
    console.log(roles.map(r => typeof r.toObject));
  } catch (err) {
    console.error("Insert error:", err);
  }
  process.exit(0);
}

test();

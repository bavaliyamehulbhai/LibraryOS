const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== "production"
    });
    console.log(`Mongo Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;

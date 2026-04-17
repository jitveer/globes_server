const mongoose = require("mongoose");
const logger = require("../utils/logger.util");
const db = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(db);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

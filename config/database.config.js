const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    // Add database name to connection string if not present
    const dbUri = process.env.MONGODB_URI.endsWith("/")
      ? `${process.env.MONGODB_URI}globes_properties`
      : process.env.MONGODB_URI;

    const conn = await mongoose.connect(dbUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB Disconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;

require("dotenv").config();
const app = require("./app");
const connectDB = require("./shared/config/database.config");
const { initSocket } = require("./shared/config/socket.config");

const PORT = process.env.PORT || 5000;

//connect to database
connectDB();

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
  );
  console.log(`📡 Visit: http://localhost:${PORT}`);
});

// Initialize Socket.io
initSocket(server);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

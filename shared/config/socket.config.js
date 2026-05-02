const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
          process.env.FRONTEND_URL,
          process.env.FRONTEND_URL_PROD,
          "http://localhost:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5173",
        ].filter(Boolean);

        // In development, also allow any local network IP (192.168.x.x, 10.x.x.x, etc.)
        const isLocalNetwork =
          /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(
            origin,
          );

        if (
          allowedOrigins.includes(origin) ||
          isLocalNetwork ||
          process.env.NODE_ENV === "development"
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join a room based on userId for private notifications
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their notification room`);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };

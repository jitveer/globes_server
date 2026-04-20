const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const routes = require("./routes");
const mongoSanitize = require("./shared/middlewares/mongoSanitize.middleware");
const xss = require("./shared/middlewares/xss.middleware");
const errorHandler = require("./shared/middlewares/error.middleware");

const path = require("path");
const { apiLimiter } = require("./shared/middlewares/rateLimiter.middleware");

app.set("trust proxy", 1);
const app = express();

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP in dev or configure it properly
  }),
);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PROD,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize);

// Data sanitization against XSS
app.use(xss);

// Compression
app.use(compression());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// testapi
app.get("/testapi", (req, res) => {
  res.json({ message: "Test API is working" });
});

// API routes
app.use(`/api/${process.env.API_VERSION}`, apiLimiter, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Simple error handler
app.use(errorHandler);

module.exports = app;

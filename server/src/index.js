require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowingRoutes = require("./routes/borrowingRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

async function setupApp() {
  // Connect to Database
  await connectDB();

  // Middlewares
  app.use(cors()); // You might want to use the same detailed cors config as in app.js
  app.use(express.json());

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/books", bookRoutes);
  app.use("/api/borrowings", borrowingRoutes);
  app.use("/api/users", userRoutes);

  return app;
}

module.exports = setupApp();
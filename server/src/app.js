require("dotenv").config();
const cors = require("cors");

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowingRoutes = require("./routes/borrowingRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Middleware - must come before routes
    app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
    app.use(express.json());

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/books", bookRoutes);
    app.use("/api/borrowings", borrowingRoutes);
    app.use("/api/users", userRoutes);

    app.get("/", (req, res) => {
      res.send("Library Management System API Running");
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
require("dotenv").config();
const cors = require("cors");

const express = require("express");
const connectDB = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");
const app = express();

connectDB();

// Middleware - must come before routes
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/books", bookRoutes);

app.get("/", (req, res) => {
  res.send("Library Management System API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
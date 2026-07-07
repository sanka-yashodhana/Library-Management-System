const express = require("express");
const router = express.Router();
const {
    getMyBorrowings,
    getAllBorrowings,
    getDashboardStats,
    borrowBook,
    issueBook,
    returnBook
} = require("../controllers/borrowingController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Dashboard stats (librarian / admin)
router.get("/stats", protect, authorizeRoles("librarian", "admin"), getDashboardStats);

// Student — own borrowings + self-borrow
router.get("/my", protect, getMyBorrowings);
router.post("/borrow", protect, borrowBook);
router.put("/:id/return", protect, returnBook);

// Librarian — issue book to specific student
router.post("/issue", protect, authorizeRoles("librarian", "admin"), issueBook);

// Librarian / Admin — all borrowings
router.get("/", protect, authorizeRoles("librarian", "admin"), getAllBorrowings);

module.exports = router;

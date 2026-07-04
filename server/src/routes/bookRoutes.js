const express = require("express");
const router = express.Router();
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} = require("../controllers/bookController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Public — any authenticated user can browse books
router.get("/", protect, getAllBooks);
router.get("/:id", protect, getBookById);

// Librarian or Admin only
router.post("/", protect, authorizeRoles("librarian", "admin"), createBook);
router.put("/:id", protect, authorizeRoles("librarian", "admin"), updateBook);

// Admin only
router.delete("/:id", protect, authorizeRoles("admin"), deleteBook);

module.exports = router;

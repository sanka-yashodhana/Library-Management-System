const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
} = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Librarian / Admin — list & view users
router.get("/", protect, authorizeRoles("librarian", "admin"), getAllUsers);
router.get("/:id", protect, authorizeRoles("librarian", "admin"), getUserById);

// Admin only — role change & delete
router.put("/:id/role", protect, authorizeRoles("admin"), updateUserRole);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;

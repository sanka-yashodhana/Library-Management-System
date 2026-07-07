const User = require("../models/User");

// GET /api/users  — list users, filterable by role (librarian/admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const filter = {};
        if (req.query.role) filter.role = req.query.role;

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/:id/role  — admin changes a user's role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!["student", "librarian", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be student, librarian, or admin." });
        }

        // Prevent demoting the last admin
        if (role !== "admin") {
            const adminCount = await User.countDocuments({ role: "admin" });
            const target = await User.findById(req.params.id);
            if (target && target.role === "admin" && adminCount <= 1) {
                return res.status(400).json({ message: "Cannot change role of the last admin." });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/users/:id  — admin deletes a user
exports.deleteUser = async (req, res) => {
    try {
        // Prevent self-deletion
        if (String(req.params.id) === String(req.user.id)) {
            return res.status(400).json({ message: "You cannot delete your own account." });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ success: true, message: `User "${user.name}" has been deleted.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

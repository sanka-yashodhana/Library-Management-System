const Borrowing = require("../models/Borrowing");
const Book = require("../models/Book");
const User = require("../models/User");

// GET /api/borrowings/my  — current user's borrowings
exports.getMyBorrowings = async (req, res) => {
    try {
        const borrowings = await Borrowing.find({ userId: req.user.id })
            .populate("bookId", "title author coverColor isbn category rating")
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, borrowings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/borrowings  — all borrowings (librarian / admin)
exports.getAllBorrowings = async (req, res) => {
    try {
        const borrowings = await Borrowing.find()
            .populate("bookId", "title author coverColor isbn category rating")
            .populate("userId", "name email role studentId department")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, borrowings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/borrowings/stats  — dashboard stats for librarian / admin
exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Book counts
        const books = await Book.find({});
        const totalBooks = books.length;
        const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
        const availableCopies = books.reduce((s, b) => s + b.availableCopies, 0);
        const issuedCopies = totalCopies - availableCopies;

        // Student count
        const studentCount = await User.countDocuments({ role: "student" });

        // Borrowing counts
        const allBorrowings = await Borrowing.find({});

        // Client-side overdue normalisation: flag as overdue if active and past due date
        const overdueCount = allBorrowings.filter(
            (b) => (b.status === "overdue") ||
                   (b.status === "active" && new Date(b.dueDate) < now)
        ).length;

        const activeCount = allBorrowings.filter((b) => b.status === "active").length;

        const todayIssues = allBorrowings.filter(
            (b) => new Date(b.issueDate) >= todayStart
        ).length;

        // Category breakdown from books
        const categoryMap = {};
        books.forEach((b) => {
            if (!categoryMap[b.category]) {
                categoryMap[b.category] = { count: 0, available: 0 };
            }
            categoryMap[b.category].count += b.totalCopies;
            categoryMap[b.category].available += b.availableCopies;
        });

        const categoryStats = Object.entries(categoryMap)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 6)
            .map(([name, data]) => ({ name, ...data }));

        res.status(200).json({
            success: true,
            stats: {
                totalBooks,
                totalCopies,
                availableCopies,
                issuedCopies,
                studentCount,
                overdueCount,
                activeCount,
                todayIssues,
                categoryStats,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/borrowings/borrow  — student borrows a book
exports.borrowBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        if (!bookId) return res.status(400).json({ message: "bookId is required" });

        // Check book exists & has copies
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });
        if (book.availableCopies <= 0) {
            return res.status(400).json({ message: "No copies available for this book" });
        }

        // Check if user already has this book checked out
        const existing = await Borrowing.findOne({
            bookId,
            userId,
            status: { $in: ["active", "overdue"] }
        });
        if (existing) {
            return res.status(400).json({ message: "You already have this book checked out" });
        }

        // Calculate due date (14 days)
        const issueDate = new Date();
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 14);

        // Create borrowing record
        const borrowing = await Borrowing.create({
            bookId,
            userId,
            issueDate,
            dueDate,
            status: "active"
        });

        // Decrement available copies atomically
        await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });

        // Return populated borrowing
        const populated = await Borrowing.findById(borrowing._id)
            .populate("bookId", "title author coverColor isbn category rating")
            .populate("userId", "name email");

        res.status(201).json({ success: true, borrowing: populated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/borrowings/issue  — librarian issues a book to a specific student
exports.issueBook = async (req, res) => {
    try {
        const { bookId, userId } = req.body;

        if (!bookId || !userId) {
            return res.status(400).json({ message: "bookId and userId are required" });
        }

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });
        if (book.availableCopies <= 0) {
            return res.status(400).json({ message: "No copies available for this book" });
        }

        const existing = await Borrowing.findOne({
            bookId,
            userId,
            status: { $in: ["active", "overdue"] }
        });
        if (existing) {
            return res.status(400).json({ message: "This student already has this book checked out" });
        }

        const issueDate = new Date();
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 14);

        const borrowing = await Borrowing.create({
            bookId,
            userId,
            issueDate,
            dueDate,
            status: "active",
            issuedBy: req.user.id,
        });

        await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });

        const populated = await Borrowing.findById(borrowing._id)
            .populate("bookId", "title author coverColor isbn category rating")
            .populate("userId", "name email studentId department");

        res.status(201).json({ success: true, borrowing: populated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/borrowings/:id/return  — return a book
exports.returnBook = async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id);
        if (!borrowing) return res.status(404).json({ message: "Borrowing record not found" });

        // Only the borrower (or librarian/admin) can return
        if (
            String(borrowing.userId) !== String(req.user.id) &&
            req.user.role !== "librarian" &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Not authorized to return this book" });
        }

        if (borrowing.status === "returned") {
            return res.status(400).json({ message: "Book has already been returned" });
        }

        const now = new Date();
        if (new Date(borrowing.dueDate) < now) {
            const daysOverdue = Math.ceil((now - new Date(borrowing.dueDate)) / (1000 * 60 * 60 * 24));
            borrowing.fineAmount = daysOverdue * 20;
        }

        borrowing.status = "returned";
        borrowing.returnDate = now;
        await borrowing.save();

        // Increment available copies atomically
        await Book.findByIdAndUpdate(borrowing.bookId, { $inc: { availableCopies: 1 } });

        const populated = await Borrowing.findById(borrowing._id)
            .populate("bookId", "title author coverColor isbn category rating")
            .populate("userId", "name email studentId department");

        res.status(200).json({ success: true, borrowing: populated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

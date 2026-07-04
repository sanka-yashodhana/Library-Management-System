const Book = require("../models/book");

// GET /api/books
exports.getAllBooks = async (req, res) => {
    try {
        const { q, category } = req.query;
        const filter = {};

        if (category && category !== "All") {
            filter.category = category;
        }
        if (q) {
            filter.$or = [
                { title:   { $regex: q, $options: "i" } },
                { author:  { $regex: q, $options: "i" } },
                { isbn:    { $regex: q, $options: "i" } }
            ];
        }

        const books = await Book.find(filter).sort({ title: 1 });
        res.status(200).json({ success: true, books });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/books/:id
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.status(200).json({ success: true, book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/books  (admin / librarian)
exports.createBook = async (req, res) => {
    try {
        const existing = await Book.findOne({ isbn: req.body.isbn });
        if (existing) return res.status(400).json({ message: "A book with this ISBN already exists" });

        const book = new Book(req.body);
        await book.save();
        res.status(201).json({ success: true, book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/books/:id  (admin / librarian)
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.status(200).json({ success: true, book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/books/:id  (admin only)
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.status(200).json({ success: true, message: "Book deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

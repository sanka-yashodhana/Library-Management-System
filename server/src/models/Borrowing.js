const mongoose = require("mongoose");

const borrowingSchema = new mongoose.Schema(
    {
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        issueDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        dueDate: {
            type: Date,
            required: true
        },
        returnDate: {
            type: Date,
            default: null
        },
        fineAmount: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["active", "returned", "overdue"],
            default: "active"
        },
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Borrowing || mongoose.model("Borrowing", borrowingSchema);

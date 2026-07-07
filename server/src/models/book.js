const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        author: {
            type: String,
            required: true,
            trim: true
        },
        isbn: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Computer Science", "Literature", "Physics", "Mathematics",
                "History", "Biology", "Chemistry", "Social Science",
                "Business", "Self-Help", "Other"
            ]
        },
        totalCopies: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        availableCopies: {
            type: Number,
            required: true,
            min: 0,
            default: 1
        },
        coverColor: {
            type: String,
            default: "#4f46e5"
        },
        description: {
            type: String,
            default: ""
        },
        year: {
            type: Number
        },
        publisher: {
            type: String,
            default: ""
        },
        pages: {
            type: Number,
            default: 0
        },
        language: {
            type: String,
            default: "English"
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Book || mongoose.model("Book", bookSchema);

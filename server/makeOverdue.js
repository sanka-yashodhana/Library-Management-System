require("dotenv").config();
const mongoose = require("mongoose");
const Borrowing = require("./src/models/Borrowing");

async function makeOverdue() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Find the most recent active borrowing
        const borrowing = await Borrowing.findOne({ status: "active" }).sort({ createdAt: -1 });

        if (!borrowing) {
            console.log("No active borrowings found. Please borrow a book first from the student dashboard!");
            process.exit(0);
        }

        console.log(`Found active borrowing for book ID: ${borrowing.bookId}`);

        // Set due date to 5 days ago to simulate it being 5 days overdue
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5);
        
        borrowing.dueDate = pastDate;
        // Also adjust issue date so it makes sense (19 days ago since standard borrow is 14 days)
        const pastIssueDate = new Date();
        pastIssueDate.setDate(pastIssueDate.getDate() - 19);
        borrowing.issueDate = pastIssueDate;

        await borrowing.save();

        console.log("Successfully updated the borrowing record to be 5 days overdue.");
        console.log("Expected Fine: 5 days * Rs. 20 = Rs. 100");
        console.log("You can now refresh the browser to see the fine in My Borrowings and Admin Reports.");
        
    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

makeOverdue();

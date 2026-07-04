/**
 * Seed Script — populates MongoDB with 30 books and demo user accounts.
 * Run once with: node src/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("./config/db");
const Book = require("./models/Book");
const User = require("./models/User");

const books = [
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "978-0262033848", category: "Computer Science", totalCopies: 5, availableCopies: 5, coverColor: "#4f46e5", description: "A comprehensive introduction to the modern study of computer algorithms.", year: 2009, publisher: "MIT Press", pages: 1292, language: "English", rating: 4.8 },
  { title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", category: "Computer Science", totalCopies: 4, availableCopies: 4, coverColor: "#0891b2", description: "A handbook of agile software craftsmanship.", year: 2008, publisher: "Prentice Hall", pages: 431, language: "English", rating: 4.7 },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", category: "Literature", totalCopies: 6, availableCopies: 6, coverColor: "#d97706", description: "A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan.", year: 1925, publisher: "Scribner", pages: 180, language: "English", rating: 4.2 },
  { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "978-0553380163", category: "Physics", totalCopies: 3, availableCopies: 3, coverColor: "#7c3aed", description: "Hawking discusses the big bang, black holes, and superstring theory.", year: 1988, publisher: "Bantam Books", pages: 212, language: "English", rating: 4.6 },
  { title: "Calculus: Early Transcendentals", author: "James Stewart", isbn: "978-1285741550", category: "Mathematics", totalCopies: 8, availableCopies: 8, coverColor: "#059669", description: "James Stewart's Calculus texts are worldwide best-sellers.", year: 2015, publisher: "Cengage Learning", pages: 1368, language: "English", rating: 4.5 },
  { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", isbn: "978-0062316097", category: "History", totalCopies: 4, availableCopies: 4, coverColor: "#b45309", description: "A brief history of humankind from the Stone Age to the twenty-first century.", year: 2011, publisher: "Harper", pages: 443, language: "English", rating: 4.7 },
  { title: "Design Patterns", author: "Gang of Four", isbn: "978-0201633610", category: "Computer Science", totalCopies: 3, availableCopies: 3, coverColor: "#dc2626", description: "A catalog of simple and succinct solutions to commonly occurring design problems.", year: 1994, publisher: "Addison-Wesley", pages: 395, language: "English", rating: 4.6 },
  { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0061935466", category: "Literature", totalCopies: 5, availableCopies: 5, coverColor: "#0f766e", description: "Pulitzer Prize-winning masterwork of honor and injustice in the deep South.", year: 1960, publisher: "Harper Perennial", pages: 336, language: "English", rating: 4.8 },
  { title: "Linear Algebra and Its Applications", author: "Gilbert Strang", isbn: "978-0030105678", category: "Mathematics", totalCopies: 6, availableCopies: 6, coverColor: "#7c3aed", description: "Gilbert Strang demonstrates that linear algebra is a fascinating subject.", year: 2005, publisher: "Brooks Cole", pages: 487, language: "English", rating: 4.7 },
  { title: "The Origin of Species", author: "Charles Darwin", isbn: "978-0140439120", category: "Biology", totalCopies: 3, availableCopies: 3, coverColor: "#16a34a", description: "Darwin's observations engendered a paradigm shift in our thinking about life on Earth.", year: 1859, publisher: "Penguin Classics", pages: 432, language: "English", rating: 4.5 },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt & David Thomas", isbn: "978-0135957059", category: "Computer Science", totalCopies: 4, availableCopies: 4, coverColor: "#9333ea", description: "Examines the core process of software development.", year: 2019, publisher: "Addison-Wesley", pages: 352, language: "English", rating: 4.8 },
  { title: "1984", author: "George Orwell", isbn: "978-0451524935", category: "Literature", totalCopies: 7, availableCopies: 7, coverColor: "#374151", description: "A startling and haunting novel that creates an imaginary world.", year: 1949, publisher: "Signet Classic", pages: 328, language: "English", rating: 4.7 },
  { title: "Physics for Scientists and Engineers", author: "Raymond Serway", isbn: "978-1337553292", category: "Physics", totalCopies: 5, availableCopies: 5, coverColor: "#0284c7", description: "Superior focus on conceptual reasoning.", year: 2018, publisher: "Cengage Learning", pages: 1360, language: "English", rating: 4.4 },
  { title: "World History: Patterns of Interaction", author: "Roger Beck", isbn: "978-0547034997", category: "History", totalCopies: 4, availableCopies: 4, coverColor: "#92400e", description: "A comprehensive world history textbook.", year: 2012, publisher: "McDougal Littell", pages: 1184, language: "English", rating: 4.3 },
  { title: "JavaScript: The Good Parts", author: "Douglas Crockford", isbn: "978-0596517748", category: "Computer Science", totalCopies: 3, availableCopies: 3, coverColor: "#b45309", description: "Unearthing the JavaScript language's powerful features.", year: 2008, publisher: "O'Reilly Media", pages: 176, language: "English", rating: 4.5 },
  { title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0141439518", category: "Literature", totalCopies: 6, availableCopies: 6, coverColor: "#be185d", description: "The story follows Elizabeth Bennet as she deals with issues of manners and marriage.", year: 1813, publisher: "Penguin Classics", pages: 432, language: "English", rating: 4.6 },
  { title: "Quantum Mechanics", author: "David J. Griffiths", isbn: "978-1107179868", category: "Physics", totalCopies: 4, availableCopies: 4, coverColor: "#1d4ed8", description: "This bestselling undergraduate quantum mechanics textbook.", year: 2017, publisher: "Cambridge University Press", pages: 508, language: "English", rating: 4.7 },
  { title: "Discrete Mathematics", author: "Kenneth Rosen", isbn: "978-0073383095", category: "Mathematics", totalCopies: 5, availableCopies: 5, coverColor: "#0369a1", description: "Introductory discrete mathematics for students from a wide variety of majors.", year: 2011, publisher: "McGraw-Hill", pages: 1071, language: "English", rating: 4.3 },
  { title: "Atomic Habits", author: "James Clear", isbn: "978-0735211292", category: "Self-Help", totalCopies: 5, availableCopies: 5, coverColor: "#0f766e", description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones.", year: 2018, publisher: "Avery", pages: 320, language: "English", rating: 4.8 },
  { title: "The Art of War", author: "Sun Tzu", isbn: "978-1599869773", category: "History", totalCopies: 4, availableCopies: 4, coverColor: "#dc2626", description: "An ancient Chinese military treatise, one of the most influential strategy texts.", year: -500, publisher: "Filiquarian", pages: 64, language: "English", rating: 4.6 },
  { title: "Computer Networks", author: "Andrew S. Tanenbaum", isbn: "978-0132126953", category: "Computer Science", totalCopies: 4, availableCopies: 4, coverColor: "#6d28d9", description: "Tanenbaum takes a structured approach to explaining how networks work.", year: 2010, publisher: "Prentice Hall", pages: 960, language: "English", rating: 4.5 },
  { title: "Brave New World", author: "Aldous Huxley", isbn: "978-0060850524", category: "Literature", totalCopies: 5, availableCopies: 5, coverColor: "#047857", description: "A dystopian social science fiction novel set in a futuristic World State.", year: 1932, publisher: "Harper Perennial", pages: 311, language: "English", rating: 4.4 },
  { title: "Operating System Concepts", author: "Abraham Silberschatz", isbn: "978-1118063330", category: "Computer Science", totalCopies: 5, availableCopies: 5, coverColor: "#c2410c", description: "Known as the 'Dinosaur Book', one of the most popular CS textbooks.", year: 2018, publisher: "Wiley", pages: 944, language: "English", rating: 4.6 },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", isbn: "978-0374533557", category: "Self-Help", totalCopies: 4, availableCopies: 4, coverColor: "#1e3a5f", description: "Kahneman explains the two systems that drive the way we think.", year: 2011, publisher: "Farrar Straus and Giroux", pages: 499, language: "English", rating: 4.6 },
  { title: "Database System Concepts", author: "Abraham Silberschatz", isbn: "978-0073523323", category: "Computer Science", totalCopies: 4, availableCopies: 4, coverColor: "#065f46", description: "One of the cornerstone texts of database education.", year: 2010, publisher: "McGraw-Hill", pages: 1376, language: "English", rating: 4.5 },
  { title: "The Alchemist", author: "Paulo Coelho", isbn: "978-0062315007", category: "Literature", totalCopies: 6, availableCopies: 6, coverColor: "#92400e", description: "A special 25th anniversary edition of the extraordinary international bestseller.", year: 1988, publisher: "HarperOne", pages: 197, language: "English", rating: 4.5 },
  { title: "Introduction to Psychology", author: "David G. Myers", isbn: "978-1319066871", category: "Social Science", totalCopies: 5, availableCopies: 5, coverColor: "#9d174d", description: "Myers' Psychology has won the hearts of students and instructors worldwide.", year: 2018, publisher: "Worth Publishers", pages: 752, language: "English", rating: 4.4 },
  { title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", isbn: "978-0134610993", category: "Computer Science", totalCopies: 3, availableCopies: 3, coverColor: "#1e40af", description: "The most comprehensive, up-to-date introduction to AI.", year: 2020, publisher: "Pearson", pages: 1132, language: "English", rating: 4.7 },
  { title: "Organic Chemistry", author: "Paula Yurkanis Bruice", isbn: "978-0134042282", category: "Chemistry", totalCopies: 4, availableCopies: 4, coverColor: "#15803d", description: "Known for its student-friendly writing style and problem-solving emphasis.", year: 2016, publisher: "Pearson", pages: 1440, language: "English", rating: 4.3 },
  { title: "The Lean Startup", author: "Eric Ries", isbn: "978-0307887894", category: "Business", totalCopies: 4, availableCopies: 4, coverColor: "#b91c1c", description: "How Today's Entrepreneurs Use Continuous Innovation to Create Successful Businesses.", year: 2011, publisher: "Crown Business", pages: 336, language: "English", rating: 4.5 },
];

const demoUsers = [
  { name: "Alex Johnson",     email: "student@lms.edu",   password: "student123", role: "student" },
  { name: "Sarah Mitchell",   email: "librarian@lms.edu", password: "lib123",     role: "librarian" },
  { name: "Dr. Michael Adams",email: "admin@lms.edu",     password: "admin123",   role: "admin" },
];

async function seed() {
    await connectDB();

    // --- Seed Books ---
    const existingBooks = await Book.countDocuments();
    if (existingBooks > 0) {
        console.log(`📚 Books collection already has ${existingBooks} documents — skipping book seed.`);
    } else {
        await Book.insertMany(books);
        console.log(`✅ Inserted ${books.length} books into MongoDB.`);
    }

    // --- Seed Demo Users ---
    for (const u of demoUsers) {
        const exists = await User.findOne({ email: u.email });
        if (exists) {
            console.log(`👤 User ${u.email} already exists — skipping.`);
        } else {
            const hashedPassword = await bcrypt.hash(u.password, 10);
            await User.create({ ...u, password: hashedPassword });
            console.log(`✅ Created demo user: ${u.email} (${u.role})`);
        }
    }

    console.log("\n🎉 Seed complete!");
    console.log("   Demo accounts:");
    console.log("   student@lms.edu   / student123");
    console.log("   librarian@lms.edu / lib123");
    console.log("   admin@lms.edu     / admin123");

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
});

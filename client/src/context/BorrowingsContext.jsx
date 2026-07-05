import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import booksApi from '../api/books';
import borrowingsApi from '../api/borrowings';

const BorrowingsContext = createContext(null);

export function BorrowingsProvider({ children }) {
  const { token, isAuthenticated } = useAuth();

  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [borrowingsLoading, setBorrowingsLoading] = useState(true);
  const [booksError, setBooksError] = useState('');
  const [borrowingsError, setBorrowingsError] = useState('');

  // ── Fetch books from API ──────────────────────────────────────────────────
  const fetchBooks = useCallback(async () => {
    if (!token) return;
    setBooksLoading(true);
    setBooksError('');
    const result = await booksApi.getAll(token);
    if (result.success) {
      setBooks(result.books);
    } else {
      setBooksError(result.error);
    }
    setBooksLoading(false);
  }, [token]);

  // ── Fetch borrowings from API ─────────────────────────────────────────────
  const fetchBorrowings = useCallback(async () => {
    if (!token) return;
    setBorrowingsLoading(true);
    setBorrowingsError('');
    const result = await borrowingsApi.getMyBorrowings(token);
    if (result.success) {
      setBorrowings(result.borrowings);
    } else {
      setBorrowingsError(result.error);
    }
    setBorrowingsLoading(false);
  }, [token]);

  // Load on mount / when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchBooks();
      fetchBorrowings();
    } else {
      setBooks([]);
      setBorrowings([]);
      setBooksLoading(false);
      setBorrowingsLoading(false);
    }
  }, [isAuthenticated, token, fetchBooks, fetchBorrowings]);

  // ── Borrow a book ─────────────────────────────────────────────────────────
  const borrowBook = async (book) => {
    const bookId = book._id;
    const result = await borrowingsApi.borrowBook(bookId, token);
    if (result.success) {
      // Update local book available copies optimistically
      setBooks(prev =>
        prev.map(b => b._id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b)
      );
      // Add new borrowing to local state
      setBorrowings(prev => [result.borrowing, ...prev]);
      const due = result.borrowing.dueDate;
      return { success: true, dueDate: due };
    }
    return { success: false, error: result.error };
  };

  // ── Return a book ─────────────────────────────────────────────────────────
  const returnBook = async (borrowingId) => {
    const result = await borrowingsApi.returnBook(borrowingId, token);
    if (result.success) {
      // Find the bookId from local state
      const borrowing = borrowings.find(b => b._id === borrowingId);
      if (borrowing) {
        const bookId = borrowing.bookId?._id || borrowing.bookId;
        setBooks(prev =>
          prev.map(b => b._id === bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b)
        );
      }
      setBorrowings(prev =>
        prev.map(b =>
          b._id === borrowingId
            ? { ...b, status: 'returned', returnDate: new Date().toISOString() }
            : b
        )
      );
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  /**
   * Returns borrowings for the current user, each enriched with a .book property.
   * Since the API populates bookId, we map it to .book for UI compatibility.
   */
  const getUserBorrowings = () => {
    return borrowings.map(b => ({
      ...b,
      book: b.bookId, // bookId is populated by the server as the full book object
    }));
  };

  /**
   * Check if a book (by _id) is currently borrowed by the logged-in user.
   */
  const isBookBorrowed = (bookId) => {
    return borrowings.some(
      b =>
        String(b.bookId?._id || b.bookId) === String(bookId) &&
        (b.status === 'active' || b.status === 'overdue')
    );
  };

  return (
    <BorrowingsContext.Provider
      value={{
        books,
        borrowings,
        booksLoading,
        borrowingsLoading,
        booksError,
        borrowingsError,
        borrowBook,
        returnBook,
        getUserBorrowings,
        isBookBorrowed,
        refreshBooks: fetchBooks,
        refreshBorrowings: fetchBorrowings,
      }}
    >
      {children}
    </BorrowingsContext.Provider>
  );
}

export function useBorrowings() {
  const ctx = useContext(BorrowingsContext);
  if (!ctx) throw new Error('useBorrowings must be used within BorrowingsProvider');
  return ctx;
}

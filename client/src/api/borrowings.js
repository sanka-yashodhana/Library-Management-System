const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const borrowingsApi = {
  /**
   * Fetch the current user's borrowings.
   */
  getMyBorrowings: async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/borrowings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to fetch borrowings' };
      return { success: true, borrowings: data.borrowings };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Fetch all borrowings (librarian / admin).
   */
  getAllBorrowings: async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/borrowings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to fetch borrowings' };
      return { success: true, borrowings: data.borrowings };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Fetch aggregate dashboard stats (librarian / admin).
   */
  getDashboardStats: async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/borrowings/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to fetch stats' };
      return { success: true, stats: data.stats };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Student borrows a book (self-service).
   */
  borrowBook: async (bookId, token) => {
    try {
      const response = await fetch(`${API_URL}/api/borrowings/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to borrow book' };
      return { success: true, borrowing: data.borrowing };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Librarian issues a book to a specific student.
   */
  issueBook: async (bookId, userId, token) => {
    try {
      const response = await fetch(`${API_URL}/api/borrowings/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, userId }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to issue book' };
      return { success: true, borrowing: data.borrowing };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Return a book by borrowing record _id.
   */
  returnBook: async (borrowingId, token) => {
    try {
      const response = await fetch(`${API_URL}/api/borrowings/${borrowingId}/return`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to return book' };
      return { success: true, borrowing: data.borrowing };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },
};

export default borrowingsApi;

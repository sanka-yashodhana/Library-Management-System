const API_URL = import.meta.env.VITE_API_URL || "";

const booksApi = {
  /**
   * Fetch all books. Supports optional ?q= and ?category= query params.
   */
  getAll: async (token, { q = '', category = 'All' } = {}) => {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category && category !== 'All') params.set('category', category);

      const url = `${API_URL}/api/books${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to fetch books' };
      return { success: true, books: data.books };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Fetch a single book by MongoDB _id.
   */
  getById: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Book not found' };
      return { success: true, book: data.book };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Create a new book (librarian / admin).
   */
  createBook: async (bookData, token) => {
    try {
      const response = await fetch(`${API_URL}/api/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to create book' };
      return { success: true, book: data.book };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Update a book by _id (librarian / admin).
   */
  updateBook: async (id, bookData, token) => {
    try {
      const response = await fetch(`${API_URL}/api/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to update book' };
      return { success: true, book: data.book };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Delete a book by _id (admin only).
   */
  deleteBook: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/api/books/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to delete book' };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },
};

export default booksApi;

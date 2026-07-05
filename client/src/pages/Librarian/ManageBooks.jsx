import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable/DataTable';
import Modal from '../../components/Model/Model';
import BookForm from '../../components/BookForm/BookForm';
import SearchBar from '../../components/SearchBar/SearchBar';
import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import booksApi from '../../api/books';
import './ManageBooks.css';

const CATEGORIES = [
  'All', 'Computer Science', 'Literature', 'Physics', 'Mathematics',
  'History', 'Biology', 'Chemistry', 'Social Science', 'Business', 'Self-Help', 'Other',
];

export default function ManageBooks() {
  const { token } = useAuth();

  const [bookList, setBookList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await booksApi.getAll(token);
    if (res.success) {
      setBookList(res.books);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Client-side filter (fast; avoids extra round-trips on every keystroke)
  const filtered = bookList.filter((b) => {
    const q = query.toLowerCase();
    const matchQ =
      !query ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.isbn && b.isbn.toLowerCase().includes(q));
    const matchC = category === 'All' || b.category === category;
    return matchQ && matchC;
  });

  const handleAdd = async (data) => {
    setSaving(true);
    const res = await booksApi.createBook(data, token);
    setSaving(false);
    if (res.success) {
      setBookList((prev) => [res.book, ...prev]);
      setModalOpen(false);
      showToast(`"${res.book.title}" has been added to the collection!`);
    } else {
      showToast(res.error || 'Failed to add book', 'error');
    }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    const res = await booksApi.updateBook(editBook._id, data, token);
    setSaving(false);
    if (res.success) {
      setBookList((prev) => prev.map((b) => (b._id === editBook._id ? res.book : b)));
      setEditBook(null);
      setModalOpen(false);
      showToast(`"${res.book.title}" has been updated!`);
    } else {
      showToast(res.error || 'Failed to update book', 'error');
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    const res = await booksApi.deleteBook(deleteConfirm._id, token);
    setSaving(false);
    if (res.success) {
      setBookList((prev) => prev.filter((b) => b._id !== deleteConfirm._id));
      showToast(`"${deleteConfirm.title}" has been removed.`);
      setDeleteConfirm(null);
    } else {
      showToast(res.error || 'Failed to delete book', 'error');
      setDeleteConfirm(null);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (v, row) => (
        <div className="manage-book-cell">
          <div className="manage-book-cover" style={{ backgroundColor: row.coverColor || '#4f46e5' }}>
            {v.charAt(0)}
          </div>
          <div>
            <p className="manage-book-title">{v}</p>
            <p className="manage-book-author">{row.author}</p>
          </div>
        </div>
      ),
    },
    { key: 'isbn', label: 'ISBN', sortable: false },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (v) => <span className="cat-chip">{v}</span>,
    },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'availableCopies',
      label: 'Availability',
      sortable: true,
      render: (v, row) => (
        <div className="avail-cell">
          <span className={`avail-badge-sm ${v > 0 ? 'yes' : 'no'}`}>
            {v}/{row.totalCopies}
          </span>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (v) => <span className="rating-cell">★ {v ?? '—'}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="manage-books">
        <div className="manage-loading">
          <div className="loading-spinner" />
          <p>Loading books…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-books">
        <div className="manage-error">
          <AlertTriangle size={40} />
          <p>{error}</p>
          <button className="manage-retry-btn" onClick={fetchBooks}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-books">
      {toast.msg && (
        <div className={`success-toast ${toast.type === 'error' ? 'error-toast' : ''}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}} /> : <CheckCircle2 size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}} />} {toast.msg}
        </div>
      )}

      <div className="manage-header">
        <div>
          <h2>Manage Books</h2>
          <p>{bookList.length} books in collection</p>
        </div>
        <button
          className="add-book-btn"
          onClick={() => { setEditBook(null); setModalOpen(true); }}
        >
          + Add New Book
        </button>
      </div>

      <SearchBar
        onSearch={setQuery}
        onCategory={setCategory}
        categories={CATEGORIES}
        placeholder="Search books by title, author or ISBN…"
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No books found"
        actions={(row) => (
          <>
            <button
              className="action-btn edit"
              onClick={() => { setEditBook(row); setModalOpen(true); }}
            >
              Edit
            </button>
            <button
              className="action-btn delete"
              onClick={() => setDeleteConfirm(row)}
            >
              Delete
            </button>
          </>
        )}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditBook(null); }}
        title={editBook ? 'Edit Book' : 'Add New Book'}
        size="large"
      >
        <BookForm
          initialData={editBook}
          onSubmit={editBook ? handleEdit : handleAdd}
          onCancel={() => { setModalOpen(false); setEditBook(null); }}
          saving={saving}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Book"
        size="small"
      >
        {deleteConfirm && (
          <div className="delete-confirm">
            <div className="delete-icon"><Trash2 size={40} /></div>
            <p>
              Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?
            </p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="delete-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete Book'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

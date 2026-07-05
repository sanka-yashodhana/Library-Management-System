import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable/DataTable';
import Modal from '../../components/Model/Model';
import BookForm from '../../components/BookForm/BookForm';
import SearchBar from '../../components/SearchBar/SearchBar';
import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import booksApi from '../../api/books';
import './AdminBooks.css';

const CATEGORIES = [
  'All', 'Computer Science', 'Literature', 'Physics', 'Mathematics',
  'History', 'Biology', 'Chemistry', 'Social Science', 'Business', 'Self-Help', 'Other',
];

export default function AdminBooks() {
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

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const filtered = bookList.filter(b => {
    const q = query.toLowerCase();
    const matchQ = !query ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.isbn && b.isbn.toLowerCase().includes(q));
    const matchC = category === 'All' || b.category === category;
    return matchQ && matchC;
  });

  const totalCopies = bookList.reduce((a, b) => a + b.totalCopies, 0);
  const availCopies = bookList.reduce((a, b) => a + b.availableCopies, 0);

  const handleAdd = async (data) => {
    setSaving(true);
    const res = await booksApi.createBook(data, token);
    setSaving(false);
    if (res.success) {
      setBookList(prev => [res.book, ...prev]);
      setModalOpen(false);
      showToast(`"${res.book.title}" has been added!`);
    } else {
      showToast(res.error || 'Failed to add book', 'error');
    }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    const res = await booksApi.updateBook(editBook._id, data, token);
    setSaving(false);
    if (res.success) {
      setBookList(prev => prev.map(b => b._id === editBook._id ? res.book : b));
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
      setBookList(prev => prev.filter(b => b._id !== deleteConfirm._id));
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
      label: 'Book',
      sortable: true,
      render: (v, row) => (
        <div className="admin-book-cell">
          <div className="admin-book-cover" style={{ backgroundColor: row.coverColor || '#4f46e5' }}>
            {v.charAt(0)}
          </div>
          <div>
            <p className="admin-book-title">{v}</p>
            <p className="admin-book-author">{row.author}</p>
          </div>
        </div>
      ),
    },
    { key: 'isbn', label: 'ISBN' },
    { key: 'category', label: 'Category', sortable: true, render: (v) => <span className="cat-chip">{v}</span> },
    { key: 'publisher', label: 'Publisher', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    { key: 'totalCopies', label: 'Total', sortable: true },
    {
      key: 'availableCopies',
      label: 'Available',
      sortable: true,
      render: (v, row) => (
        <span className={`avail-badge-sm ${v > 0 ? 'yes' : 'no'}`}>{v}/{row.totalCopies}</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="admin-books">
        <div className="admin-books-loading"><div className="ab-spinner" /><p>Loading inventory…</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-books">
        <div className="admin-books-error"><AlertTriangle size={40} /><p>{error}</p>
          <button className="admin-books-retry" onClick={fetchBooks}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-books">
      {toast.msg && (
        <div className={`success-toast ${toast.type === 'error' ? 'error-toast' : ''}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}/> : <CheckCircle2 size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}/>} {toast.msg}
        </div>
      )}

      <div className="admin-books-header">
        <div>
          <h2>Book Inventory</h2>
          <p>{bookList.length} titles · {totalCopies} total copies · {availCopies} available</p>
        </div>
        <button className="add-book-btn" onClick={() => { setEditBook(null); setModalOpen(true); }}>
          + Add Book
        </button>
      </div>

      <SearchBar
        onSearch={setQuery}
        onCategory={setCategory}
        categories={CATEGORIES}
        placeholder="Search books by title, author, or ISBN..."
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No books found"
        actions={(row) => (
          <>
            <button className="action-btn edit" onClick={() => { setEditBook(row); setModalOpen(true); }}>Edit</button>
            <button className="action-btn delete" onClick={() => setDeleteConfirm(row)}>Delete</button>
          </>
        )}
      />

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

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Book"
        size="small"
      >
        {deleteConfirm && (
          <div className="delete-confirm">
            <div className="delete-icon"><Trash2 size={40} /></div>
            <p>Delete <strong>"{deleteConfirm.title}"</strong>?</p>
            <p className="delete-warn">This action cannot be undone.</p>
            <div className="delete-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import Modal from '../../components/Modal/Modal';
import { useAuth } from '../../context/AuthContext';
import { useBorrowings } from '../../context/BorrowingsContext';
import { Search, BookOpen, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './BrowseBooks.css';

const categories = [
  'All', 'Computer Science', 'Literature', 'Physics', 'Mathematics',
  'History', 'Biology', 'Chemistry', 'Social Science', 'Business', 'Self-Help'
];

const SORT_OPTIONS = [
  { value: 'title-asc',   label: 'Title A–Z' },
  { value: 'title-desc',  label: 'Title Z–A' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'year-desc',   label: 'Newest First' },
  { value: 'avail',       label: 'Available First' },
];

const PAGE_SIZE = 12;

export default function BrowseBooks() {
  const { user } = useAuth();
  const { books, booksLoading, booksError, borrowBook, isBookBorrowed } = useBorrowings();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('title-asc');
  const [confirmBook, setConfirmBook] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [page, setPage] = useState(1);

  // Filter
  const filtered = useMemo(() => {
    let list = books.filter(b => {
      const matchQ = query === '' ||
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.author.toLowerCase().includes(query.toLowerCase()) ||
        (b.isbn || '').includes(query);
      const matchC = category === 'All' || b.category === category;
      return matchQ && matchC;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'title-asc':   return a.title.localeCompare(b.title);
        case 'title-desc':  return b.title.localeCompare(a.title);
        case 'rating-desc': return b.rating - a.rating;
        case 'year-desc':   return b.year - a.year;
        case 'avail':       return b.availableCopies - a.availableCopies;
        default:            return 0;
      }
    });
    return list;
  }, [books, query, category, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q) => { setQuery(q); setPage(1); };
  const handleCategory = (c) => { setCategory(c); setPage(1); };
  const handleSort = (s) => { setSort(s); setPage(1); };

  const handleBorrow = (book) => {
    if (isBookBorrowed(book._id)) {
      alert('You already have this book checked out.');
      return;
    }
    setConfirmBook(book);
  };

  const confirmBorrow = async () => {
    const result = await borrowBook(confirmBook);
    setConfirmBook(null);
    if (result.success) {
      const due = new Date(result.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      setSuccessMsg(`"${confirmBook.title}" borrowed! Due: ${due}`);
      setTimeout(() => setSuccessMsg(''), 6000);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="browse-books">
      {booksLoading && (
        <div className="browse-loading">
          <div className="loading-spinner" />
          <p>Loading book collection...</p>
        </div>
      )}
      {booksError && !booksLoading && (
        <div className="browse-error">
          <AlertTriangle size={14} strokeWidth={2} style={{display:'inline', marginRight:5, verticalAlign:'middle'}} />
          {booksError}
        </div>
      )}
      {successMsg && (
        <div className="borrow-success">
          <CheckCircle2 size={14} strokeWidth={2} style={{display:'inline', marginRight:6, verticalAlign:'middle'}} />
          {successMsg}
        </div>
      )}

      <div className="browse-header">
        <div>
          <h2 className="browse-title">Book Collection</h2>
          <p className="browse-sub">{filtered.length} book{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="browse-sort-wrap">
          <label className="browse-sort-label">Sort by</label>
          <select
            className="browse-sort-select"
            value={sort}
            onChange={e => handleSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <SearchBar
        onSearch={handleSearch}
        onCategory={handleCategory}
        categories={categories}
        placeholder="Search by title, author, or ISBN..."
      />

      {paginated.length === 0 ? (
        <div className="browse-empty">
          <Search size={48} strokeWidth={1} />
          <p>No books match your search</p>
          <small>Try different keywords or select a different category</small>
        </div>
      ) : (
        <div className="books-list">
          {paginated.map(book => {
            const alreadyBorrowed = isBookBorrowed(book._id);
            const available = book.availableCopies > 0;
            return (
              <div
                key={book._id}
                className="book-list-item"
                onClick={() => navigate(`/student/books/${book._id}`)}
              >
                <div className="book-list-cover" style={{ backgroundColor: book.coverColor || '#3b82f6' }}>
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="book-cover-img" />
                  ) : (
                    <span className="book-cover-fallback">{book.title.charAt(0)}</span>
                  )}
                </div>
                <div className="book-list-info">
                  <h3 className="book-list-title">{book.title}</h3>
                  <p className="book-list-meta">
                    {book.author} • {book.category} • {book.year > 0 ? book.year : `${Math.abs(book.year)} BC`}
                  </p>
                </div>
                <div className="book-list-status">
                   <div className="book-list-rating">★ {book.rating}</div>
                   <div className={`book-list-badge ${available ? 'avail-yes' : 'avail-no'}`}>
                     {available ? `${book.availableCopies} Available` : 'Unavailable'}
                   </div>
                </div>
                <div className="book-list-actions">
                  <button
                    className={`book-list-btn ${(!available || alreadyBorrowed) ? 'disabled' : ''}`}
                    disabled={!available || alreadyBorrowed}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBorrow(book);
                    }}
                  >
                    {alreadyBorrowed ? 'Borrowed' : available ? 'Borrow' : 'Unavailable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="browse-pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`page-num ${page === p ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Borrow Confirmation Modal */}
      <Modal
        isOpen={!!confirmBook}
        onClose={() => setConfirmBook(null)}
        title="Confirm Borrowing"
        size="small"
      >
        {confirmBook && (
          <div className="borrow-confirm">
            <div className="borrow-confirm-book">
              <div className="borrow-confirm-cover" style={{ background: `linear-gradient(135deg, ${confirmBook.coverColor}, ${confirmBook.coverColor}99)` }}>
                <BookOpen size={24} />
              </div>
              <div>
                <h4>{confirmBook.title}</h4>
                <p>{confirmBook.author}</p>
              </div>
            </div>
            <div className="borrow-confirm-info">
              <div className="borrow-info-row">
                <span><Clock size={16} /> Loan Period</span>
                <strong>14 days</strong>
              </div>
              <div className="borrow-info-row">
                <span>Due Date</span>
                <strong>{getDueDate()}</strong>
              </div>
              <div className="borrow-info-row">
                <span>Available Copies</span>
                <strong>{confirmBook.availableCopies}</strong>
              </div>
            </div>
            <div className="bm-warning">
              <AlertTriangle size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'4px'}}/> Please return the book on or before the due date to avoid penalties.
            </div>
            <div className="borrow-confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirmBook(null)}>Cancel</button>
              <button className="btn-primary" onClick={confirmBorrow}>Confirm Borrow</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function getDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

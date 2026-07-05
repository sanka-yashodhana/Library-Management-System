import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import borrowingsApi from '../../api/borrowings';
import DataTable from '../../components/DataTable/DataTable';
import {
  BookOpen,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TriangleAlert,
  Library,
} from 'lucide-react';
import './MyBorrowings.css';

const FILTERS = [
  { key: 'all',      label: 'All',      cls: 'filter-all' },
  { key: 'active',   label: 'Active',   cls: 'filter-active' },
  { key: 'overdue',  label: 'Overdue',  cls: 'filter-overdue' },
  { key: 'returned', label: 'Returned', cls: 'filter-returned' },
];

const COVER_COLORS = ['#325FE8', '#EE582C', '#DCAD26', '#A551FF', '#10b981', '#f59e0b'];

export default function MyBorrowings() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filter, setFilter]         = useState('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [returningId, setReturningId] = useState(null);

  const fetchBorrowings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await borrowingsApi.getMyBorrowings(token);
      if (!res.success) throw new Error(res.error);

      const now = new Date();
      const normalised = res.borrowings.map((b) => {
        if (b.status === 'active' && new Date(b.dueDate) < now) {
          return { ...b, status: 'overdue' };
        }
        return b;
      });
      setBorrowings(normalised);
    } catch (err) {
      setError(err.message || 'Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBorrowings();
  }, [fetchBorrowings]);

  const handleReturn = async (borrowingId, bookTitle) => {
    setReturningId(borrowingId);
    try {
      const res = await borrowingsApi.returnBook(borrowingId, token);
      if (!res.success) throw new Error(res.error);
      setSuccessMsg(`"${bookTitle}" returned successfully!`);
      setTimeout(() => setSuccessMsg(''), 5000);
      await fetchBorrowings();
    } catch (err) {
      alert(err.message || 'Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

  // Counts for filter badges
  const counts = {
    all:      borrowings.length,
    active:   borrowings.filter((b) => b.status === 'active').length,
    overdue:  borrowings.filter((b) => b.status === 'overdue').length,
    returned: borrowings.filter((b) => b.status === 'returned').length,
  };

  const filtered =
    filter === 'all' ? borrowings : borrowings.filter((b) => b.status === filter);

  // ── DataTable columns ──────────────────────────────────────────────────────
  const columns = [
    {
      key:   'book',
      label: 'Book',
      render: (_, row) => {
        const book = row.bookId;
        const idx  = borrowings.indexOf(row) % COVER_COLORS.length;
        const color = book?.coverColor || COVER_COLORS[idx];
        return (
          <div className="borrowing-book-cell">
            <div
              className="borrowing-book-cover"
              style={{ backgroundColor: color }}
            >
              {book?.title ? book.title.charAt(0) : <BookOpen size={18} />}
            </div>
            <div>
              <p className="borrowing-book-title">{book?.title || 'Unknown Book'}</p>
              <p className="borrowing-book-author">{book?.author || '—'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key:      'issueDate',
      label:    'Issue Date',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key:      'dueDate',
      label:    'Due Date',
      sortable: true,
      render: (val, row) => (
        <span style={{ color: row.status === 'overdue' ? '#ef4444' : 'inherit' }}>
          {formatDate(val)}
        </span>
      ),
    },
    {
      key:   'returnDate',
      label: 'Returned On',
      render: (val) => val ? formatDate(val) : <span className="text-muted">—</span>,
    },
    {
      key:   'status',
      label: 'Status',
      render: (val) => (
        <span className={`status-badge status-${val}`}>{val}</span>
      ),
    },
  ];

  const actions = (row) => {
    const book = row.bookId;
    const title = book?.title || 'this book';
    if (row.status === 'returned') {
      return <span className="returned-label">Returned</span>;
    }
    return (
      <button
        className="return-btn"
        disabled={returningId === row._id}
        onClick={() => handleReturn(row._id, title)}
      >
        {returningId === row._id ? (
          'Returning…'
        ) : (
          <>
            <RotateCcw size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Return
          </>
        )}
      </button>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="my-borrowings">
        <div className="borrowings-loading">
          <div className="loading-spinner" />
          <p>Loading your borrowings…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-borrowings">
        <div className="borrowings-loading">
          <TriangleAlert size={44} strokeWidth={1.5} color="#ef4444" opacity={0.6} />
          <p style={{ color: '#ef4444' }}>{error}</p>
          <button className="browse-more-btn" onClick={fetchBorrowings}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-borrowings">
      {/* Success toast */}
      {successMsg && (
        <div className="return-success">
          <CheckCircle2
            size={14}
            style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}
          />
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="borrowings-header">
        <div>
          <h2>My Borrowings</h2>
          <p>
            {counts.active > 0 && (
              <>
                <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {counts.active} active
              </>
            )}
            {counts.overdue > 0 && (
              <>
                {counts.active > 0 && ' · '}
                <AlertTriangle size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, color: '#ef4444' }} />
                <span style={{ color: '#ef4444' }}>{counts.overdue} overdue</span>
              </>
            )}
            {counts.active === 0 && counts.overdue === 0 && (
              <>
                <Library size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {counts.returned} book{counts.returned !== 1 ? 's' : ''} returned
              </>
            )}
          </p>
        </div>
        <button className="browse-more-btn" onClick={() => navigate('/student/books')}>
          Browse Books
        </button>
      </div>

      {/* Filter buttons */}
      <div className="borrowing-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-btn ${f.cls} ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="filter-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="borrowings-empty">
          <Library size={52} strokeWidth={1.25} />
          <h3>No {filter !== 'all' ? filter : ''} borrowings found</h3>
          <p>
            {filter === 'all'
              ? "You haven't borrowed any books yet."
              : `You have no ${filter} borrowings.`}
          </p>
          {filter === 'all' && (
            <button className="browse-more-btn" onClick={() => navigate('/student/books')}>
              Browse Books
            </button>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          actions={actions}
          emptyMessage="No borrowings found"
        />
      )}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

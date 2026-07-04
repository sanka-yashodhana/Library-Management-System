import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard/StatCard';
import borrowingsApi from '../../api/borrowings';
import booksApi from '../../api/books';
import { BookOpen, AlertTriangle, CheckCircle2, Library, Inbox, TriangleAlert, ChevronRight } from 'lucide-react';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [borrowings, setBorrowings] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch borrowings and all books in parallel
      const [borrowRes, booksRes] = await Promise.all([
        borrowingsApi.getMyBorrowings(token),
        booksApi.getAll(token),
      ]);

      if (!borrowRes.success) throw new Error(borrowRes.error);
      if (!booksRes.success) throw new Error(booksRes.error);

      // Normalise overdue status client-side based on dueDate
      const now = new Date();
      const normalisedBorrowings = borrowRes.borrowings.map((b) => {
        if (b.status === 'active' && new Date(b.dueDate) < now) {
          return { ...b, status: 'overdue' };
        }
        return b;
      });

      setBorrowings(normalisedBorrowings);

      // Compute available books count
      const books = booksRes.books;
      const available = books.filter((b) => b.availableCopies > 0);
      setAvailableCount(available.length);

      // Top-rated books (sorted by rating desc, pick 4)
      const sorted = [...books].sort((a, b) => b.rating - a.rating).slice(0, 4);
      setTopBooks(sorted);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived stats
  const active = borrowings.filter((b) => b.status === 'active');
  const overdue = borrowings.filter((b) => b.status === 'overdue');
  const returned = borrowings.filter((b) => b.status === 'returned');

  // Recent activity — 5 latest borrowings
  const recentActivity = [...borrowings]
    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-error">
          <TriangleAlert size={44} strokeWidth={1.5} color="#ef4444" opacity={0.6} />
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-welcome">
        <div className="welcome-text">
          <h2>Good {getGreeting()}, {user.name.split(' ')[0]}! 👋</h2>
          <p>Here's an overview of your library activity</p>
        </div>
        <div className="welcome-avatar" style={{ backgroundColor: user.avatarColor }}>
          {user.avatarInitials}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<BookOpen size={22} strokeWidth={1.75} />}
          label="Books Borrowed"
          value={active.length + overdue.length}
          sub="Currently checked out"
          color="#325FE8"
        />
        <StatCard
          icon={<AlertTriangle size={22} strokeWidth={1.75} />}
          label="Overdue Books"
          value={overdue.length}
          sub="Please return soon"
          color="#EE582C"
        />
        <StatCard
          icon={<CheckCircle2 size={22} strokeWidth={1.75} />}
          label="Books Returned"
          value={returned.length}
          sub="Total returned"
          color="#DCAD26"
        />
        <StatCard
          icon={<Library size={22} strokeWidth={1.75} />}
          label="Available Books"
          value={availableCount}
          sub="Ready to borrow"
          color="#A551FF"
        />
      </div>

      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>Recent Activity</h3>
            <button
              className="section-card-link"
              onClick={() => navigate('/student/borrowings')}
            >
              View All <ChevronRight size={14} strokeWidth={2.5} style={{display:'inline', verticalAlign:'middle'}} />
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <Inbox size={40} strokeWidth={1.25} />
              <p>No borrowing activity yet</p>
            </div>
          ) : (
            <div className="activity-list">
              {recentActivity.map((item, idx) => {
                const book = item.bookId; // populated by server
                const premiumColors = ['#325FE8', '#EE582C', '#DCAD26', '#A551FF'];
                const coverColor = book?.coverColor || premiumColors[idx % premiumColors.length];
                return (
                  <div key={item._id} className="activity-item">
                    <div
                      className="activity-cover"
                      style={{ backgroundColor: coverColor }}
                    >
                      {book?.title ? book.title.charAt(0) : <BookOpen size={20}/>}
                    </div>
                    <div className="activity-info">
                      <p className="activity-title">{book?.title || 'Unknown Book'}</p>
                      <p className="activity-author">{book?.author || ''}</p>
                      <p className="activity-date">
                        Issued: {formatDate(item.issueDate)} · Due: {formatDate(item.dueDate)}
                        {item.status === 'returned' && item.returnDate
                          ? ` · Returned: ${formatDate(item.returnDate)}`
                          : ''}
                      </p>
                    </div>
                    <div className={`activity-status status-${item.status}`}>
                      {item.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Rated Books */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>Top Rated Books</h3>
            <button
              className="section-card-link"
              onClick={() => navigate('/student/books')}
            >
              Browse All <ChevronRight size={14} strokeWidth={2.5} style={{display:'inline', verticalAlign:'middle'}} />
            </button>
          </div>

          {topBooks.length === 0 ? (
            <div className="empty-state">
              <Library size={40} strokeWidth={1.25} />
              <p>No books available</p>
            </div>
          ) : (
            <div className="popular-books">
              {topBooks.map((book, idx) => {
                const premiumColors = ['#325FE8', '#EE582C', '#DCAD26', '#A551FF'];
                const coverColor = book.coverColor || premiumColors[idx % premiumColors.length];
                return (
                <div
                  key={book._id}
                  className="popular-book-item"
                  onClick={() => navigate(`/student/books/${book._id}`)}
                >
                  <div
                    className="popular-book-cover"
                    style={{ backgroundColor: coverColor }}
                  >
                    <span>{book.title.charAt(0)}</span>
                  </div>
                  <div className="popular-book-info">
                    <p className="popular-book-title">{book.title}</p>
                    <p className="popular-book-author">{book.author}</p>
                    <div className="popular-book-meta">
                      <span className="rating">★ {book.rating ?? '—'}</span>
                      <span className={`avail ${book.availableCopies > 0 ? 'yes' : 'no'}`}>
                        {book.availableCopies > 0
                          ? `${book.availableCopies} available`
                          : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

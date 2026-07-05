import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard/StatCard';
import borrowingsApi from '../../api/borrowings';
import booksApi from '../../api/books';
import usersApi from '../../api/users';
import { BookOpen, AlertTriangle, Inbox, GraduationCap, Users, LayoutDashboard, Copy } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { token } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [userCounts, setUserCounts] = useState({ total: 0, students: 0, librarians: 0, admins: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, borrowingsRes, booksRes, usersRes] = await Promise.all([
        borrowingsApi.getDashboardStats(token),
        borrowingsApi.getAllBorrowings(token),
        booksApi.getAll(token),
        usersApi.getAll(token),
      ]);

      if (!statsRes.success) throw new Error(statsRes.error);
      if (!borrowingsRes.success) throw new Error(borrowingsRes.error);
      if (!booksRes.success) throw new Error(booksRes.error);
      if (!usersRes.success) throw new Error(usersRes.error);

      setStats(statsRes.stats);

      // User counts
      const allUsers = usersRes.users;
      setUserCounts({
        total: allUsers.length,
        students: allUsers.filter(u => u.role === 'student').length,
        librarians: allUsers.filter(u => u.role === 'librarian').length,
        admins: allUsers.filter(u => u.role === 'admin').length,
      });

      // Recent 6 borrowings (any status) for activity feed
      const now = new Date();
      const recent = borrowingsRes.borrowings.slice(0, 6).map(b => ({
        ...b,
        status: b.status === 'active' && new Date(b.dueDate) < now ? 'overdue' : b.status,
      }));
      setRecentActivity(recent);

      // Category distribution from books
      const books = booksRes.books;
      const catMap = {};
      books.forEach(b => {
        catMap[b.category] = (catMap[b.category] || 0) + 1;
      });
      const catDist = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
      setCategoryDist(catDist);

      // Top 5 most-borrowed books (by how many times they appear in borrowings)
      const bookBorrowCount = {};
      borrowingsRes.borrowings.forEach(b => {
        const id = b.bookId?._id || b.bookId;
        if (id) bookBorrowCount[id] = (bookBorrowCount[id] || 0) + 1;
      });
      const rankedBooks = books
        .map(b => ({ ...b, borrowCount: bookBorrowCount[b._id] || 0 }))
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, 5);
      setTopBooks(rankedBooks);

      // Monthly borrowing trend — last 6 months from actual borrowings
      const monthly = buildMonthlyTrend(borrowingsRes.borrowings);
      setMonthlyData(monthly);

    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading"><div className="admin-spinner" /><p>Loading system overview…</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error"><AlertTriangle size={40} /><p>{error}</p>
          <button className="admin-retry-btn" onClick={fetchAll}>Retry</button>
        </div>
      </div>
    );
  }

  const maxBar = Math.max(...monthlyData.map(d => d.count), 1);

  return (
    <div className="admin-dashboard">
      <div className="admin-hero">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>System Overview <LayoutDashboard size={24} /></h2>
          <p>Library Management System — Administrator Console</p>
        </div>
        <div className="admin-hero-stats">
          <div className="hero-stat"><span>{userCounts.total}</span><small>Total Users</small></div>
          <div className="hero-stat-divider" />
          <div className="hero-stat"><span>{stats.totalBooks}</span><small>Book Titles</small></div>
          <div className="hero-stat-divider" />
          <div className="hero-stat"><span>{stats.issuedCopies}</span><small>Currently Issued</small></div>
        </div>
      </div>

      <div className="stats-grid-4">
        <StatCard icon={<GraduationCap size={24} />} label="Students" value={userCounts.students} sub="Registered students" color="#325FE8" />
        <StatCard icon={<Users size={24} />} label="Librarians" value={userCounts.librarians} sub="Staff members" color="#A551FF" />
        <StatCard icon={<Copy size={24} />} label="Books Issued" value={stats.issuedCopies} sub={`of ${stats.totalCopies} total copies`} color="#EE582C" />
        <StatCard icon={<AlertTriangle size={24} />} label="Overdue" value={stats.overdueCount} sub="Require follow-up" color="#DCAD26" />
      </div>

      <div className="admin-grid">
        {/* Monthly Borrowing Trend */}
        <div className="admin-card chart-card">
          <h3>Monthly Borrowing Trend</h3>
          <div className="bar-chart">
            {monthlyData.map((m, i) => (
              <div key={i} className="bar-col">
                <div className="bar-label-val">{m.count}</div>
                <div className="bar-wrap">
                  <div className="bar" style={{ height: `${(m.count / maxBar) * 100}%` }} />
                </div>
                <div className="bar-label">{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Books by Category */}
        <div className="admin-card">
          <h3>Books by Category</h3>
          <div className="category-chart">
            {categoryDist.map(([cat, cnt]) => (
              <div key={cat} className="cat-row">
                <span className="cat-name-label">{cat}</span>
                <div className="cat-bar-outer">
                  <div
                    className="cat-bar-inner"
                    style={{ width: `${(cnt / Math.max(...categoryDist.map(c => c[1]))) * 100}%` }}
                  />
                </div>
                <span className="cat-count-label">{cnt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Borrowing Activity */}
        <div className="admin-card">
          <h3>Recent Borrowing Activity</h3>
          <div className="recent-borrow-list">
            {recentActivity.length === 0 ? (
              <div className="admin-empty"><Inbox size={36} style={{opacity: 0.5}}/><p>No borrowing activity yet</p></div>
            ) : recentActivity.map(b => {
              const book = b.bookId;
              const student = b.userId;
              return (
                <div key={b._id} className="recent-borrow-item">
                  <div className="rbi-cover" style={{ backgroundColor: book?.coverColor || '#325FE8' }}>
                    {book?.title ? book.title.charAt(0) : <BookOpen size={20} />}
                  </div>
                  <div className="rbi-info">
                    <p className="rbi-title">{book?.title || 'Unknown'}</p>
                    <p className="rbi-student">{student?.name || 'Unknown'}</p>
                  </div>
                  <span className={`rbi-status s-${b.status}`}>{b.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Borrowed Books */}
        <div className="admin-card">
          <h3>Most Borrowed Books</h3>
          <div className="top-books-list">
            {topBooks.length === 0 ? (
              <div className="admin-empty"><BookOpen size={36} style={{opacity: 0.5}}/><p>No borrowing data yet</p></div>
            ) : topBooks.map((b, i) => (
              <div key={b._id} className="top-book-item">
                <span className="top-book-rank">#{i + 1}</span>
                <div className="top-book-cover" style={{ backgroundColor: b.coverColor || '#4f46e5' }}>
                  {b.title.charAt(0)}
                </div>
                <div className="top-book-info">
                  <p className="top-book-title">{b.title}</p>
                  <p className="top-book-author">{b.author}</p>
                </div>
                <span className="top-book-count">{b.borrowCount}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Build a 6-month borrowing trend from real borrowing records */
function buildMonthlyTrend(borrowings) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.toLocaleString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      count: 0,
    });
  }
  borrowings.forEach(b => {
    const issued = new Date(b.issueDate || b.createdAt);
    months.forEach(m => {
      if (issued.getFullYear() === m.year && issued.getMonth() === m.monthIndex) {
        m.count++;
      }
    });
  });
  return months;
}

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Upload, AlertTriangle, GraduationCap, Inbox, User } from 'lucide-react';
import StatCard from '../../components/StatCard/StatCard';
import borrowingsApi from '../../api/borrowings';
import './LibrarianDashboard.css';

export default function LibrarianDashboard() {
  const { user, token } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, borrowingsRes] = await Promise.all([
        borrowingsApi.getDashboardStats(token),
        borrowingsApi.getAllBorrowings(token),
      ]);

      if (!statsRes.success) throw new Error(statsRes.error);
      if (!borrowingsRes.success) throw new Error(borrowingsRes.error);

      setStats(statsRes.stats);

      // Recent 5 borrowings (any status), newest first
      const now = new Date();
      const recent = borrowingsRes.borrowings
        .slice(0, 5) // already sorted createdAt desc by server
        .map((b) => ({
          ...b,
          // normalise overdue client-side
          status:
            b.status === 'active' && new Date(b.dueDate) < now ? 'overdue' : b.status,
        }));
      setRecentIssues(recent);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="librarian-dashboard">
        <div className="lib-loading">
          <div className="loading-spinner" />
          <p>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="librarian-dashboard">
        <div className="lib-error">
          <AlertTriangle size={40} />
          <p>{error}</p>
          <button className="lib-retry-btn" onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="librarian-dashboard">
      <div className="dashboard-welcome lib">
        <div className="welcome-text">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Welcome, {user.name.split(' ')[0]}! <BookOpen size={32} />
          </h2>
          <p>Library operations overview for today</p>
        </div>
        <div className="welcome-badge">
          <span className="badge-role">Librarian</span>
          <span className="badge-today">
            {stats.todayIssues > 0 ? `${stats.todayIssues} issued today` : 'No issues today'}
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<BookOpen size={24} />}
          label="Total Books"
          value={stats.totalBooks}
          sub={`${stats.totalCopies} total copies`}
          color="#325FE8"
        />
        <StatCard
          icon={<Upload size={24} />}
          label="Books Issued"
          value={stats.issuedCopies}
          sub="Currently out"
          color="#EE582C"
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          label="Overdue"
          value={stats.overdueCount}
          sub="Need attention"
          color="#DCAD26"
        />
        <StatCard
          icon={<GraduationCap size={24} />}
          label="Students"
          value={stats.studentCount}
          sub={`${stats.activeCount} active borrowers`}
          color="#A551FF"
        />
      </div>

      <div className="lib-dashboard-grid">
        {/* Recent Issues */}
        <div className="lib-section-card">
          <div className="lib-section-card-header">
            <h3>Recent Issues</h3>
            <span className="today-issues">
              {stats.todayIssues > 0 ? `${stats.todayIssues} today` : 'None today'}
            </span>
          </div>

          {recentIssues.length === 0 ? (
            <div className="empty-state">
              <Inbox size={36} />
              <p>No active issues</p>
            </div>
          ) : (
            <div className="recent-issues-list">
              {recentIssues.map((item, idx) => {
                const book = item.bookId;
                const student = item.userId;
                const premiumColors = ['#325FE8', '#EE582C', '#DCAD26', '#A551FF'];
                const coverColor = book?.coverColor || premiumColors[idx % premiumColors.length];

                return (
                  <div key={item._id} className="recent-issue-item">
                    <div
                      className="issue-cover"
                      style={{ backgroundColor: coverColor }}
                    >
                      {book?.title ? book.title.charAt(0) : <BookOpen size={20} />}
                    </div>
                    <div className="issue-info">
                      <p className="issue-book">{book?.title || 'Unknown Book'}</p>
                      <p className="issue-student"><User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {student?.name || 'Unknown Student'}</p>
                      <p className="issue-dates">Due: {fmtDate(item.dueDate)}</p>
                    </div>
                    <span className={`status-pill s-${item.status}`}>{item.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Collection by Category */}
        <div className="lib-section-card">
          <div className="lib-section-card-header">
            <h3>Collection by Category</h3>
          </div>
          <div className="category-stats-list">
            {stats.categoryStats.map(({ name, count, available }, idx) => {
              const premiumColors = ['#325FE8', '#EE582C', '#DCAD26', '#A551FF'];
              const barColor = premiumColors[idx % premiumColors.length];
              return (
                <div key={name} className="category-stat-item">
                  <div className="cat-stat-header">
                    <span className="cat-name">{name}</span>
                    <span className="cat-counts">{available}/{count} available</span>
                  </div>
                  <div className="cat-bar-track">
                    <div
                      className="cat-bar-fill"
                      style={{ width: count > 0 ? `${(available / count) * 100}%` : '0%', background: barColor }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

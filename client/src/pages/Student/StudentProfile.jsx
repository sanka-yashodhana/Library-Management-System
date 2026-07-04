import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import borrowingsApi from '../../api/borrowings';
import { Mail, Phone, Building2, CalendarDays, BookOpen, AlertTriangle } from 'lucide-react';
import './StudentProfile.css';

export default function StudentProfile() {
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [myBorrowings, setMyBorrowings] = useState([]);
  const [active, setActive] = useState([]);
  const [returned, setReturned] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [topCategories, setTopCategories] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await borrowingsApi.getMyBorrowings(token);
      if (!res.success) throw new Error(res.error);
      
      const allMyBorrowings = res.borrowings;
      setMyBorrowings(allMyBorrowings);
      
      const now = new Date();
      // Unify logic for determining overdue from server side or client side
      const activeList = allMyBorrowings.filter(b => b.status === 'active' || b.status === 'overdue' || (b.status === 'active' && new Date(b.dueDate) < now));
      const returnedList = allMyBorrowings.filter(b => b.status === 'returned');
      const overdueList = allMyBorrowings.filter(b => b.status === 'overdue' || (b.status === 'active' && new Date(b.dueDate) < now));
      
      setActive(activeList);
      setReturned(returnedList);
      setOverdue(overdueList);
      
      const catMap = allMyBorrowings.reduce((acc, b) => {
        if (b.bookId && b.bookId.category) {
          acc[b.bookId.category] = (acc[b.bookId.category] || 0) + 1;
        }
        return acc;
      }, {});
      
      const topCats = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      setTopCategories(topCats);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="student-profile" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-profile">
        <div style={{textAlign:'center', marginTop: '40px', color: '#ef4444'}}>
          <AlertTriangle size={40} style={{margin:'0 auto 10px'}} />
          <p>{error}</p>
          <button className="btn-primary" style={{marginTop:'10px'}} onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-profile">
      <div className="profile-hero">
        <div className="profile-avatar-large" style={{ backgroundColor: user.avatarColor || '#4f46e5' }}>
          {user.avatarInitials || user.name?.charAt(0)}
        </div>
        <div className="profile-hero-info">
          <h1>{user.name}</h1>
          <p className="profile-id">{user.studentId || user._id?.slice(-6).toUpperCase()}</p>
          <span className="profile-role-badge">Student</span>
        </div>
        <div className="profile-status-badge active">
          ● Active Student
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-section-card">
          <h3>Personal Information</h3>
          <div className="profile-info-list">
            <div className="profile-info-item">
              <span className="profile-info-icon">
                <Mail size={18} strokeWidth={1.75} color="#5a6275" />
              </span>
              <div>
                <p className="profile-info-label">Email Address</p>
                <p className="profile-info-value">{user.email}</p>
              </div>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-icon">
                <Phone size={18} strokeWidth={1.75} color="#5a6275" />
              </span>
              <div>
                <p className="profile-info-label">Phone Number</p>
                <p className="profile-info-value">{user.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-icon">
                <Building2 size={18} strokeWidth={1.75} color="#5a6275" />
              </span>
              <div>
                <p className="profile-info-label">Department</p>
                <p className="profile-info-value">{user.department || 'Not assigned'}</p>
              </div>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-icon">
                <CalendarDays size={18} strokeWidth={1.75} color="#5a6275" />
              </span>
              <div>
                <p className="profile-info-label">Member Since</p>
                <p className="profile-info-value">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section-card">
          <h3>Library Statistics</h3>
          <div className="profile-stats">
            <div className="profile-stat-item">
              <div className="psi-value" style={{ color: '#325FE8' }}>{active.length}</div>
              <div className="psi-label">Currently Borrowed</div>
            </div>
            <div className="profile-stat-item">
              <div className="psi-value" style={{ color: '#EE582C' }}>{returned.length}</div>
              <div className="psi-label">Books Returned</div>
            </div>
            <div className="profile-stat-item">
              <div className="psi-value" style={{ color: '#DCAD26' }}>{overdue.length}</div>
              <div className="psi-label">Overdue Books</div>
            </div>
            <div className="profile-stat-item">
              <div className="psi-value" style={{ color: '#A551FF' }}>{myBorrowings.length}</div>
              <div className="psi-label">Total Borrowings</div>
            </div>
          </div>

          {topCategories.length > 0 && (
            <div className="profile-categories">
              <h4>Favorite Categories</h4>
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="category-bar-item">
                  <div className="category-bar-header">
                    <span>{cat}</span>
                    <span>{count} books</span>
                  </div>
                  <div className="category-bar-track">
                    <div
                      className="category-bar-fill"
                      style={{ width: `${(count / myBorrowings.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="profile-section-card">
        <h3>Membership Card</h3>
        <div className="membership-card">
          <div className="membership-card-left">
            <div className="membership-logo">
              <BookOpen size={13} strokeWidth={2} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
              LibraryMS
            </div>
            <div className="membership-avatar" style={{ backgroundColor: user.avatarColor || '#4f46e5' }}>
              {user.avatarInitials || user.name?.charAt(0)}
            </div>
          </div>
          <div className="membership-card-right">
            <p className="membership-name">{user.name}</p>
            <p className="membership-id">{user.studentId || user._id?.slice(-6).toUpperCase()}</p>
            <p className="membership-dept">{user.department || 'Student'}</p>
            <div className="membership-status">Active Member</div>
          </div>
          <div className="membership-watermark">
            <BookOpen size={100} strokeWidth={0.4} color="rgba(255,255,255,0.06)" />
          </div>
        </div>
      </div>
    </div>
  );
}

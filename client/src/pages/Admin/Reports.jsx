import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import borrowingsApi from '../../api/borrowings';
import booksApi from '../../api/books';
import usersApi from '../../api/users';
import { BookOpen, Upload, CheckCircle2, AlertTriangle, Book } from 'lucide-react';
import './Reports.css';

export default function Reports() {
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState(null);
  const [overdueDetails, setOverdueDetails] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [circulationStats, setCirculationStats] = useState({ active: 0, returned: 0, overdue: 0, totalBorrowings: 1, availableCopies: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, borrowingsRes, booksRes, usersRes] = await Promise.all([
        borrowingsApi.getDashboardStats(token),
        borrowingsApi.getAllBorrowings(token),
        booksApi.getAll(token),
        usersApi.getAll(token)
      ]);

      if (!statsRes.success) throw new Error(statsRes.error);
      if (!borrowingsRes.success) throw new Error(borrowingsRes.error);
      if (!booksRes.success) throw new Error(booksRes.error);
      if (!usersRes.success) throw new Error(usersRes.error);

      setStats(statsRes.stats);

      const allBorrowings = borrowingsRes.borrowings;
      const allBooks = booksRes.books;
      const allUsers = usersRes.users.filter(u => u.role === 'student');

      // Overdue details
      const now = new Date();
      const overdueList = allBorrowings.filter(b => b.status === 'overdue' || (b.status === 'active' && new Date(b.dueDate) < now));
      
      const odDetails = overdueList.map(b => {
        const bookObj = b.bookId && typeof b.bookId === 'object' ? b.bookId : allBooks.find(bk => String(bk._id) === String(b.bookId));
        const studentObj = b.userId && typeof b.userId === 'object' ? b.userId : allUsers.find(u => String(u._id) === String(b.userId));
        const daysOverdue = Math.max(1, Math.floor((new Date() - new Date(b.dueDate)) / (1000 * 60 * 60 * 24)));
        
        return {
          ...b,
          book: bookObj,
          student: studentObj,
          daysOverdue
        };
      });
      setOverdueDetails(odDetails);

      // Top Borrowers
      const rankedStudents = allUsers.map(s => {
        const studentBorrowings = allBorrowings.filter(b => {
          const uid = b.userId && typeof b.userId === 'object' ? b.userId._id : b.userId;
          return String(uid) === String(s._id);
        });
        const activeCount = studentBorrowings.filter(b => b.status === 'active' || (b.status === 'overdue' || (b.status === 'active' && new Date(b.dueDate) < now))).length;
        
        return {
          ...s,
          total: studentBorrowings.length,
          activeCount
        };
      }).sort((a, b) => b.total - a.total).slice(0, 5); 
      
      setTopStudents(rankedStudents);

      // Circulation Summary
      const active = allBorrowings.filter(b => b.status === 'active' && new Date(b.dueDate) >= now).length;
      const returned = allBorrowings.filter(b => b.status === 'returned').length;
      const overdue = overdueList.length;
      const availableCopies = allBooks.reduce((a, b) => a + (b.availableCopies || 0), 0);
      
      setCirculationStats({
        active,
        returned,
        overdue,
        totalBorrowings: allBorrowings.length || 1, 
        availableCopies
      });

    } catch (err) {
      setError(err.message || 'Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="reports-page" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div style={{textAlign:'center', marginTop: '40px', color: '#ef4444'}}>
          <AlertTriangle size={40} style={{margin:'0 auto 10px'}} />
          <p>{error}</p>
          <button className="btn-primary" style={{marginTop:'10px'}} onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h2>Reports & Analytics</h2>
        <p>System-wide statistics and performance metrics</p>
      </div>

      <div className="report-summary-grid">
        <div className="report-sum-card purple">
          <div className="rsc-icon"><BookOpen size={24} /></div>
          <div className="rsc-val">{stats.totalCopies}</div>
          <div className="rsc-label">Total Book Copies</div>
        </div>
        <div className="report-sum-card blue">
          <div className="rsc-icon"><Upload size={24} /></div>
          <div className="rsc-val">{stats.issuedCopies}</div>
          <div className="rsc-label">Currently Issued</div>
        </div>
        <div className="report-sum-card orange">
          <div className="rsc-icon"><CheckCircle2 size={24} /></div>
          <div className="rsc-val">{circulationStats.returned}</div>
          <div className="rsc-label">Books Returned</div>
        </div>
        <div className="report-sum-card yellow">
          <div className="rsc-icon"><AlertTriangle size={24} /></div>
          <div className="rsc-val">{stats.overdueCount}</div>
          <div className="rsc-label">Overdue Books</div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card full">
          <h3>Overdue Report</h3>
          {overdueDetails.length === 0 ? (
            <div className="report-empty"><CheckCircle2 size={36} style={{opacity: 0.5}}/><p>No overdue books!</p></div>
          ) : (
            <div className="overdue-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Student</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Days Overdue</th>
                    <th>Fine (est.)</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueDetails.map(item => (
                    <tr key={item._id}>
                      <td>
                        <div className="overdue-book">
                          <div className="od-cover" style={{ backgroundColor: item.book?.coverColor || '#4f46e5' }}>{item.book?.title ? item.book.title.charAt(0) : <Book size={16}/>}</div>
                          <span>{item.book?.title || 'Unknown Book'}</span>
                        </div>
                      </td>
                      <td>{item.student?.name || 'Unknown Student'}</td>
                      <td>{fmtDate(item.issueDate)}</td>
                      <td className="overdue-date">{fmtDate(item.dueDate)}</td>
                      <td><span className="days-overdue">{item.daysOverdue} days</span></td>
                      <td className="fine-amount">Rs. {item.daysOverdue * 20}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="report-card">
          <h3>Collection by Category</h3>
          <div className="category-report-table">
            <div className="crt-header">
              <span>Category</span>
              <span>Available</span>
              <span>Total Copies</span>
            </div>
            {stats.categoryStats && stats.categoryStats.length > 0 ? (
              stats.categoryStats.map((catStat) => (
                <div key={catStat.name} className="crt-row">
                  <span className="crt-cat">{catStat.name}</span>
                  <span className={catStat.available === 0 ? 'text-red' : 'text-green'}>{catStat.available}</span>
                  <span>{catStat.count}</span>
                </div>
              ))
            ) : (
               <div className="report-empty" style={{padding:'20px 0'}}><p>No category data</p></div>
            )}
          </div>
        </div>

        <div className="report-card">
          <h3>Top Borrowers</h3>
          <div className="top-borrowers">
            {topStudents.map((s, i) => (
              <div key={s._id} className="borrower-item">
                <span className="borrower-rank">{i + 1}</span>
                <div className="borrower-avatar" style={{ backgroundColor: s.avatarColor || '#325FE8' }}>
                  {s.avatarInitials || s.name?.charAt(0)}
                </div>
                <div className="borrower-info">
                  <p className="borrower-name">{s.name}</p>
                  <p className="borrower-dept">{s.department || 'N/A'}</p>
                </div>
                <div className="borrower-counts">
                  <span className="bc-total">{s.total} total</span>
                  {s.activeCount > 0 && <span className="bc-active">{s.activeCount} active</span>}
                </div>
              </div>
            ))}
            {topStudents.length === 0 && (
              <div className="report-empty" style={{padding:'20px 0'}}><p>No borrower data</p></div>
            )}
          </div>
        </div>

        <div className="report-card">
          <h3>Circulation Summary</h3>
          <div className="circulation-stats">
            <div className="circ-item">
              <div className="circ-bar-label">
                <span>Active Borrowings</span>
                <strong>{circulationStats.active}</strong>
              </div>
              <div className="circ-track">
                <div className="circ-fill blue" style={{ width: `${(circulationStats.active / circulationStats.totalBorrowings) * 100}%` }} />
              </div>
            </div>
            <div className="circ-item">
              <div className="circ-bar-label">
                <span>Returned</span>
                <strong>{circulationStats.returned}</strong>
              </div>
              <div className="circ-track">
                <div className="circ-fill yellow" style={{ width: `${(circulationStats.returned / circulationStats.totalBorrowings) * 100}%` }} />
              </div>
            </div>
            <div className="circ-item">
              <div className="circ-bar-label">
                <span>Overdue</span>
                <strong>{circulationStats.overdue}</strong>
              </div>
              <div className="circ-track">
                <div className="circ-fill purple" style={{ width: `${(circulationStats.overdue / circulationStats.totalBorrowings) * 100}%` }} />
              </div>
            </div>
            <div className="circ-item">
              <div className="circ-bar-label">
                <span>Available Copies</span>
                <strong>{circulationStats.availableCopies}</strong>
              </div>
              <div className="circ-track">
                <div className="circ-fill orange" style={{ width: stats.totalCopies > 0 ? `${(circulationStats.availableCopies / stats.totalCopies) * 100}%` : '0%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

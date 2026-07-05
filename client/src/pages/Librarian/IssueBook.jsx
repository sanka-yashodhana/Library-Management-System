import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import borrowingsApi from '../../api/borrowings';
import booksApi from '../../api/books';
import usersApi from '../../api/users';
import { Upload, Download, AlertTriangle, CheckCircle2, Inbox, User, BookOpen } from 'lucide-react';
import './IssueBook.css';

export default function IssueBook() {
  const { token } = useAuth();

  const [mode, setMode] = useState('issue'); // 'issue' | 'return'

  // Data
  const [students, setStudents] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [activeBorrowings, setActiveBorrowings] = useState([]);

  // Form state
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedBook, setSelectedBook] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [error, setError] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, booksRes, borrowingsRes] = await Promise.all([
        usersApi.getAll(token, { role: 'student' }),
        booksApi.getAll(token),
        borrowingsApi.getAllBorrowings(token),
      ]);

      if (!studentsRes.success) throw new Error(studentsRes.error);
      if (!booksRes.success) throw new Error(booksRes.error);
      if (!borrowingsRes.success) throw new Error(borrowingsRes.error);

      setStudents(studentsRes.users);
      setAvailableBooks(booksRes.books.filter((b) => b.availableCopies > 0));

      // Active + overdue borrowings with overdue normalisation
      const now = new Date();
      const active = borrowingsRes.borrowings
        .filter((b) => b.status !== 'returned')
        .map((b) => ({
          ...b,
          status:
            b.status === 'active' && new Date(b.dueDate) < now ? 'overdue' : b.status,
        }));
      setActiveBorrowings(active);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedBook) {
      return showToast('Please select both a student and a book.', 'error');
    }
    setSubmitting(true);
    const res = await borrowingsApi.issueBook(selectedBook, selectedStudent, token);
    setSubmitting(false);

    if (res.success) {
      const book = res.borrowing.bookId;
      const student = res.borrowing.userId;
      const due = new Date(res.borrowing.dueDate).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric',
      });
      showToast(`"${book?.title}" issued to ${student?.name} — due ${due}`);
      setSelectedStudent('');
      setSelectedBook('');
      // Refresh data so available copies & active list update
      fetchData();
    } else {
      showToast(res.error || 'Failed to issue book', 'error');
    }
  };

  const handleReturn = async (borrowingId) => {
    setSubmitting(true);
    const res = await borrowingsApi.returnBook(borrowingId, token);
    setSubmitting(false);

    if (res.success) {
      const book = res.borrowing.bookId;
      showToast(`"${book?.title}" returned successfully!`);
      fetchData(); // refresh everything
    } else {
      showToast(res.error || 'Failed to return book', 'error');
    }
  };

  if (loading) {
    return (
      <div className="issue-book">
        <div className="issue-loading">
          <div className="loading-spinner" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="issue-book">
        <div className="issue-err-state">
          <AlertTriangle size={40} />
          <p>{error}</p>
          <button className="issue-retry-btn" onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="issue-book">
      {toast.msg && (
        <div className={`issue-toast ${toast.type === 'error' ? 'issue-toast-error' : 'issue-toast-success'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}} /> : <CheckCircle2 size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}} />} {toast.msg}
        </div>
      )}

      <div className="issue-tabs">
        <button
          className={`issue-tab ${mode === 'issue' ? 'active' : ''}`}
          onClick={() => setMode('issue')}
        >
          <Upload size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'6px'}}/> Issue Book
        </button>
        <button
          className={`issue-tab ${mode === 'return' ? 'active' : ''}`}
          onClick={() => setMode('return')}
        >
          <Download size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'6px'}}/> Accept Return
          {activeBorrowings.filter((b) => b.status === 'overdue').length > 0 && (
            <span className="overdue-badge">
              {activeBorrowings.filter((b) => b.status === 'overdue').length} overdue
            </span>
          )}
        </button>
      </div>

      {mode === 'issue' ? (
        <div className="issue-panel">
          <div className="issue-form-card">
            <h3>Issue a Book to Student</h3>
            <p>Fill in the details below to issue a book</p>
            <form className="issue-form" onSubmit={handleIssue}>
              <div className="issue-field">
                <label>Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="issue-select"
                  required
                >
                  <option value="">-- Choose a student --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} — {s.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="issue-field">
                <label>Select Book</label>
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="issue-select"
                  required
                >
                  <option value="">-- Choose a book --</option>
                  {availableBooks.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.title} — {b.author} ({b.availableCopies} cop{b.availableCopies === 1 ? 'y' : 'ies'} left)
                    </option>
                  ))}
                </select>
              </div>

              <div className="issue-details">
                <div className="issue-detail-item">
                  <span>Loan Period</span>
                  <strong>14 days</strong>
                </div>
                <div className="issue-detail-item">
                  <span>Due Date</span>
                  <strong>{getDueDate()}</strong>
                </div>
              </div>

              <button type="submit" className="issue-submit-btn" disabled={submitting}>
                {submitting ? 'Issuing…' : 'Issue Book'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="return-panel">
          <div className="return-header">
            <h3>Active Borrowings</h3>
            <p>{activeBorrowings.length} book{activeBorrowings.length !== 1 ? 's' : ''} currently checked out</p>
          </div>

          {activeBorrowings.length === 0 ? (
            <div className="empty-panel">
              <Inbox size={36} />
              <p>No active borrowings</p>
            </div>
          ) : (
            <div className="return-list">
              {activeBorrowings.map((item) => {
                const book = item.bookId;
                const student = item.userId;
                return (
                  <div key={item._id} className="return-item">
                    <div
                      className="return-cover"
                      style={{ backgroundColor: book?.coverColor || '#4f46e5' }}
                    >
                      {book?.title ? book.title.charAt(0) : <BookOpen size={20} />}
                    </div>
                    <div className="return-info">
                      <p className="return-book-title">{book?.title || 'Unknown Book'}</p>
                      <p className="return-student">
                        <User size={14} style={{display:'inline', verticalAlign:'middle', marginRight:'4px'}}/> {student?.name || 'Unknown'} — {student?.email || ''}
                      </p>
                      <div className="return-dates">
                        <span>Issued: {fmtDate(item.issueDate)}</span>
                        <span>Due: {fmtDate(item.dueDate)}</span>
                      </div>
                    </div>
                    <div className="return-right">
                      <span className={`status-tag ${item.status === 'overdue' ? 'overdue' : 'active'}`}>
                        {item.status}
                      </span>
                      <button
                        className="accept-return-btn"
                        onClick={() => handleReturn(item._id)}
                        disabled={submitting}
                      >
                        {submitting ? '…' : 'Accept Return'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

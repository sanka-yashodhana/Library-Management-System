import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable/DataTable';
import { GraduationCap, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import usersApi from '../../api/users';
import borrowingsApi from '../../api/borrowings';
import './ManageStudents.css';

// Generate a consistent colour from a string (name)
function nameToColor(name = '') {
  const palette = ['#325FE8', '#EE582C', '#DCAD26', '#A551FF'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function ManageStudents() {
  const { token } = useAuth();

  const [students, setStudents] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, borrowingsRes] = await Promise.all([
        usersApi.getAll(token, { role: 'student' }),
        borrowingsApi.getAllBorrowings(token),
      ]);
      if (!studentsRes.success) throw new Error(studentsRes.error);
      if (!borrowingsRes.success) throw new Error(borrowingsRes.error);

      setStudents(studentsRes.users);
      setBorrowings(borrowingsRes.borrowings);
    } catch (err) {
      setError(err.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build per-student stats from live borrowings
  const getStudentStats = (studentId) => {
    const now = new Date();
    const sb = borrowings.filter((b) => {
      const uid = b.userId?._id || b.userId;
      return String(uid) === String(studentId);
    });
    const active = sb.filter((b) => b.status === 'active').length;
    const overdue = sb.filter(
      (b) =>
        b.status === 'overdue' ||
        (b.status === 'active' && new Date(b.dueDate) < now)
    ).length;
    const total = sb.length;
    return { active, overdue, total };
  };

  // Summary-level stats
  const totalOverdue = borrowings.filter((b) => {
    const now = new Date();
    return b.status === 'overdue' || (b.status === 'active' && new Date(b.dueDate) < now);
  }).length;
  const totalActive = borrowings.filter((b) => b.status === 'active').length;

  const columns = [
    {
      key: 'name',
      label: 'Student',
      sortable: true,
      render: (v, row) => (
        <div className="student-cell">
          <div
            className="student-avatar"
            style={{ backgroundColor: row.avatarColor || nameToColor(v) }}
          >
            {row.avatarInitials || initials(v)}
          </div>
          <div>
            <p className="student-name">{v}</p>
            <p className="student-id">{row.studentId || row._id?.slice(-6).toUpperCase()}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (v) => v || <span style={{ color: '#9ca3af' }}>—</span>,
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (v) =>
        v
          ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—',
    },
    {
      key: '_id',
      label: 'Borrowings',
      render: (v) => {
        const s = getStudentStats(v);
        return (
          <div className="student-borrow-stats">
            <span className="bs-active">{s.active} active</span>
            {s.overdue > 0 && <span className="bs-overdue">{s.overdue} overdue</span>}
            {s.active === 0 && s.overdue === 0 && (
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>none</span>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="manage-students">
        <div className="students-loading">
          <div className="loading-spinner" />
          <p>Loading students…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-students">
        <div className="students-error">
          <AlertTriangle size={40} />
          <p>{error}</p>
          <button className="students-retry-btn" onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-students">
      <div className="manage-header">
        <div>
          <h2>Student Records</h2>
          <p>{students.length} registered students</p>
        </div>
      </div>

      <div className="student-summary-cards">
        <div className="student-sum-card">
          <div className="ssc-icon"><GraduationCap size={24} /></div>
          <div>
            <p className="ssc-val">{students.length}</p>
            <p className="ssc-label">Total Students</p>
          </div>
        </div>
        <div className="student-sum-card">
          <div className="ssc-icon"><CheckCircle2 size={24} /></div>
          <div>
            <p className="ssc-val">{students.length}</p>
            <p className="ssc-label">Registered</p>
          </div>
        </div>
        <div className="student-sum-card">
          <div className="ssc-icon"><AlertTriangle size={24} /></div>
          <div>
            <p className="ssc-val">{totalOverdue}</p>
            <p className="ssc-label">Overdue Books</p>
          </div>
        </div>
        <div className="student-sum-card">
          <div className="ssc-icon"><BookOpen size={24} /></div>
          <div>
            <p className="ssc-val">{totalActive}</p>
            <p className="ssc-label">Active Issues</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        emptyMessage="No students registered"
      />
    </div>
  );
}

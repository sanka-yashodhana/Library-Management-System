import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, GraduationCap, Settings, Mail, Lock, AlertTriangle, EyeOff, Eye } from 'lucide-react';
import './Login.css';

export default function Login() {
  const { login, isAuthenticated, user, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'student', rememberMe: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fillDemo = (role) => {
    const demos = {
      student:   { email: 'student@lms.edu',   password: 'student123',  role: 'student' },
      librarian: { email: 'librarian@lms.edu', password: 'lib123',      role: 'librarian' },
      admin:     { email: 'admin@lms.edu',     password: 'admin123',    role: 'admin' },
    };
    setForm(f => ({ ...f, ...demos[role] }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(form.email, form.password, form.role, form.rememberMe);
    setLoading(false);

    if (result.success) {
      navigate(getDashboardPath(result.user.role));
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon"><BookOpen size={24} /></div>
            <div>
              <h1 className="login-logo-name">LibraryMS</h1>
              <p className="login-logo-sub">University Library Management System</p>
            </div>
          </div>
        </div>

        <div className="login-body">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">Sign in to access your library portal</p>

          <div className="login-demo-btns">
            <p className="login-demo-label">Quick sign-in as:</p>
            <div className="login-demo-row">
              <button type="button" className="login-demo-btn student" onClick={() => fillDemo('student')}>
                <GraduationCap size={16} style={{marginRight: '4px'}} /> Student
              </button>
              <button type="button" className="login-demo-btn librarian" onClick={() => fillDemo('librarian')}>
                <BookOpen size={16} style={{marginRight: '4px'}} /> Librarian
              </button>
              <button type="button" className="login-demo-btn admin" onClick={() => fillDemo('admin')}>
                <Settings size={16} style={{marginRight: '4px'}} /> Admin
              </button>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">Email Address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Mail size={18} /></span>
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder="your@email.edu"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Lock size={18} /></span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="login-role">Role</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Settings size={18} /></span>
                <select
                  id="login-role"
                  className="login-input login-select"
                  value={form.role}
                  onChange={e => set('role', e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="librarian">Librarian</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="login-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  className="login-checkbox"
                  checked={form.rememberMe}
                  onChange={e => set('rememberMe', e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <AlertTriangle size={16} style={{marginRight: '6px'}} /> {error}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading} id="login-submit-btn">
              {loading ? <span className="login-spinner">Signing in...</span> : 'Sign In →'}
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="login-link">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

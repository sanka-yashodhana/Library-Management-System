import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, User, Mail, Lock, AlertTriangle, EyeOff, Eye } from 'lucide-react';
import './Login.css';

export default function Register() {
  const { register, isAuthenticated, user, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    const { confirmPassword, ...userData } = form;
    const result = await register(userData);
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
          <h2 className="login-title">Create Account</h2>
          <p className="login-subtitle">Join your university's library portal</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="login-field">
              <label className="login-label" htmlFor="register-name">Full Name</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><User size={18} /></span>
                <input
                  id="register-name"
                  type="text"
                  className="login-input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="login-field">
              <label className="login-label" htmlFor="register-email">Email Address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Mail size={18} /></span>
                <input
                  id="register-email"
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

            {/* Password */}
            <div className="login-field">
              <label className="login-label" htmlFor="register-password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Lock size={18} /></span>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="login-field">
              <label className="login-label" htmlFor="register-confirm-password">Confirm Password</label>
              <div className={`login-input-wrap ${form.confirmPassword && form.password !== form.confirmPassword ? 'input-error' : ''}`}>
                <span className="login-input-icon"><Lock size={18} /></span>
                <input
                  id="register-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowConfirm(v => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <span className="login-field-hint error">Passwords don't match</span>
              )}
            </div>

            {/* Role */}
            <div className="login-field">
              <label className="login-label" htmlFor="register-role">Role</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><User size={18} /></span>
                <select
                  id="register-role"
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

            {error && (
              <div className="login-error" role="alert">
                <AlertTriangle size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}/> {error}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading} id="register-submit-btn">
              {loading ? <span className="login-spinner">Creating account...</span> : 'Create Account →'}
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="login-link">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

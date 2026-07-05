import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ onMenuToggle, pageTitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="navbar-title-group">
          <h1 className="navbar-title">{pageTitle}</h1>
          <p className="navbar-date">{dateStr}</p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-profile" ref={dropdownRef}>
          <button
            className="navbar-profile-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Profile menu"
          >
            <div className="navbar-avatar" style={{ backgroundColor: user?.avatarColor }}>
              {user?.avatarInitials}
            </div>
            <div className="navbar-profile-info">
              <span className="navbar-profile-name">{user?.name}</span>
              <span className="navbar-profile-role">{user?.role}</span>
            </div>
            <ChevronDown
              size={14}
              strokeWidth={2.5}
              className={`navbar-chevron ${dropdownOpen ? 'open' : ''}`}
              style={{ color: '#5a6275', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {dropdownOpen && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-header">
                <div className="navbar-avatar large" style={{ backgroundColor: user?.avatarColor }}>
                  {user?.avatarInitials}
                </div>
                <div>
                  <p className="dropdown-name">{user?.name}</p>
                  <p className="dropdown-email">{user?.email}</p>
                </div>
              </div>
              <div className="navbar-dropdown-divider" />
              {user?.role === 'student' && (
                <button
                  className="navbar-dropdown-item"
                  onClick={() => { navigate('/student/profile'); setDropdownOpen(false); }}
                >
                  <User size={15} strokeWidth={1.75} />
                  My Profile
                </button>
              )}
              <button className="navbar-dropdown-item logout" onClick={handleLogout}>
                <LogOut size={15} strokeWidth={1.75} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

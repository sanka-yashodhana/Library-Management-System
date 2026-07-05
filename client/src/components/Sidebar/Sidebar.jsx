import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  User,
  LogOut,
  ChevronRight,
  Library,
  BookCheck,
  Users,
  BarChart3,
  Shield,
} from 'lucide-react';
import './Sidebar.css';

const studentLinks = [
  { path: '/student/dashboard', label: 'Dashboard',    Icon: LayoutDashboard },
  { path: '/student/books',     label: 'Browse Books', Icon: BookOpen         },
  { path: '/student/borrowings',label: 'My Borrowings',Icon: BookMarked       },
  { path: '/student/profile',   label: 'My Profile',   Icon: User             },
];

const librarianLinks = [
  { path: '/librarian/dashboard', label: 'Dashboard',    Icon: LayoutDashboard },
  { path: '/librarian/books',     label: 'Manage Books', Icon: Library         },
  { path: '/librarian/issue',     label: 'Issue / Return',Icon: BookCheck      },
  { path: '/librarian/students',  label: 'Students',     Icon: Users           },
];

const adminLinks = [
  { path: '/admin/dashboard', label: 'Dashboard',    Icon: LayoutDashboard },
  { path: '/admin/users',     label: 'Manage Users', Icon: Shield          },
  { path: '/admin/books',     label: 'Manage Books', Icon: Library         },
  { path: '/admin/reports',   label: 'Reports',      Icon: BarChart3       },
];

const roleLinks = {
  student:   studentLinks,
  librarian: librarianLinks,
  admin:     adminLinks,
};

const roleLabels = {
  student:   'Student Portal',
  librarian: 'Librarian Portal',
  admin:     'Admin Portal',
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = roleLinks[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar-overlay ${collapsed ? '' : 'visible'}`} onClick={onToggle} />
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* ── Header ── */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <BookOpen size={18} color="#fff" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <div className="sidebar-logo-text">
                <span className="sidebar-logo-name">LibraryMS</span>
                <span className="sidebar-logo-sub">{roleLabels[user?.role]}</span>
              </div>
            )}
          </div>
          <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
            <ChevronRight
              size={16}
              strokeWidth={2.5}
              style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }}
            />
          </button>
        </div>

        {/* ── User Block ── */}
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ backgroundColor: user?.avatarColor }}>
            {user?.avatarInitials}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-role">{user?.role}</span>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="sidebar-nav">
          {!collapsed && <p className="sidebar-nav-label">Navigation</p>}
          <ul className="sidebar-nav-list">
            {links.map(({ path, label, Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                  title={collapsed ? label : ''}
                >
                  <span className="sidebar-nav-icon">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  {!collapsed && <span className="sidebar-nav-text">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Footer ── */}
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout} title={collapsed ? 'Logout' : ''}>
            <span className="sidebar-nav-icon">
              <LogOut size={18} strokeWidth={1.75} />
            </span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

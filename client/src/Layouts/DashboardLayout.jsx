import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import './DashboardLayout.css';

const pageTitles = {
  '/student/dashboard': 'Dashboard',
  '/student/books': 'Browse Books',
  '/student/borrowings': 'My Borrowings',
  '/student/profile': 'My Profile',
  '/librarian/dashboard': 'Dashboard',
  '/librarian/books': 'Manage Books',
  '/librarian/issue': 'Issue & Return Books',
  '/librarian/students': 'Student Records',
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Manage Users',
  '/admin/books': 'Manage Books',
  '/admin/reports': 'Reports & Analytics',
};

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (isMobile) setMobileSidebarOpen(false);
  }, [location, isMobile]);

  const handleToggle = () => {
    if (isMobile) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  const title = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/student/books/') ? 'Book Details' : 'Library Management');

  const sidebarClass = isMobile
    ? `sidebar${mobileSidebarOpen ? ' mobile-open' : ''}`
    : undefined;

  return (
    <div className={`dashboard-layout ${sidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''}`}>
      <div className={sidebarClass}>
        <Sidebar
          collapsed={!isMobile && sidebarCollapsed}
          onToggle={handleToggle}
        />
      </div>
      <div className="dashboard-main">
        <Navbar onMenuToggle={handleToggle} pageTitle={title} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

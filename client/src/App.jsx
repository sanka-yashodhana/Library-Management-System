import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// AuthProvider removed; wrapped in main.jsx
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import BrowseBooks from './pages/Student/BrowseBooks';
import BookDetails from './pages/Student/BookDetails';
import MyBorrowings from './pages/Student/MyBorrowings';
import StudentProfile from './pages/Student/StudentProfile';

// Librarian Pages
import LibrarianDashboard from './pages/Librarian/LibrarianDashboard';
import ManageBooks from './pages/Librarian/ManageBooks';
import IssueBook from './pages/Librarian/IssueBook';
import ManageStudents from './pages/Librarian/ManageStudents';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import AdminBooks from './pages/Admin/AdminBooks';
import Reports from './pages/Admin/Reports';

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student Routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/books" element={<BrowseBooks />} />
            <Route path="/student/books/:id" element={<BookDetails />} />
            <Route path="/student/borrowings" element={<MyBorrowings />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>

          {/* Librarian Routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['librarian']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/librarian/dashboard" element={<LibrarianDashboard />} />
            <Route path="/librarian/books" element={<ManageBooks />} />
            <Route path="/librarian/issue" element={<IssueBook />} />
            <Route path="/librarian/students" element={<ManageStudents />} />
          </Route>

          {/* Admin Routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/books" element={<AdminBooks />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </BrowserRouter>
  );
}

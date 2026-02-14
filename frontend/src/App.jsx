// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import StudentDashboard from "./pages/StudentDashboard";
import BooksPage from "./pages/BooksPage";
import BorrowedPage from "./pages/BorrowedPage";
import ProfilePage from "./pages/ProfilePage";

import AdminDashboard from "./pages/AdminDashboard";
import ManageBooksPage from "./pages/ManageBooksPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import ReportsPage from "./pages/ReportsPage";
import PendingBorrowsPage from "./pages/PendingBorrowsPage";
import VerificationRequestsPage from "./pages/VerificationRequestsPage";
import AdminFinesPage from "./pages/AdminFinesPage";
import StudentFinesPage from "./pages/StudentFinesPage";

import ChatPage from "./pages/ChatPage";
import StudentReportsPage from "./pages/StudentReportsPage"; // 👈 new
import ToastContainer from "./components/ToastContainer";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <ToastContainer />
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/reset/:token" element={<ResetPasswordPage />} />
          <Route path="/chat" element={<ChatPage />} /> {/* public chat */}

          {/* Student */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/borrows" element={<BorrowedPage />} />  {/* 👈 path fixed */}
            <Route path="/reports" element={<StudentReportsPage />} /> {/* 👈 new */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/books" element={<ManageBooksPage />} />
            <Route path="/admin/users" element={<ManageUsersPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/pending-requests" element={<PendingBorrowsPage />} />
            <Route path="/admin/verification-requests" element={<VerificationRequestsPage />} />
            <Route path="/admin/fines" element={<AdminFinesPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/fines" element={<StudentFinesPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;

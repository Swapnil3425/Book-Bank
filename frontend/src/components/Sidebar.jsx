// src/components/Sidebar.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDemoMode } from "../context/DemoContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isDemoMode, exitDemo } = useDemoMode();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [chatSeen, setChatSeen] = useState(true);

  const handleExitDemo = async () => {
    await logout();
    exitDemo();
    navigate("/register");
  };

  // check if user has opened /chat at least once
  useEffect(() => {
    const seen = localStorage.getItem("chatSeen") === "1";
    setChatSeen(seen);
  }, [pathname]);

  const navItemClass = (active) =>
    `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active
      ? "bg-slate-800 text-primary-400"
      : "text-slate-400 hover:bg-slate-800 hover:text-slate-50"
    }`;

  const renderChatBadge = () =>
    chatSeen ? null : (
      <span className="ml-2 h-2 w-2 rounded-full bg-blue-500" />
    );

  // Demo indicator strip (shown at top of authenticated sidebars)
  const DemoStrip = isDemoMode ? (
    <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-700/40 bg-amber-900/20 px-3 py-2 text-xs">
      <span className="text-sm" aria-hidden="true">⚗️</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-300 truncate">Demo Mode</p>
        <p className="text-[10px] text-amber-500/80">Read-only sandbox</p>
      </div>
      <button
        onClick={handleExitDemo}
        className="shrink-0 text-[10px] font-bold text-amber-400 hover:text-amber-200 transition-colors"
      >
        Exit
      </button>
    </div>
  ) : null;

  // GUEST SIDEBAR: only chat
  if (!user) {
    return (
      <aside className="hidden w-64 flex-shrink-0 px-2 py-6 md:block bg-transparent border-r border-slate-800/50">
        <div className="space-y-6">
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">Quick Help</div>
            <Link
              to="/chat"
              className={navItemClass(pathname === "/chat") + " py-2.5 px-3 bg-slate-800/80 shadow-sm border border-slate-700/50"}
            >
              <span className="text-sm font-semibold">💬 Chat Assistant</span>
              {renderChatBadge()}
            </Link>
            <p className="mt-3 px-1 text-xs leading-relaxed text-slate-400">
              Need help with fines or library rules? Get instant AI answers.
            </p>
          </div>

          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30 space-y-5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Resources</div>
            <div className="space-y-5 px-1">
              <div>
                <p className="text-sm font-bold text-slate-200 mb-1.5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500"></span>
                  New to BookBank?
                </p>
                <p className="text-xs leading-relaxed text-slate-400">
                  Check our <a href="https://github.com/Swapnil3425/Book-Bank" target="_blank" rel="noopener noreferrer" className="text-primary-400 font-bold hover:underline decoration-primary-500/30 underline-offset-4">GitHub Guide</a> for setup and features.
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200 mb-1.5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500"></span>
                  Start Borrowing
                </p>
                <p className="text-xs leading-relaxed text-slate-400">
                  <Link to="/register" className="text-primary-400 font-bold hover:underline decoration-primary-500/30 underline-offset-4">Create Account</Link> with ID and wait for verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // STUDENT LINKS
  if (user.role === "student") {
    return (
      <aside className="hidden w-56 flex-shrink-0 px-3 py-4 md:block bg-transparent">
        {DemoStrip}
        <nav className="flex flex-col gap-1 text-sm">
          <Link
            to="/dashboard"
            className={navItemClass(pathname === "/dashboard")}
          >
            <span>Dashboard</span>
          </Link>
          <Link
            to="/books"
            className={navItemClass(pathname === "/books")}
          >
            <span>Books</span>
          </Link>
          <Link
            to="/borrows"
            className={navItemClass(pathname === "/borrows")}
          >
            <span>My Borrowed</span>
          </Link>
          <Link
            to="/reports"
            className={navItemClass(pathname === "/reports")}
          >
            <span>My Reports</span>
          </Link>

          <div className="mt-4 pt-4 border-t border-slate-700">
            <Link
              to="/chat"
              className={navItemClass(pathname === "/chat")}
            >
              <span>💬 Chat Assistant</span>
              {renderChatBadge()}
            </Link>
          </div>
        </nav>
      </aside>
    );
  }

  // ADMIN LINKS
  return (
    <aside className="hidden w-56 flex-shrink-0 px-3 py-4 md:block bg-transparent">
      {DemoStrip}
      <nav className="flex flex-col gap-1 text-sm">
        <Link
          to="/admin"
          className={navItemClass(pathname === "/admin")}
        >
          <span>Admin Overview</span>
        </Link>
        <Link
          to="/admin/books"
          className={navItemClass(pathname === "/admin/books")}
        >
          <span>Manage Books</span>
        </Link>
        <Link
          to="/admin/users"
          className={navItemClass(pathname === "/admin/users")}
        >
          <span>Manage Users</span>
        </Link>
        <Link
          to="/admin/pending-requests"
          className={navItemClass(pathname === "/admin/pending-requests")}
        >
          <span>Pending Requests</span>
        </Link>
        <Link
          to="/admin/verification-requests"
          className={navItemClass(pathname === "/admin/verification-requests")}
        >
          <span>ID Verification</span>
        </Link>

        <Link
          to="/admin/reports"
          className={navItemClass(pathname === "/admin/reports")}
        >
          <span>Reports</span>
        </Link>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <Link
            to="/chat"
            className={navItemClass(pathname === "/chat")}
          >
            <span>💬 Chat Assistant</span>
            {renderChatBadge()}
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;

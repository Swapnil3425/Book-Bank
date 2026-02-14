// src/components/Sidebar.jsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Sidebar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [chatSeen, setChatSeen] = useState(true);

  // check if user has opened /chat at least once
  useEffect(() => {
    const seen = localStorage.getItem("chatSeen") === "1";
    setChatSeen(seen);
  }, [pathname]);

  const navItemClass = (active) =>
    `flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${active
      ? "bg-slate-800 text-primary-200"
      : "text-slate-300 hover:bg-slate-800/70 hover:text-primary-200"
    }`;

  const renderChatBadge = () =>
    chatSeen ? null : (
      <span className="ml-2 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
    );

  // GUEST SIDEBAR: only chat
  if (!user) {
    return (
      <aside className="hidden w-56 flex-shrink-0 border-r border-slate-800 bg-slate-950/70 px-3 py-4 md:block">
        <div className="text-xs text-slate-400 mb-2">Quick Help</div>
        <Link
          to="/chat"
          className={navItemClass(pathname === "/chat")}
        >
          <span>💬 Chat Assistant</span>
          {renderChatBadge()}
        </Link>
      </aside>
    );
  }

  // STUDENT LINKS
  if (user.role === "student") {
    return (
      <aside className="hidden w-56 flex-shrink-0 border-r border-slate-800 bg-slate-950/70 px-3 py-4 md:block">
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

          <div className="mt-3 border-t border-slate-800 pt-3">
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
    <aside className="hidden w-56 flex-shrink-0 border-r border-slate-800 bg-slate-950/70 px-3 py-4 md:block">
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

        <div className="mt-3 border-t border-slate-800 pt-3">
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

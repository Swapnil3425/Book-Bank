// frontend/src/components/Navbar.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const homePath = user
    ? user.role === "admin"
      ? "/admin"
      : "/dashboard"
    : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-800/60 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 relative">
        {/* Logo / Title */}
        <Link to={homePath} className="flex items-center gap-2">
          <img src={logo} alt="Book Bank Logo" className="h-9 w-9 object-contain" />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
              Book Bank
            </span>
            <span className="text-sm font-bold text-slate-50">
              IIIT Pune
            </span>
          </div>
        </Link>

        {/* Center navigation */}
        <div className="hidden items-center gap-6 text-sm font-bold text-slate-400 sm:flex">
          <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
          <Link
            to="/chat"
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-1.5 hover:bg-slate-800 hover:border-slate-500 transition-all text-slate-300"
          >
            💬 Chat Assistant
          </Link>
        </div>

        {/* Right side: auth / user info */}
        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          {!user && (
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                  isHelpOpen 
                  ? "bg-primary-600 border-primary-500 text-white" 
                  : "bg-slate-900/60 border-slate-700 text-slate-300"
                }`}
              >
                <span className="text-lg font-bold">?</span>
              </button>
            </div>
          )}

          {user ? (
            <>
              <Link
                to="/profile"
                className="hidden items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-slate-300 sm:inline-flex hover:bg-slate-800 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium">{user.name}</span> <span className="text-slate-500">·</span> <span className="text-xs text-slate-400">{user.role.toUpperCase()}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden rounded-lg px-5 py-2 font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 sm:inline-block"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Help Dropdown */}
        {!user && isHelpOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 px-4 sm:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="card-glass p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Assistance</p>
                <Link
                  to="/chat"
                  onClick={() => setIsHelpOpen(false)}
                  className="flex items-center gap-3 rounded-lg bg-slate-800 p-3 text-sm font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  <span>💬 Chat Assistant</span>
                </Link>
              </div>
              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-slate-300 italic">New to BookBank?</p>
                  <a 
                    href="https://github.com/Swapnil3425/Book-Bank" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary-400 font-bold underline decoration-primary-500/30 underline-offset-4"
                  >
                    View GitHub Setup Guide
                  </a>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Once verified, manage your loans from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

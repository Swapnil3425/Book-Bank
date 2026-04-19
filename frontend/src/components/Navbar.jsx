// frontend/src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();

  const homePath = user
    ? user.role === "admin"
      ? "/admin"
      : "/dashboard"
    : "/";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700 bg-slate-800/60 shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo / Title */}
        <Link to={homePath} className="flex items-center gap-2">
          <img src={logo} alt="Book Bank Logo" className="h-9 w-9 object-contain" />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs text-slate-400 uppercase tracking-[0.18em]">
              Book Bank
            </span>
            <span className="text-sm font-semibold text-slate-50">
              Book Bank
            </span>
          </div>
        </Link>

        {/* Center navigation */}
        <div className="hidden items-center gap-4 text-sm font-medium text-slate-400 sm:flex">
          <Link
            to="/"
            className="hover:text-primary-600 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/chat"
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 hover:bg-slate-800 hover:border-slate-600 transition-colors text-slate-300"
          >
            💬 Chat Assistant
          </Link>
        </div>

        {/* Right side: auth / user info */}
        <div className="flex items-center gap-3 text-sm">
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
                className="rounded-lg px-4 py-2 font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden rounded-lg px-4 py-2 font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm sm:inline-block"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

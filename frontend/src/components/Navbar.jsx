// frontend/src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  const homePath = user
    ? user.role === "admin"
      ? "/admin"
      : "/dashboard"
    : "/";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo / Title */}
        <Link to={homePath} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-500 to-sky-400 text-slate-950 font-black">
            BB
          </div>
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
        <div className="hidden items-center gap-4 text-xs text-slate-300 sm:flex">
          <Link
            to="/"
            className="hover:text-primary-300 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/chat"
            className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200 hover:bg-cyan-500/20"
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
                className="hidden items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 sm:inline-flex"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 mr-1" />
                {user.name} · {user.role.toUpperCase()}
              </Link>
              <button
                onClick={logout}
                className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-3 py-1 text-xs font-medium border border-slate-700 text-slate-200 hover:border-primary-500/70"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden rounded-full px-3 py-1 text-xs font-medium border border-slate-700 text-slate-200 hover:border-primary-500/70 sm:inline-block"
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

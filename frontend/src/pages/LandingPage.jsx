import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.png";
import DemoRoleModal from "../components/DemoRoleModal";

const LandingPage = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [redirectNow, setRedirectNow] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Personalized welcome delay before redirect — skip for demo users
  useEffect(() => {
    if (user && !user.isDemo) {
      setShowWelcome(true);
      const timer = setTimeout(() => setRedirectNow(true), 2000); // 2 sec delay
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Redirect after welcome
  if (redirectNow && user) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  // Show personalized welcome if logged in
  if (user && showWelcome) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-3">
        <h2 className="text-3xl font-semibold text-slate-50">
          Welcome back,{" "}
          <span className="text-primary-600">
            {user.name.split(" ")[0]}
          </span>
          !
        </h2>
        <p className="text-sm text-slate-400">
          Redirecting to your {user.role === "admin" ? "admin" : "student"}{" "}
          dashboard...
        </p>
        <div className="mt-3 h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  // Default landing page for guests
  return (
    <>
      {/* Demo Role Modal */}
      {showDemoModal && (
        <DemoRoleModal onClose={() => setShowDemoModal(false)} />
      )}

      <section className="mt-8 grid gap-12 md:grid-cols-[1fr_1fr] items-center">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 p-1 pr-4 text-xs font-medium text-primary-700">
            <img src={logo} alt="Logo" className="h-6 w-6 rounded bg-slate-800/60 object-contain p-0.5 shadow-sm" />
            IIITP · Book Bank Management System
          </div>
          <a
            href="https://github.com/Swapnil3425/Book-Bank"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-900/60 transition-all shadow-sm"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </a>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl leading-tight">
          Smart, transparent &amp; stress-free{" "}
          <span className="text-primary-600">
            book lending
          </span>
          .
        </h1>

        <p className="max-w-xl text-base text-slate-400">
          Ditch paper registers. Manage your semester book loans with live
          availability, due date reminders and a clean dashboard for both
          students and admins.
        </p>

        {/* CTA Buttons — Login · Register · Live Demo */}
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to="/login"
            className="rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            Login to portal
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-slate-600 bg-slate-800/60 px-5 py-2.5 font-medium text-slate-300 hover:bg-slate-900/60 transition-colors shadow-sm"
          >
            New student? Register
          </Link>

          {/* Live Demo — visually prominent, gradient border treatment */}
          <button
            onClick={() => setShowDemoModal(true)}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-5 py-2.5 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-violet-900/40 hover:scale-[1.02] focus:outline-none"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)",
            }}
          >
            {/* Shimmer on hover */}
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-white/10 transition-transform duration-500 group-hover:translate-x-full"
              aria-hidden="true"
            />
            <span className="text-base select-none" aria-hidden="true">⚗️</span>
            Live Demo
          </button>
        </div>

        {/* Standalone Live Demo row with caption */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-700/50" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">or try without signing up</span>
            <div className="h-px flex-1 bg-slate-700/50" />
          </div>
          <button
            onClick={() => setShowDemoModal(true)}
            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-indigo-500/30 bg-indigo-600/5 px-5 py-3 font-semibold text-indigo-300 shadow-md transition-all duration-200 hover:border-indigo-400/50 hover:bg-indigo-600/10 hover:text-indigo-200 hover:shadow-indigo-900/30 focus:outline-none"
          >
            <span className="text-lg select-none" aria-hidden="true">⚗️</span>
            <span className="text-sm">Explore Live Demo</span>
            <span className="text-xs text-indigo-400/60">— Student &amp; Admin views available</span>
          </button>
          <p className="text-center text-[10px] text-slate-600">No account needed · Read-only sandbox · Instant access</p>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-700/50 pt-6 text-sm text-slate-400">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Live status
            </dt>
            <dd>Real-time availability</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Reminders
            </dt>
            <dd>Due &amp; overdue alerts</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Reports
            </dt>
            <dd>Usage analytics</dd>
          </div>
        </dl>
      </div>

      <div className="card-glass p-6 bg-slate-800/60 shadow-md border-slate-700 rounded-2xl">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-200">Today&apos;s snapshot</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
              <p className="text-xs font-medium text-slate-400 mb-1">Books in bank</p>
              <p className="text-2xl font-bold text-slate-50">25</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-xs font-medium text-green-600 mb-1">Issued today</p>
              <p className="text-2xl font-bold text-green-700">12</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-medium text-red-600 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-700">5</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 mt-2">
            <p className="text-xs font-medium text-slate-400 mb-3">Upcoming returns</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex justify-between items-center py-1 border-b border-slate-700/60 pb-2">
                <span className="font-medium">Discrete Structures</span>
                <span className="text-orange-600 text-xs font-semibold bg-orange-100 px-2 py-0.5 rounded">Today</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-slate-700/60 pb-2 bg-slate-900/60/50">
                <span>DBMS</span>
                <span className="text-slate-400 text-xs">+1 day</span>
              </li>
              <li className="flex justify-between items-center py-1 bg-slate-900/60/50">
                <span>Operating Systems</span>
                <span className="text-slate-400 text-xs">+3 days</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <footer className="mt-20 border-t border-slate-700/50 pt-8 pb-12">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">
          Built for Students · By Students · IIITP © 2025
        </p>
      </div>
    </footer>
    </>
  );
};

export default LandingPage;


import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LandingPage = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [redirectNow, setRedirectNow] = useState(false);

  // Personalized welcome delay before redirect
  useEffect(() => {
    if (user) {
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
          <span className="bg-gradient-to-r from-primary-400 to-sky-300 bg-clip-text text-transparent">
            {user.name.split(" ")[0]}
          </span>
          !
        </h2>
        <p className="text-sm text-slate-400">
          Redirecting to your {user.role === "admin" ? "admin" : "student"}{" "}
          dashboard...
        </p>
        <div className="mt-3 h-6 w-6 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
      </div>
    );
  }

  // Default landing page for guests
  return (
    <section className="mt-6 grid gap-8 md:grid-cols-[1.2fr_1fr] items-center">
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/50 bg-slate-950/60 px-3 py-1 text-xs text-primary-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          IIITP · Book Bank Management System
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Smart, transparent &amp; stress-free{" "}
          <span className="bg-gradient-to-r from-primary-400 to-sky-300 bg-clip-text text-transparent">
            book lending
          </span>
          .
        </h1>

        <p className="max-w-xl text-sm text-slate-300">
          Ditch paper registers. Manage your semester book loans with live
          availability, due date reminders and a clean dashboard for both
          students and admins.
        </p>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to="/login"
            className="rounded-xl bg-primary-500 px-4 py-2 font-medium text-slate-950 shadow-lg shadow-primary-500/30 hover:bg-primary-400"
          >
            Login to portal
          </Link>
          <Link
            to="/register"
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 font-medium text-slate-100 hover:border-primary-400/70"
          >
            New student? Register
          </Link>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-300">
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-slate-400">
              Live status
            </dt>
            <dd>Real-time availability</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-slate-400">
              Reminders
            </dt>
            <dd>Due &amp; overdue alerts</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-slate-400">
              Reports
            </dt>
            <dd>Usage analytics for admin</dd>
          </div>
        </dl>
      </div>

      <div className="card-glass relative overflow-hidden p-4">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="relative space-y-3 text-xs">
          <p className="text-slate-300">Today&apos;s snapshot</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-900/80 p-3">
              <p className="text-[10px] text-slate-400">Books in bank</p>
              <p className="text-xl font-semibold text-slate-50">10,245</p>
            </div>
            <div className="rounded-xl bg-slate-900/80 p-3">
              <p className="text-[10px] text-slate-400">Issued today</p>
              <p className="text-xl font-semibold text-emerald-300">128</p>
            </div>
            <div className="rounded-xl bg-slate-900/80 p-3">
              <p className="text-[10px] text-slate-400">Overdue</p>
              <p className="text-xl font-semibold text-rose-300">14</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/80 p-3">
            <p className="text-[10px] text-slate-400 mb-1">Upcoming returns</p>
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span>Discrete Structures</span>
                <span className="text-slate-400">Today</span>
              </li>
              <li className="flex justify-between">
                <span>DBMS</span>
                <span className="text-slate-400">+1 day</span>
              </li>
              <li className="flex justify-between">
                <span>Operating Systems</span>
                <span className="text-slate-400">+3 days</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;

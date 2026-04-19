import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.png";

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
    <section className="mt-8 grid gap-12 md:grid-cols-[1fr_1fr] items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 p-1 pr-4 text-xs font-medium text-primary-700">
          <img src={logo} alt="Logo" className="h-6 w-6 rounded bg-slate-800/60 object-contain p-0.5 shadow-sm" />
          IIITP · Book Bank Management System
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
              <p className="text-2xl font-bold text-slate-50">10,245</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-xs font-medium text-green-600 mb-1">Issued today</p>
              <p className="text-2xl font-bold text-green-700">128</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-medium text-red-600 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-700">14</p>
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
  );
};

export default LandingPage;

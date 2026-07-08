// frontend/src/components/DemoRoleModal.jsx
// Renders via React Portal directly into document.body — avoids stacking
// context issues caused by parent elements with backdrop-filter / transform.

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "../context/DemoContext";

const DemoRoleModal = ({ onClose }) => {
  const { enterDemo } = useDemoMode();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSelect = (role) => {
    enterDemo(role);
    onClose();
    navigate(role === "admin" ? "/admin" : "/dashboard");
  };

  const STUDENT_FEATURES = ["My Dashboard", "Browse Books", "My Borrows", "Fines & Reports"];
  const ADMIN_FEATURES   = ["Admin Overview", "Manage Books", "User Requests", "Fines & Reports"];

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose demo role"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: "rgba(2, 6, 23, 0.88)" }}
      onClick={onClose}
    >
      {/* Animated card */}
      <div
        className="demo-modal-card relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl"
        style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent line */}
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)" }} />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-700/30 bg-amber-900/20 px-3 py-1">
            <span className="text-sm">⚗️</span>
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Live Demo</span>
          </div>
          <h2 className="text-xl font-bold text-white">Choose your demo perspective</h2>
          <p className="mt-1 text-sm text-slate-400">
            Full feature access · Realistic data · No sign-up needed
          </p>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-slate-800" />

        {/* Role Cards Grid */}
        <div className="grid grid-cols-2 gap-3 p-5">

          {/* ── Student Card ── */}
          <button
            onClick={() => handleSelect("student")}
            className="demo-card group relative flex flex-col items-start rounded-xl border border-slate-700/60 bg-slate-800/50 p-5 text-left transition-all duration-200 hover:border-indigo-500/50 hover:bg-slate-800/90 focus:outline-none"
          >
            {/* Hover glow */}
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.15), transparent 70%)" }}
            />

            {/* Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-2xl">
              🎒
            </div>

            <p className="text-sm font-bold text-white">Student Portal</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Experience the app as a student borrowing books.
            </p>

            {/* Feature list */}
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-400">
              {STUDENT_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <span className="text-indigo-500" aria-hidden="true">›</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-4 w-full rounded-lg border border-indigo-500/30 bg-indigo-600/10 px-3 py-2 text-center text-xs font-semibold text-indigo-300 transition-colors group-hover:bg-indigo-600/20 group-hover:text-indigo-200">
              Enter as Student →
            </div>
          </button>

          {/* ── Admin Card ── */}
          <button
            onClick={() => handleSelect("admin")}
            className="demo-card group relative flex flex-col items-start rounded-xl border border-slate-700/60 bg-slate-800/50 p-5 text-left transition-all duration-200 hover:border-violet-500/50 hover:bg-slate-800/90 focus:outline-none"
          >
            {/* Hover glow */}
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(139,92,246,0.15), transparent 70%)" }}
            />

            {/* Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 border border-violet-500/20 text-2xl">
              🗂️
            </div>

            <p className="text-sm font-bold text-white">Admin Dashboard</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              See the admin's full control panel & management tools.
            </p>

            {/* Feature list */}
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-400">
              {ADMIN_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <span className="text-violet-500" aria-hidden="true">›</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-4 w-full rounded-lg border border-violet-500/30 bg-violet-600/10 px-3 py-2 text-center text-xs font-semibold text-violet-300 transition-colors group-hover:bg-violet-600/20 group-hover:text-violet-200">
              Enter as Admin →
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 text-center">
          <p className="text-[11px] text-slate-600">
            ⚗️ Sandbox environment · All data is simulated · Nothing is saved to any server
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close demo selector"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-700/60 hover:text-slate-300"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes demoModalIn {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0px); }
        }
        .demo-modal-card { animation: demoModalIn 0.22s cubic-bezier(0.34,1.36,0.64,1) both; }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
};

export default DemoRoleModal;

// frontend/src/components/DemoBanner.jsx
// Sticky amber banner shown at the top of every page during demo mode.
// Uses ⚗️ (alembic) — a lab instrument that represents a sandboxed/experimental environment.

import { useNavigate } from "react-router-dom";
import { useDemoMode } from "../context/DemoContext";
import { useAuth } from "../hooks/useAuth";

const DemoBanner = () => {
  const { isDemoMode, demoRole, exitDemo } = useDemoMode();
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  const handleExit = async (destination = "/register") => {
    await logout();
    exitDemo();
    navigate(destination);
  };

  return (
    <div
      role="alert"
      aria-label="Demo mode active"
      className="relative z-50 w-full"
      style={{
        background: "linear-gradient(90deg, #92400e 0%, #b45309 40%, #d97706 100%)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        {/* Left — mode label */}
        <div className="flex items-center gap-2 text-amber-50">
          <span className="text-base select-none" aria-hidden="true">⚗️</span>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-100">
            Demo Mode
          </span>
          <span className="hidden rounded-full bg-amber-900/60 px-2 py-0.5 text-[10px] font-semibold text-amber-200 sm:inline">
            {demoRole === "admin" ? "Administrator Preview" : "Student Preview"}
          </span>
          <span className="hidden text-[11px] text-amber-300/80 sm:inline">
            · Read-only sandbox — changes won't persist
          </span>
        </div>

        {/* Right — exit CTAs */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => handleExit("/login")}
            className="rounded-lg border border-amber-300/40 bg-amber-900/40 px-3 py-1 text-amber-100 transition hover:bg-amber-900/70"
          >
            Log In
          </button>
          <button
            onClick={() => handleExit("/register")}
            className="rounded-lg bg-amber-50 px-3 py-1 text-amber-900 transition hover:bg-white"
          >
            Sign Up Free →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;

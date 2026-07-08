import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose, duration = 8000 }) => {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [onClose, duration, message]);

  if (!message) return null;

  const config = type === "success" 
    ? {
        borderClass: "border-emerald-500/30",
        shadowClass: "shadow-emerald-950/50",
        icon: (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      }
    : {
        borderClass: "border-rose-500/30",
        shadowClass: "shadow-rose-950/50",
        icon: (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      };

  return (
    <div className="fixed inset-x-0 top-28 flex justify-center z-50 pointer-events-none px-4 animate-fade-in-down">
      <div className={`pointer-events-auto max-w-md w-full rounded-2xl border bg-slate-950/95 backdrop-blur-md px-4 py-3 text-xs md:text-sm font-medium text-slate-100 shadow-2xl transition-all duration-300 ${config.borderClass} ${config.shadowClass}`}>
        <div className="flex items-start gap-3">
          {config.icon}
          <div className="flex-1 leading-relaxed mt-0.5">{message}</div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200 transition shrink-0 ml-1 mt-0.5"
            aria-label="Close toast"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
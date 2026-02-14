import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [onClose, duration, message]);

  if (!message) return null;

  const bgClass = type === "success" ? "bg-emerald-600/10 border-emerald-500/40 text-emerald-100" : "bg-rose-600/10 border-rose-500/40 text-rose-100";

  return (
    <div className="fixed inset-x-0 top-16 flex justify-center z-50 pointer-events-none">
      <div className={`pointer-events-auto rounded-xl border px-4 py-2 text-sm shadow-xl ${bgClass}`}>
        <div className="flex items-center gap-3">
          <div className="text-lg">{type === "success" ? "✔" : "✖"}</div>
          <div>{message}</div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
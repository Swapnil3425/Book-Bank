import { useEffect, useState } from "react";
import Toast from "./Toast";

const ToastContainer = () => {
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    const handler = (e) => {
      const { message, type, duration } = e.detail || {};
      setToast({ message: message || "", type: type || "success", duration: duration || 4000 });
    };
    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onClose={() => setToast({ ...toast, message: "" })}
    />
  );
};

export default ToastContainer;

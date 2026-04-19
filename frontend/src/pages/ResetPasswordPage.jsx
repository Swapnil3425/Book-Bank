import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Toast from "../components/Toast";
import api from "../api/axios";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }
    try {
      setLoading(true);
      await api.post(`/auth/reset/${token}`, { password: form.password });
      setToast({
        message: "Password reset successful. Redirecting to login...",
        type: "success"
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Reset failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, message: "" })}
      />
      <div className="mt-8 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="card-glass w-full max-w-md space-y-4 p-6"
        >
          <h2 className="text-lg font-semibold text-slate-50">
            Reset Password
          </h2>
          <p className="text-xs text-slate-400">
            Enter your new password for Book Bank.
          </p>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            <span>New Password</span>
            <input
              className="rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            <span>Confirm Password</span>
            <input
              className="rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPasswordPage;

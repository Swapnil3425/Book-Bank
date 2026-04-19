import { useState } from "react";
import Toast from "../components/Toast";
import api from "../api/axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/forgot", { email });
      setToast({
        message: "If an account exists, a reset link has been sent.",
        type: "success"
      });
      setEmail("");
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Request failed",
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
            Forgot Password
          </h2>
          <p className="text-xs text-slate-400">
            Enter the email linked with your Book Bank account. We will send a
            password reset link if it exists.
          </p>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            <span>Email</span>
            <input
              className="rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@iiitp.ac.in"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ForgotPasswordPage;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { useAuth } from "../hooks/useAuth";
import Toast from "../components/Toast";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ institutionalId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(form);
      setToast({ message: "Welcome back!", type: "success" });
      navigate("/dashboard");
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Login failed",
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
        <form onSubmit={handleSubmit} className="card-glass w-full max-w-md space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-50">
            Login to Book Bank
          </h2>
          <p className="text-xs text-slate-400">
            Use your institutional ID and password provided at the time of
            registration.
          </p>
          <FormInput
            label="Institutional ID"
            name="institutionalId"
            value={form.institutionalId}
            onChange={handleChange}
            placeholder="11231xxxx (e.g. 112313062)"
            required
          />
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>
              New here?{" "}
              <Link to="/register" className="text-primary-300">
                Register
              </Link>
            </span>
            <Link to="/forgot" className="text-primary-300">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginPage;

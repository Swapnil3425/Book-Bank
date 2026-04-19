import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { useAuth } from "../hooks/useAuth";
import Toast from "../components/Toast";
import logo from "../assets/logo.png";

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
      <div className="mt-8 flex flex-col items-center justify-center">
        <Link to="/" className="mb-6 flex flex-col items-center gap-2">
          <img src={logo} alt="Book Bank Logo" className="h-16 w-16 object-contain" />
          <span className="text-xl font-bold tracking-tight text-slate-50">Book Bank</span>
        </Link>
        <form onSubmit={handleSubmit} className="card-glass w-full max-w-md space-y-5 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-50">
              Login to Portal
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Use your institutional ID and password provided at the time of
              registration.
            </p>
          </div>
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
            className="mt-6 flex w-full items-center justify-center btn-primary disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="flex justify-between items-center text-xs font-medium text-slate-400 pt-2 border-t border-slate-700/50">
            <span>
              New here?{" "}
              <Link to="/register" className="text-primary-600 hover:text-primary-700">
                Register
              </Link>
            </span>
            <Link to="/forgot" className="text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginPage;

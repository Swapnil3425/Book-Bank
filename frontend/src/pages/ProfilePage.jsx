import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Toast from "../components/Toast";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    course: user?.course || "",
    phone: user?.phone || ""
  });
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile(form);
      setToast({ message: "Profile updated", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Update failed",
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
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">My Profile</h2>
          <p className="text-xs text-slate-400">
            View and update your basic profile information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-glass max-w-md space-y-3 p-4 text-xs"
        >
          <div className="grid gap-3">
            <label className="flex flex-col gap-1">
              <span>Institutional ID</span>
              <input
                value={user.institutionalId}
                disabled
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Email</span>
              <input
                value={user.email}
                disabled
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Course / Branch</span>
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Phone</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-500"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-primary-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>
    </>
  );
};

export default ProfilePage;

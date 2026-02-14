import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { useAuth } from "../hooks/useAuth";
import Toast from "../components/Toast";
import api from "../api/axios";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    institutionalId: "",
    name: "",
    email: "",
    password: "",
    course: "",
    phone: ""
  });
  const [isMember, setIsMember] = useState(true);
  const [idPhoto, setIdPhoto] = useState(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleIdPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdPhoto(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!isMember && !idPhoto) {
        setToast({
          message: "Please upload an ID photo for verification",
          type: "error"
        });
        setLoading(false);
        return;
      }

      // Prepare registration data
      const payload = { ...form };
      // If user is not a member, generate a temporary institutionalId so backend validation passes.
      if (!isMember) {
        payload.institutionalId = `PENDING-${Date.now().toString().slice(-6)}`;
      }

      // Register user
      const userData = await register(payload);

      // If non-member, submit ID verification
      if (!isMember && idPhoto) {
        const formData = new FormData();
        formData.append("idPhoto", idPhoto);

        await api.post("/auth/submit-verification", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        setToast({
          message: "Registration successful! Your ID is pending verification by admin.",
          type: "success"
        });
      } else {
        setToast({ message: "Registration successful!", type: "success" });
      }

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Registration failed",
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
        <form onSubmit={handleSubmit} className="card-glass w-full max-w-2xl space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-50">
            Student Registration
          </h2>
          <p className="text-xs text-slate-400">
            Provide your details to get access to the Book Bank portal.
          </p>

          {/* Member Type Selection */}
          <div className="space-y-2 border-b border-slate-700 pb-4">
            <p className="text-sm font-medium text-slate-300">Are you a college member?</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="memberType"
                  checked={isMember}
                  onChange={() => setIsMember(true)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-400">Yes, I have an institutional ID</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="memberType"
                  checked={!isMember}
                  onChange={() => setIsMember(false)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-400">No, I need to submit ID for verification</span>
              </label>
            </div>

            {!isMember && (
              <div className="mt-3 inline-flex items-center gap-3 text-sm">
                <span className="px-2 py-1 rounded bg-amber-600 text-slate-900 font-semibold text-xs">Temporary ID</span>
                <span className="text-xs text-slate-400">We will assign a temporary ID like <code className="font-mono">PENDING-123456</code>. Admin will update your official institutional ID after verification.</span>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {isMember && (
              <FormInput
                label="Institutional ID"
                name="institutionalId"
                value={form.institutionalId}
                onChange={handleChange}
                placeholder="11231xxxx (e.g. 112313062)"
                required
              />
            )}
            <FormInput
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@email.com"
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
            <FormInput
              label="Course / Branch"
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="B.Tech CSE"
            />
            <FormInput
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91-XXXXXXXXXX"
            />
          </div>

          {/* ID Verification Section for Non-Members */}
          {!isMember && (
            <div className="space-y-3 border-t border-slate-700 pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Upload ID Photo (Aadhar/Passport/Voter ID)
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-4">
                  {idPhotoPreview ? (
                    <div className="space-y-2">
                      <img
                        src={idPhotoPreview}
                        alt="ID Preview"
                        className="max-h-48 rounded-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIdPhoto(null);
                          setIdPhotoPreview(null);
                        }}
                        className="w-full text-xs text-red-400 hover:text-red-300"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIdPhotoChange}
                        className="hidden"
                        required={!isMember}
                      />
                      <div className="text-center py-6">
                        <p className="text-sm text-slate-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </label>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  ℹ️ Your ID will be reviewed by admin. Access to library will be granted after approval.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
      </div>
    </>
  );
};

export default RegisterPage;

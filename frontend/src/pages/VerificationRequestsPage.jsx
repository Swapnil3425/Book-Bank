import { useEffect, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";

const VerificationRequestsPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selectedUser, setSelectedUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [rejectNotes, setRejectNotes] = useState("");

  useEffect(() => {
    fetchVerificationRequests();
  }, [filter]);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      const filtered = data.filter(
        (u) => u.verificationStatus === filter && u.idPhotoPath
      );

      // Add dummy rejection notes for rejected users without notes
      const withNotes = filtered.map((u) => {
        if (u.verificationStatus === "rejected" && !u.verificationNotes) {
          return {
            ...u,
            verificationNotes: "ID document quality is not clear or readable. Please resubmit with a clearer photo."
          };
        }
        return u;
      });

      setPendingUsers(withNotes);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to fetch verification requests",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setProcessing(true);
      await api.patch(`/admin/users/${userId}/verify`, {
        verificationStatus: "approved",
        verificationNotes: ""
      });
      setToast({
        message: "User approved successfully!",
        type: "success"
      });
      setSelectedUser(null);
      fetchVerificationRequests();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to approve user",
        type: "error"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (userId) => {
    if (!rejectNotes.trim()) {
      setToast({
        message: "Please provide rejection reason",
        type: "error"
      });
      return;
    }

    try {
      setProcessing(true);
      await api.patch(`/admin/users/${userId}/verify`, {
        verificationStatus: "rejected",
        verificationNotes: rejectNotes
      });
      setToast({
        message: "User rejected successfully!",
        type: "success"
      });
      setSelectedUser(null);
      setRejectNotes("");
      fetchVerificationRequests();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to reject user",
        type: "error"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, message: "" })}
      />
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">ID Verification Requests</h1>
          <p className="mt-1 text-sm text-slate-400">
            Review and approve/reject student ID verification submissions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-800">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${filter === status
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {pendingUsers.length})
            </button>
          ))}
        </div>

        {pendingUsers.length === 0 ? (
          <div className="card-glass p-8 text-center">
            <p className="text-slate-400">
              No {filter} verification requests found
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user) => (
              <div
                key={user._id}
                className="card-glass p-4 flex items-start justify-between hover:bg-slate-800/30 transition"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-50">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {user.institutionalId} · {user.email}
                  </p>
                  {user.course && (
                    <p className="text-xs text-slate-400">
                      {user.course}
                    </p>
                  )}
                  {user.verificationNotes && (
                    <p className="text-xs text-amber-300 mt-2">
                      📝 {user.verificationNotes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="px-3 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-slate-50 transition"
                  >
                    {user.idPhotoPath ? "View & Verify" : "View"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedUser && (
          <VerificationModal
            user={selectedUser}
            onClose={() => {
              setSelectedUser(null);
              setRejectNotes("");
            }}
            onApprove={() => handleApprove(selectedUser._id)}
            onReject={() => handleReject(selectedUser._id)}
            rejectNotes={rejectNotes}
            setRejectNotes={setRejectNotes}
            processing={processing}
          />
        )}
      </section>
    </>
  );
};

const VerificationModal = ({
  user,
  onClose,
  onApprove,
  onReject,
  rejectNotes,
  setRejectNotes,
  processing
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="card-glass w-full max-w-2xl p-6 rounded-lg my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-4">
          <h3 className="text-lg font-semibold text-cyan-300">
            ID Verification Review
          </h3>
          <button
            onClick={onClose}
            className="px-2 py-1 text-sm rounded-md bg-slate-800/80 text-slate-300 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="space-y-3 text-sm text-slate-200">
            <div>
              <p className="text-xs text-slate-400 uppercase">Name</p>
              <p className="text-slate-50 font-medium">{user.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase">Institutional ID</p>
                <p className="text-slate-50">{user.institutionalId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Email</p>
                <p className="text-slate-50">{user.email}</p>
              </div>
            </div>
            {user.course && (
              <div>
                <p className="text-xs text-slate-400 uppercase">Course</p>
                <p className="text-slate-50">{user.course}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 uppercase">Status</p>
              <span
                className={`inline-flex mt-1 items-center rounded-full px-2 py-1 text-xs font-semibold ${user.verificationStatus === "pending"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/40"
                    : user.verificationStatus === "approved"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : "bg-red-500/20 text-red-300 border border-red-400/40"
                  }`}
              >
                {user.verificationStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* ID Photo */}
          {user.idPhotoPath && (
            <div className="border-t border-slate-700 pt-4">
              <p className="text-xs text-slate-400 uppercase mb-3">ID Photo</p>
              <img
                src={`http://localhost:5000/${user.idPhotoPath}`}
                alt="Student ID"
                className="max-h-72 rounded-lg mx-auto border border-slate-700"
              />
            </div>
          )}

          {/* Action Buttons */}
          {user.verificationStatus === "pending" && (
            <div className="border-t border-slate-700 pt-4 space-y-3">
              {!showRejectForm ? (
                <>
                  <button
                    onClick={onApprove}
                    disabled={processing}
                    className="w-full px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-slate-50 text-sm font-medium disabled:opacity-50 transition"
                  >
                    {processing ? "Processing..." : "✓ Approve"}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={processing}
                    className="w-full px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-slate-50 text-sm font-medium disabled:opacity-50 transition"
                  >
                    ✗ Reject
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Reason for rejection (visible to user)..."
                    className="w-full rounded border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    rows="3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectNotes("");
                      }}
                      disabled={processing}
                      className="flex-1 px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-50 text-sm font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onReject}
                      disabled={processing || !rejectNotes.trim()}
                      className="flex-1 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-slate-50 text-sm font-medium disabled:opacity-50"
                    >
                      {processing ? "Processing..." : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationRequestsPage;

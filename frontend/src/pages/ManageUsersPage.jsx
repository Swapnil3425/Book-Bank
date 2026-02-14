import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to load users", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const courseOptions = Array.from(
    new Set(users.map((u) => u.course).filter(Boolean))
  );

  const filteredUsers = useMemo(
    () =>
      users
        .filter((u) => {
          if (courseFilter === "all") return true;
          return (u.course || "").toLowerCase() === courseFilter.toLowerCase();
        })
        .filter((u) => {
          if (statusFilter === "all") return true;
          if (statusFilter === "blocked") return u.isBlocked;
          if (statusFilter === "active") return !u.isBlocked;
          return true;
        })
        .filter((u) => {
          if (!search.trim()) return true;
          const q = search.toLowerCase();
          return (
            u.name.toLowerCase().includes(q) ||
            u.institutionalId.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
          );
        }),
    [users, courseFilter, statusFilter, search]
  );

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, message: "" })}
      />
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-cyan-300">Manage Users</h2>
          <p className="text-sm text-slate-400">
            View all student accounts, their status and borrowing summary.
          </p>
        </div>

        <div className="card-glass p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID or email..."
                className="input-glass w-60"
              />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="input-glass"
              >
                <option value="all">All courses</option>
                {courseOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-glass"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500">
              Showing {filteredUsers.length} of {users.length}
            </p>
          </div>

          <div className="max-h-[420px] overflow-auto text-sm mt-3">
            <table className="w-full text-left border-collapse table-glass">
              <thead>
                <tr className="text-xs text-cyan-300 border-b border-slate-700 uppercase">
                  <th className="px-3 py-2">Institutional ID</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Course</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className="hover:bg-slate-900/60 transition border-b border-slate-800 cursor-pointer"
                  >
                    <td className="px-3 py-2 text-slate-200">
                      {u.institutionalId}
                    </td>
                    <td className="px-3 py-2 text-slate-100">{u.name}</td>
                    <td className="px-3 py-2 text-slate-300">
                      {u.course || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-300">{u.email}</td>
                    <td className="px-3 py-2 text-right">
                      {u.isBlocked ? (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] font-semibold text-red-300 border border-red-400/30">
                          BLOCKED
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-400/30">
                          ACTIVE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-xs text-slate-500"
                    >
                      No users match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onUpdated={() => fetchUsers()}
            setToast={setToast}
          />
        )}
      </section>
    </>
  );
};

// ===== User Detail Modal =====
const UserDetailModal = ({ user, onClose, onUpdated, setToast }) => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchBorrows = async () => {
      try {
        const { data } = await api.get(`/admin/users/${user._id}/borrows`);
        setBorrows(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBorrows();
  }, [user._id]);

  const overdue = borrows.filter((b) => b.status === "overdue");

  const toggleBlock = async () => {
    try {
      setToggling(true);
      const { data } = await api.patch(`/admin/users/${user._id}/block`);
      setToast({
        message: data.isBlocked
          ? "User has been blocked."
          : "User has been unblocked.",
        type: "success",
      });
      onUpdated();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to update user status",
        type: "error",
      });
    } finally {
      setToggling(false);
    }
  };

  const sendOverdueMail = async () => {
    if (overdue.length === 0) return;
    try {
      setSending(true);
      await api.post(`/admin/users/${user._id}/notify-overdue`);
      setToast({
        message: "Overdue notification email sent.",
        type: "success",
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to send email",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    ><div
      className="relative top-[-6%] md:top-[-8%] flex items-center justify-center w-full"
    >
        <div
          className="card-glass w-full max-w-2xl p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
            <h4 className="text-cyan-300 font-semibold text-sm">User Details</h4>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-lg"
            >
              ✕
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-200">
            <p>
              <span className="text-slate-400">Name:</span> {user.name}
            </p>
            <p>
              <span className="text-slate-400">Institutional ID:</span>{" "}
              {user.institutionalId}
            </p>
            <p>
              <span className="text-slate-400">Email:</span> {user.email}
            </p>
            <p>
              <span className="text-slate-400">Course:</span> {user.course || "-"}
            </p>
            <p>
              <span className="text-slate-400">Status:</span>{" "}
              {user.isBlocked ? "Blocked" : "Active"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={toggleBlock}
              disabled={toggling}
              className="btn-primary"
            >
              {user.isBlocked ? "Unblock" : "Block"}
            </button>

            {overdue.length > 0 ? (
              <button
                onClick={sendOverdueMail}
                disabled={sending}
                className="btn-outline"
              >
                {sending ? "Sending..." : "Send Overdue Email"}
              </button>
            ) : (
              <span className="text-[12px] text-slate-400 mt-[2px]">
                No overdue books for this user.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;

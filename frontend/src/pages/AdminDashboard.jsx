import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { showToast } from "../utils/toastService";

const statusBadgeClass = (status) => {
  if (status === "overdue") {
    return "bg-red-500/20 text-red-300 border border-red-500/40";
  }
  if (status === "returned") {
    return "bg-slate-500/30 text-slate-200 border border-slate-500/40";
  }
  if (status === "cancelled") {
    return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40";
  }
  if (status === "pending") {
    return "bg-blue-500/20 text-blue-300 border border-blue-500/40";
  }
  return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
};

const fmt = (val) => {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);
  } catch (e) {
    return `Rs ${val || 0}`;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [sending, setSending] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [verificationCount, setVerificationCount] = useState(0);
  const [finesSummary, setFinesSummary] = useState({ totalFines: 0, pendingFines: 0, receivedFines: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: s }, { data: b }, { data: pending }, { data: verification }] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/borrows"),
          api.get("/admin/borrows?status=pending"),
          api.get("/admin/users?verificationStatus=pending"),
        ]);
        setStats({
          totalStudents: s.totalUsers,
          totalBooks: s.totalBooks,
          totalIssues: s.totalBorrows,
          overdue: s.overdue,
        });
        setBorrows(b);
        setPendingCount(pending.length);
        setVerificationCount(verification.length);
        // fetch fines summary
        try {
          const { data: fines } = await api.get("/admin/fines");
          setFinesSummary(fines.totals || { totalFines: 0, pendingFines: 0, receivedFines: 0 });
        } catch (e) {
          console.error("Failed to load fines summary", e);
        }
      } catch (err) {
        console.error("Error loading admin dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBorrows = useMemo(() => {
    return borrows
      .filter((bor) => {
        if (statusFilter === "all") return true;
        return bor.status === statusFilter;
      })
      .filter((bor) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          bor.book?.title.toLowerCase().includes(q) ||
          bor.student?.name.toLowerCase().includes(q) ||
          bor.student?.institutionalId.toLowerCase().includes(q)
        );
      });
  }, [borrows, statusFilter, search]);

  const handleCardClick = (type) => {
    if (type === "students") navigate("/admin/users");
    if (type === "books") navigate("/admin/books");
    if (type === "issues") navigate("/admin/reports");
    if (type === "overdue") navigate("/admin/reports?filter=overdue");
    if (type === "pending") navigate("/admin/pending-requests");
    if (type === "verification") navigate("/admin/verification-requests");
    if (type === "fines") navigate("/admin/fines");
  };

  if (loading || !stats) return <LoadingSpinner />;

  return (
    <section className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-semibold text-cyan-300">Admin Overview</h2>
        <p className="text-sm text-slate-400">
          Monitor inventory usage, pending returns and overdue accounts in one
          place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={() => handleCardClick("students")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-900/70 transition"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Registered Students
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-50">
            {stats.totalStudents}
          </p>
        </button>

        <button
          onClick={() => handleCardClick("books")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-900/70 transition"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Books in Inventory
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-50">
            {stats.totalBooks}
          </p>
        </button>

        <button
          onClick={() => handleCardClick("issues")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-900/70 transition"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Total Issues
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-50">
            {stats.totalIssues}
          </p>
        </button>

        <button
          onClick={() => handleCardClick("overdue")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-900/70 transition flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Overdue
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-50">
              {stats.overdue}
            </p>
          </div>
          {stats.overdue > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-1 text-[11px] font-semibold text-red-300 border border-red-400/40">
              Needs attention
            </span>
          )}
        </button>

        <button
          onClick={() => handleCardClick("pending")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-900/70 transition flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Pending Requests
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-50">
              {pendingCount}
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-1 text-[11px] font-semibold text-blue-300 border border-blue-400/40">
              Action needed
            </span>
          )}
        </button>

        <button
          onClick={() => handleCardClick("verification")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-900/70 transition flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              ID Verification
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-50">
              {verificationCount}
            </p>
          </div>
          {verificationCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-300 border border-amber-400/40">
              Pending
            </span>
          )}
        </button>

        <button
          onClick={() => handleCardClick("fines")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-900/70 transition"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Fines Pending</p>
          <p className="mt-2 text-3xl font-semibold text-slate-50">{fmt(finesSummary.pendingFines || 0)}</p>
        </button>
      </div>

      <div className="card-glass mt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
          <h3 className="text-sm font-semibold text-cyan-300">
            Latest Transactions
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by book or student..."
              className="input-glass w-52 md:w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-glass w-32 text-xs"
            >
              <option value="all">All statuses</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <ul className="divide-y divide-slate-800/80 text-sm max-h-[360px] overflow-y-auto scroll-glass">
          {filteredBorrows.length === 0 && (
            <li className="px-4 py-4 text-xs text-slate-400 text-center">
              No transactions matching your filters.
            </li>
          )}

          {filteredBorrows.map((b) => (
            <li
              key={b._id}
              onClick={() => setSelectedBorrow(b)}
              className="px-4 py-3 hover:bg-slate-900/70 cursor-pointer flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium text-slate-100">
                  {b.book?.title}{" "}
                  {b.book?.isbn && (
                    <span className="text-[11px] text-slate-400">
                      ({b.book.isbn})
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {b.student?.name || "-"} · Issue:{" "}
                  {new Date(b.issueDate).toLocaleDateString()} · Due:{" "}
                  {new Date(b.dueDate).toLocaleDateString()}
                </p>
              </div>
              <span
                className={
                  "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold " +
                  statusBadgeClass(b.status)
                }
              >
                {b.status.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {selectedBorrow && (
        <BorrowDetailModal
          borrow={selectedBorrow}
          onClose={() => setSelectedBorrow(null)}
          setSending={setSending}
          sending={sending}
          onStatusChanged={() => {
            setSelectedBorrow(null);
            // Refresh the data
            api.get("/admin/borrows").then(({ data }) => {
              setBorrows(data);
            });
          }}
        />
      )}
    </section>
  );
};

const BorrowDetailModal = ({ borrow, onClose, sending, setSending, onStatusChanged }) => {
  const issueDate = new Date(borrow.issueDate).toLocaleDateString();
  const dueDate = new Date(borrow.dueDate).toLocaleDateString();
  const returnDate = borrow.returnDate
    ? new Date(borrow.returnDate).toLocaleDateString()
    : null;
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const sendOverdueMail = async () => {
    try {
      setSending(true);
      await api.post(`/admin/users/${borrow.student._id}/notify-overdue`);
      showToast("Overdue email sent successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to send email.", "error");
    } finally {
      setSending(false);
    }
  };

  const confirmBorrow = async () => {
    try {
      setSending(true);
      const response = await api.patch(`/admin/borrows/${borrow._id}/confirm`, {
        status: "borrowed"
      });
      showToast("Book marked as borrowed successfully!", "success");
      if (onStatusChanged) {
        onStatusChanged();
      }
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to confirm borrow.", "error");
    } finally {
      setSending(false);
    }
  };

  const returnBorrow = async () => {
    try {
      setSending(true);
      await api.patch(`/admin/borrows/${borrow._id}/return`);
      showToast("Book marked as returned successfully!", "success");
      if (onStatusChanged) {
        onStatusChanged();
      }
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to mark book as returned.", "error");
    } finally {
      setSending(false);
    }
  };

  const cancelBorrow = async () => {
    if (!cancelReason.trim()) {
      showToast("Please provide a reason for cancellation", "error");
      return;
    }
    try {
      setSending(true);
      await api.patch(`/admin/borrows/${borrow._id}/cancel`, {
        cancellationReason: cancelReason
      });
      showToast("Borrow request cancelled successfully!", "success");
      if (onStatusChanged) {
        onStatusChanged();
      }
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to cancel borrow.", "error");
    } finally {
      setSending(false);
    }
  };

  const rejectBorrow = async () => {
    if (!cancelReason.trim()) {
      showToast("Please provide a reason for rejection", "error");
      return;
    }
    try {
      setSending(true);
      await api.patch(`/admin/borrows/${borrow._id}/reject`, {
        rejectionReason: cancelReason
      });
      showToast("Borrow request rejected successfully!", "success");
      if (onStatusChanged) {
        onStatusChanged();
      }
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to reject borrow.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card-glass w-full max-w-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2">
          <h4 className="text-sm font-semibold text-cyan-300">
            Transaction Details
          </h4>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs rounded-md bg-slate-800/80 text-slate-300 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-200">
          <div>
            <p className="text-[11px] text-slate-400 uppercase">Book</p>
            <p className="text-sm font-medium text-slate-50">
              {borrow.book?.title}
            </p>
            <p className="text-[11px] text-slate-400">
              {borrow.book?.author}{" "}
              {borrow.book?.course && `· ${borrow.book.course}`}
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400 uppercase">Student</p>
            <p className="text-sm font-medium text-slate-50">
              {borrow.student?.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {borrow.student?.institutionalId} · {borrow.student?.email}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[11px] text-slate-400">Issued</p>
              <p className="text-sm text-slate-50">{issueDate}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Due</p>
              <p className="text-sm text-slate-50">{dueDate}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Returned</p>
              <p className="text-sm text-slate-50">
                {returnDate || "Not yet"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] text-slate-400">Status</p>
            <span
              className={
                "inline-flex mt-1 items-center rounded-full px-2 py-1 text-[11px] font-semibold " +
                statusBadgeClass(borrow.status)
              }
            >
              {borrow.status.toUpperCase()}
            </span>
          </div>

          {borrow.cancellationReason && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
              <p className="text-[11px] text-yellow-300 font-semibold">Cancellation Reason:</p>
              <p className="text-xs text-yellow-200 mt-1">{borrow.cancellationReason}</p>
            </div>
          )}

          {borrow.status === "pending" && !showCancelForm && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={confirmBorrow}
                disabled={sending}
                className="flex-1 btn-primary"
              >
                {sending ? "Confirming..." : "Confirm Borrow"}
              </button>
              <button
                onClick={() => setShowCancelForm(true)}
                disabled={sending}
                className="flex-1 px-3 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-slate-50 disabled:opacity-50"
              >
                Reject/Cancel
              </button>
            </div>
          )}

          {showCancelForm && (
            <div className="space-y-2 mt-3">
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for rejection/cancellation..."
                className="w-full rounded border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCancelForm(false);
                    setCancelReason("");
                  }}
                  disabled={sending}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={() => rejectBorrow()}
                  disabled={sending || !cancelReason.trim()}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium bg-orange-600 hover:bg-orange-700 text-slate-50 disabled:opacity-50"
                >
                  {sending ? "Rejecting..." : "Reject"}
                </button>
                <button
                  onClick={cancelBorrow}
                  disabled={sending || !cancelReason.trim()}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-slate-50 disabled:opacity-50"
                >
                  {sending ? "Cancelling..." : "Cancel"}
                </button>
              </div>
            </div>
          )}

          {borrow.status === "borrowed" && (
            <button
              onClick={returnBorrow}
              disabled={sending}
              className="w-full mt-3 btn-primary"
            >
              {sending ? "Processing..." : "Mark as Returned"}
            </button>
          )}

          {borrow.status === "overdue" && (
            <button
              onClick={sendOverdueMail}
              disabled={sending}
              className="w-full mt-3 btn-primary"
            >
              {sending ? "Sending..." : "Send Overdue Mail"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

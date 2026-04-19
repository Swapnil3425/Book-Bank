import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { showToast } from "../utils/toastService";
import { formatDate } from "../utils/formatDate";

const statusBadgeClass = (status) => {
  if (status === "overdue") {
    return "bg-red-50 text-red-700 border border-red-200";
  }
  if (status === "returned") {
    return "bg-slate-800 text-slate-200 border border-slate-700";
  }
  if (status === "cancelled") {
    return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  }
  if (status === "pending") {
    return "bg-blue-50 text-blue-700 border border-blue-200";
  }
  return "bg-green-50 text-green-700 border border-green-200";
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
        <h2 className="text-2xl font-semibold text-primary-700">Admin Overview</h2>
        <p className="text-sm text-slate-400">
          Monitor inventory usage, pending returns and overdue accounts in one
          place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={() => handleCardClick("students")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-800/60 transition"
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
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-800/60 transition"
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
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-800/60 transition"
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
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-800/60 transition flex items-center justify-between"
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
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 border border-red-200">
              Needs attention
            </span>
          )}
        </button>

        <button
          onClick={() => handleCardClick("pending")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-800/60 transition flex items-center justify-between"
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
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 border border-blue-200">
              Action needed
            </span>
          )}
        </button>

        <button
          onClick={() => handleCardClick("verification")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-800/60 transition flex items-center justify-between"
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
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200">
              Pending
            </span>
          )}
        </button>

        <button
          onClick={() => handleCardClick("fines")}
          className="card-glass w-full text-left px-4 py-3 hover:bg-slate-800/60 transition flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Fines Pending</p>
            <p className="mt-2 text-3xl font-semibold text-slate-50">{fmt(finesSummary.pendingFines || 0)}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Collected</p>
             <p className="mt-1 text-lg font-semibold text-emerald-400">{fmt(finesSummary.receivedFines || 0)}</p>
          </div>
        </button>
      </div>

      <div className="card-glass mt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-primary-700">
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
              className="px-4 py-3 hover:bg-slate-800/60 cursor-pointer flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium text-slate-50">
                  {b.book?.title}{" "}
                  {b.book?.isbn && (
                    <span className="text-[11px] text-slate-400">
                      ({b.book.isbn})
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {b.student?.name || "-"} · Issue:{" "}
                  {formatDate(b.issueDate)} · Due:{" "}
                  {formatDate(b.dueDate)}
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
  const issueDate = formatDate(borrow.issueDate);
  const dueDate = formatDate(borrow.dueDate);
  const returnDate = borrow.returnDate
    ? formatDate(borrow.returnDate)
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
        <div className="flex items-center justify-between mb-2 border-b border-slate-700 pb-2">
          <h4 className="text-sm font-semibold text-primary-700">
            Transaction Details
          </h4>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700"
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

          <div className="flex justify-between items-center">
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
            
            {(borrow.status === "overdue" || borrow.fineAmount > 0) && (
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Fine Expected</p>
                <p className={`text-sm font-semibold mt-1 ${borrow.finePaid ? 'text-green-400' : 'text-red-400'}`}>
                   Rs {borrow.fineAmount || 0} {borrow.finePaid ? '(Paid)' : '(Pending)'}
                </p>
              </div>
            )}
          </div>

          {borrow.cancellationReason && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-[11px] text-yellow-700 font-semibold">Cancellation Reason:</p>
              <p className="text-xs text-yellow-800 mt-1">{borrow.cancellationReason}</p>
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
                className="w-full rounded border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
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
              className="w-full mt-3 btn-primary bg-emerald-600 hover:bg-emerald-700 font-semibold border-none"
            >
              {sending ? "Processing..." : "Mark as Returned"}
            </button>
          )}

          {borrow.status === "overdue" && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={returnBorrow}
                disabled={sending}
                className="flex-1 btn-primary bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs border-none"
              >
                {sending ? "..." : "Mark Returned"}
              </button>
              <button
                onClick={sendOverdueMail}
                disabled={sending}
                className="flex-1 btn-primary bg-blue-600 hover:bg-blue-700 font-semibold text-xs border-none"
              >
                {sending ? "Sending..." : "Send Mail"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

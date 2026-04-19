import { useEffect, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";
import { formatDate } from "../utils/formatDate";

const PendingBorrowsPage = () => {
  const [pendingBorrows, setPendingBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchPendingBorrows();
  }, []);

  const fetchPendingBorrows = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/borrows");
      const pending = data.filter((b) => b.status === "pending");
      setPendingBorrows(pending);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to fetch pending requests",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBorrow = async (borrowId) => {
    try {
      setConfirming(true);
      await api.patch(`/admin/borrows/${borrowId}/confirm`);
      setToast({
        message: "Borrow confirmed successfully!",
        type: "success"
      });
      setSelectedBorrow(null);
      fetchPendingBorrows();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to confirm borrow",
        type: "error"
      });
    } finally {
      setConfirming(false);
    }
  };

  const filteredBorrows = pendingBorrows.filter(
    (b) =>
      b.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.student?.institutionalId?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-50">Pending Borrow Requests</h1>
          <p className="mt-1 text-sm text-slate-400">
            Students waiting for books to be issued in person
          </p>
        </div>

        <div className="card-glass p-4">
          <input
            type="text"
            placeholder="Search by student name, ID, or book title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {filteredBorrows.length === 0 ? (
          <div className="card-glass p-8 text-center">
            <p className="text-slate-400">
              {pendingBorrows.length === 0
                ? "No pending borrow requests"
                : "No matching requests found"}
            </p>
          </div>
        ) : (
          <div className="card-glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-600 bg-slate-800/60">
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredBorrows.map((borrow) => (
                    <tr
                      key={borrow._id}
                      className="hover:bg-slate-800/60 transition"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-50">
                            {borrow.student?.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {borrow.student?.institutionalId}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-50">
                            {borrow.book?.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {borrow.book?.author}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatDate(borrow.dueDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700 border border-yellow-400/40">
                          {borrow.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedBorrow(borrow)}
                          className="px-3 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-slate-50 transition"
                        >
                          Confirm
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedBorrow && (
          <ConfirmBorrowModal
            borrow={selectedBorrow}
            onClose={() => setSelectedBorrow(null)}
            onConfirm={() => handleConfirmBorrow(selectedBorrow._id)}
            confirming={confirming}
          />
        )}
      </section>
    </>
  );
};

const ConfirmBorrowModal = ({ borrow, onClose, onConfirm, confirming }) => {
  const dueDate = formatDate(borrow.dueDate);
  const [rejectionFeedback, setRejectionFeedback] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleRejectBorrow = async () => {
    if (!rejectionFeedback.trim()) {
      setToast({ message: "Please provide feedback for rejection", type: "error" });
      return;
    }
    try {
      setRejecting(true);
      await api.patch(`/admin/borrows/${borrow._id}/reject`, {
        rejectionReason: rejectionFeedback
      });
      setToast({ message: "Borrow request rejected successfully!", type: "success" });
      onClose();
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || "Failed to reject borrow.", type: "error" });
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="card-glass w-full max-w-md p-6 rounded-lg my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-primary-700 mb-4">
          Confirm Book Issue
        </h3>
        <div className="space-y-4 mb-6 text-sm text-slate-300">
          <div>
            <p className="text-xs text-slate-400 uppercase">Student</p>
            <p className="font-medium text-slate-50 mt-1">
              {borrow.student?.name}
            </p>
            <p className="text-xs text-slate-400">
              {borrow.student?.institutionalId}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase">Book</p>
            <p className="font-medium text-slate-50 mt-1">
              {borrow.book?.title}
            </p>
            <p className="text-xs text-slate-400">
              {borrow.book?.author}
              {borrow.book?.isbn && ` · ISBN: ${borrow.book.isbn}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase">Return Due Date</p>
            <p className="font-medium text-slate-50 mt-1">{dueDate}</p>
          </div>
        </div>

        {!showRejectForm ? (
          <>
            <p className="text-xs text-slate-400 mb-6">
              Mark this request as confirmed? The book will be marked as borrowed and the student will be notified.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={confirming}
                className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-slate-50 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={onClose}
                disabled={confirming}
                className="px-4 py-2 text-sm rounded bg-slate-700 hover:bg-slate-600 text-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={confirming}
                className="px-4 py-2 text-sm rounded bg-emerald-600 hover:bg-emerald-700 text-slate-50 disabled:opacity-50"
              >
                {confirming ? "Confirming..." : "Confirm Borrow"}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Provide admin feedback for rejection:</p>
            <textarea
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              placeholder="Reason for rejection (will be sent to student)..."
              className="w-full rounded border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              rows="3"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionFeedback("");
                }}
                disabled={rejecting}
                className="px-4 py-2 text-sm rounded bg-slate-700 hover:bg-slate-600 text-slate-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleRejectBorrow}
                disabled={rejecting || !rejectionFeedback.trim()}
                className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-slate-50 disabled:opacity-50"
              >
                {rejecting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingBorrowsPage;

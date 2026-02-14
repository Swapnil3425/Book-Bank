import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { showToast } from "../utils/toastService";

const fmt = (val) => {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);
  } catch (e) {
    return `Rs ${val || 0}`;
  }
};

const AdminFinesPage = () => {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ totalFines: 0, pendingFines: 0, receivedFines: 0 });
  const [byStudent, setByStudent] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentFines, setStudentFines] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | received

  const fetch = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/fines");
      setTotals(data.totals || {});
      setByStudent(data.byStudent || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const filteredByStudent = useMemo(() => {
    return byStudent.filter((b) => {
      // status filter: if pending selected, student must have pending > 0
      if (statusFilter === "pending" && (!b.pending || b.pending === 0)) return false;
      if (statusFilter === "received" && (!b.received || b.received === 0)) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (b.student?.name || "").toLowerCase().includes(q) ||
        (b.student?.institutionalId || "").toLowerCase().includes(q)
      );
    });
  }, [byStudent, searchQuery, statusFilter]);

  const [expansionSearch, setExpansionSearch] = useState("");
  const [confirmCollect, setConfirmCollect] = useState(null);

  const filteredStudentFines = useMemo(() => {
    if (!expansionSearch.trim()) return studentFines;
    const q = expansionSearch.toLowerCase();
    return studentFines.filter((f) => (f.book?.title || "").toLowerCase().includes(q));
  }, [studentFines, expansionSearch]);

  // pagination for expanded fines
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const totalPages = Math.max(1, Math.ceil(filteredStudentFines.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pagedStudentFines = filteredStudentFines.slice((page - 1) * pageSize, page * pageSize);

  const loadStudentFines = async (studentId) => {
    try {
      setActionLoading(true);
      const { data } = await api.get(`/admin/users/${studentId}/borrows`);
      const fines = data.filter((b) => b.fineAmount && b.fineAmount > 0);
      setStudentFines(fines);
      setExpandedStudent(studentId);
    } catch (err) {
      console.error(err);
      showToast("Failed to load student fines", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const collectFine = async (borrowId) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/borrows/${borrowId}/fine/collect`);
      showToast("Fine collected", "success");
      await fetch();
      if (expandedStudent) await loadStudentFines(expandedStudent);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to collect fine", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const expandedStudentObj = useMemo(() => {
    return byStudent.find((b) => b._id === expandedStudent) || null;
  }, [byStudent, expandedStudent]);

  if (loading) return <LoadingSpinner />;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-cyan-300">Fines Overview</h2>
        <p className="text-sm text-slate-400">Summary of fines across the system.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-glass p-4">
          <p className="text-xs text-slate-400 uppercase">Total Fines</p>
          <p className="mt-2 text-2xl font-semibold">{fmt(totals.totalFines)}</p>
        </div>
        <div className="card-glass p-4">
          <p className="text-xs text-slate-400 uppercase">Pending</p>
          <p className="mt-2 text-2xl font-semibold">{fmt(totals.pendingFines)}</p>
        </div>
        <div className="card-glass p-4">
          <p className="text-xs text-slate-400 uppercase">Received</p>
          <p className="mt-2 text-2xl font-semibold">{fmt(totals.receivedFines)}</p>
        </div>
      </div>

      <div className="card-glass p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-100">Fines By Student</h3>
          <div className="flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or id..."
              className="input-glass text-sm w-52"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-glass text-sm w-36"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="received">Received</option>
            </select>
          </div>
        </div>

        <div className="max-h-[520px] overflow-auto">
          <table className="min-w-full text-xs">
            <thead className="text-slate-400 uppercase text-[11px] border-b border-slate-800 sticky top-0 bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">Student</th>
                <th className="px-3 py-2 text-left">Total</th>
                <th className="px-3 py-2 text-left">Pending</th>
                <th className="px-3 py-2 text-left">Received</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredByStudent.map((b) => (
                <tr key={b._id} className="border-b border-slate-800/60">
                  <td className="px-3 py-2">{b.student?.name} <div className="text-[11px] text-slate-500">{b.student?.institutionalId}</div></td>
                  <td className="px-3 py-2">{fmt(b.totalFines)}</td>
                  <td className="px-3 py-2">{fmt(b.pending)}</td>
                  <td className="px-3 py-2">{fmt(b.received)}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => loadStudentFines(b._id)}
                      className="btn-glass px-3 py-1 text-[12px] mr-2"
                      disabled={actionLoading}
                    >
                      View fines
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        { /* Drawer/Modal on the right for expanded student fines */ }
      </div>

      {expandedStudent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setExpandedStudent(null)}>
          <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] p-4 flex flex-col border border-slate-800" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-50">{expandedStudentObj?.student?.name || "Student"}</h4>
                <div className="text-xs text-slate-400">{expandedStudentObj?.student?.institutionalId}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setExpandedStudent(null)} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-50">✕</button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                value={expansionSearch}
                onChange={(e) => { setExpansionSearch(e.target.value); setPage(1); }}
                placeholder="Search inside fines by book title..."
                className="input-glass text-sm flex-1"
              />
              <div className="flex flex-col items-end gap-1">
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="input-glass text-sm w-24"
                  aria-label="Items per page"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <div className="text-xs text-slate-400">Items per page</div>
              </div>
            </div>

            <div className="mt-4 flex-1 overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-slate-400">Student Total</div>
                  <div className="text-2xl font-semibold">{fmt(expandedStudentObj?.totalFines || 0)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Pending</div>
                  <div className="text-2xl font-semibold">{fmt(expandedStudentObj?.pending || 0)}</div>
                </div>
              </div>

              <div className="space-y-3">
                {pagedStudentFines.length === 0 && (
                  <div className="text-xs text-slate-400">No fines match your search.</div>
                )}

                {pagedStudentFines.map((f) => {
                  const due = f.dueDate ? new Date(f.dueDate) : null;
                  const isOverdue = due && (Date.now() > due.getTime());
                  const daysOverdue = isOverdue ? Math.floor((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  return (
                    <div key={f._id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-slate-50">{f.book?.title}</div>
                          <div className="text-[12px] text-slate-400">Issued: {new Date(f.issueDate).toLocaleDateString()}</div>
                          {isOverdue && (
                            <div className="text-[12px] text-amber-300 mt-1">Overdue: {new Date(f.dueDate).toLocaleDateString()} ({daysOverdue} days)</div>
                          )}
                        </div>
                        <div className="ml-3 text-right flex-shrink-0">
                          <div className="text-sm text-slate-400">{f.finePaid ? "Collected" : "Pending"}</div>
                          <div className="text-2xl font-semibold mt-1">{fmt(f.fineAmount)}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end">
                        {!f.finePaid && (
                          <button
                            onClick={() => setConfirmCollect({ borrowId: f._id, title: f.book?.title, amount: f.fineAmount })}
                            className="rounded-md bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-[13px] font-medium"
                            disabled={actionLoading}
                          >
                            {actionLoading ? "Processing..." : "Mark Collected"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="text-xs text-slate-400">Page {page} of {totalPages}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-50 text-xs"
                    >Prev</button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-50 text-xs"
                    >Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmCollect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => !actionLoading && setConfirmCollect(null)}>
          <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-md p-4 border border-slate-800" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-sm font-semibold">Confirm Collection</h4>
            <p className="text-sm text-slate-300 mt-2">Are you sure you want to mark <strong>{confirmCollect.title}</strong> — <span className="font-medium">{fmt(confirmCollect.amount)}</span> — as collected?</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={async () => {
                  await collectFine(confirmCollect.borrowId);
                  setConfirmCollect(null);
                }}
                disabled={actionLoading}
                className="flex-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 text-sm font-medium"
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmCollect(null)}
                disabled={actionLoading}
                className="flex-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminFinesPage;
